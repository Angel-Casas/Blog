const PostSchema = require('../models/post.model');
const CommentSchema = require('../models/comment.model');
const TagSchema = require('../models/tag.model');
const { ObjectId } = require('mongodb');

/**
 * Retrieve all the posts from the DB.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @return {Object} - An object containing a list of posts.
 */
exports.list = async (req, res) => {
    try {
        // Retrieve all posts from the database and populate their tags
        const posts = await PostSchema.find().populate('tags');
        console.info('--Returning list of posts.');
        // Send a response containing the list of posts
        res.send({ posts });
    } catch (err) {
        // If there is an error, send a 500 internal server error response
        res.status(500).send();
    }
};

/**
 * Create a new post in the DB.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @return {Object} - An object containing the newly created post.
 */
exports.create = async (req, res) => {
    // Extract necessary information from the request body
    const { title, body, preview, cover, titulo, cuerpo, previo, section, tags } = req.body;
    try {
        // Create a new post using the extracted information
        const docPost = await createPost({ title, body, preview, cover, titulo, cuerpo, previo, section });

        // Create an array to hold the post's tags
        const tagList = [];

        // Iterate over the tags included in the request body
        for (let tag of tags) {
            // Try to find an existing tag with a matching slug
            let elem = await TagSchema.findOne({ slug: tag.slug });
            if (elem) {
                // If a matching tag exists, add it to the tag list
                tagList.push(elem);
            } else {
                // If a matching tag doesn't exist, create a new tag and add it to the tag list
                tagList.push(await createTag(tag));
            }
        }

        // Iterate over the tags in the tag list
        for (let tag of tagList) {
            // Add the post to the tag's list of posts
            await addPostToTag(tag._id, docPost._id);
            // Add the tag to the post's list of tags
            await addTagToPost(docPost._id, tag._id);
        }

        console.info('--Successfully created new post.');
        // Send a response containing the newly created post
        res.send({ post: docPost });
    } catch (err) {
        // If there is an error, send a 400 Bad Request response with an error message
        res.status(400).send({ message: 'Failed to save new post.' });
    }
};

/**
 * Retrieve a specific post from the DB.
 * @param {Object} req - The HTTP request object containing the ID of the post to retrieve.
 * @param {Object} res - The HTTP response object.
 * @return {Object} - An object containing the specified post.
 */
exports.read = async (req, res) => {
    // Check if the provided ID is a valid MongoDB ObjectID
    if (!ObjectId.isValid(req.params.id)) {
        // If the ID is not valid, return a 404 Not Found response
        return res.status(404).send();
    }
    try {
        // Find the post with the specified ID, and populate its comments and tags
        const post = await PostSchema.findById(req.params.id).populate('comments').populate('tags');
        if (post) {
            console.info('Successfully retrieved specific post.');
            // Send a response containing the specified post
            res.send({ post });
        } else {
            // If no post is found with the specified ID, return a 404 Not Found response
            res.status(404).send();
        }
    } catch (err) {
        // If there is an error, send a 500 Internal Server Error response with the error object
        res.status(500).send(err);
    }
};

/**
 * Retrieve all the posts from the DB that belong to a specific section.
 * @param {Object} req - The HTTP request object containing the section to retrieve posts for.
 * @param {Object} res - The HTTP response object.
 * @return {Object} - An object containing all the posts in the specified section.
 */
exports.readSection = async (req, res) => {
    try {
        // Find all posts in the specified section, and populate their tags
        const posts = await PostSchema.find({ section: req.params.section }).populate('tags');
        if (posts && posts.length) {
            console.info(`--Successfully retrieved all posts from ${req.params.section}.`);
            // Send a response containing all the posts in the specified section
            res.send({ posts });
        } else {
            // If no posts are found in the specified section, return a 404 Not Found response
            res.status(404).send();
        }
    } catch (err) {
        // If there is an error, send a 500 Internal Server Error response with the error object
        res.status(500).send(err);
    }
};


/**
 * Update a post in the DB.
 * @param {Object} req - The HTTP request object containing the post ID and updated information.
 * @param {Object} res - The HTTP response object.
 * @return {Object} - The updated post.
 */
exports.update = async (req, res) => {
    // Check if the provided ID is a valid MongoDB ObjectID
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(404).send();
    }
    // Extract data from request body
    const { title, body, preview, date, cover, titulo, cuerpo, previo, section, tags } = req.body;
    try {
        // Find the post to update
        let currentPost = await PostSchema.findOne({ _id: req.params.id }).populate('tags');
        // If tags are provided, remove the post from tags that are not in the new list
        if (tags && tags.length) {
            for (let tag of currentPost.tags) {
                slugExists = tags.some(tagItem => tagItem.slug === tag.slug);
                if (!slugExists) {
                    removePostFromTag(tag.id, currentPost.id);
                    // Check if there exists any tags not associated with any post and delete them.
                    removeOrphanTags(tag.slug);
                }
            }
        }
        // Update the post with new data
        const docPost = await PostSchema.findOneAndUpdate(
            { _id: req.params.id },
            { title, body, preview, cover, section, date, tags: [] },
            { new: true }
        );
        // Add the post to any new tags or update existing ones
        const tagList = [];
        if (tags && tags.length) {
            for (let tag of tags) {
                let elem = await TagSchema.findOne({ slug: tag.slug });
                if (elem) {
                    tagList.push(elem);
                } else {
                    tagList.push(await createTag(tag));
                }
            }
            for (let tag of tagList) {
                const bool = await checkIfPostExistsInTag(docPost._id, tag._id);
                if (!bool) {
                    await addPostToTag(tag._id, docPost._id);
                }
                await addTagToPost(docPost._id, tag._id);
            }
        }
        console.info('--Successfully updated post.');
        // Return the updated post
        docPost ? res.send({ post: docPost }) : res.status(404).send();
    } catch (err) {
        // Internal server error 500
        res.status(500).send(err);
    }
};

/**
 * Deletes a blog post by its ID.
 * If the ID is not valid, returns a 404 status.
 * If the post is successfully deleted, returns a 200 status with a JSON response.
 * If the post does not exist, returns a 404 status.
 * If there's an error, returns a 500 status.
 *
 * @param {object} req - The HTTP request object containing the post ID.
 * @param {object} res - The HTTP response object.
 * @return {object} Return a JSON response with a message and the deleted post.
 */
exports.delete = async (req, res) => {
    // Check if the provided ID is a valid MongoDB ObjectID
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(404).send();
    }
    try {
        // Find the post by its ID and remove it from the database
        const post = await PostSchema.findByIdAndRemove(req.params.id);
        if (post) {
            // If the post was successfully deleted, return a JSON response with a message and the deleted post
            console.info('Successfully deleted post.');
            res.json({ message: 'Blog post deleted successfully', post });
        } else {
            // If the post doesn't exist, return a 404 status
            res.status(404).send();
        }
    } catch (err) {
        // If there's an error, return a 500 status
        res.status(500).send();
    }
};

/**
 * Creates a new comment on a blog post with the given post ID.
 * If either the name or body field is empty, returns a 400 status.
 * If the ID is not valid, returns a 404 status.
 * If the comment is successfully created and added to the post, returns a 200 status with a JSON response.
 * If the post does not exist, returns a 404 status.
 * If there's an error, returns a 400 status with an error message.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @return {object} Returns a JSON response with the newly created comment on the post.
 */
exports.createCommentOnPost = async (req, res) => {
    const { name, body, postId } = req.body;

    // Check if required fields are not empty
    if (!name.trim() || !body.trim()) {
        return res.status(400).send();
    }

    // Check if the provided ID is a valid MongoDB ObjectID
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(404).send();
    }

    try {
        // Create a new comment with the given name and body
        const comment = await CommentSchema.create({ name, body });

        // Add the new comment to the post with the given postId
        const post = await addCommentToPost(postId, comment._id);

        // If the post does not exist, return a 404 error
        if (!post) {
            return res.status(404).send();
        }

        // Send a success response with the new comment
        console.info('--Successfully created a new comment on post.');
        res.send({ comment: post.comments[post.comments.length-1] });
    } catch (err) {
        // If there is an error, send a 400 response with an error message
        res.status(400).send({ message: 'Failed to save new comment.' });
    }
};

/**
 * Deletes a comment on a post by its ID.
 * If the ID is not valid, returns a 404 status.
 * If the comment is successfully deleted, returns a 200 status with a JSON response.
 * If the comment does not exist, returns a 404 status.
 * If there's an error, returns a 500 status.
 * @param {object} req - The HTTP request object with the comment ID.
 * @param {object} res - The HTTP response object.
 * @return {object} Return a JSON response with a message and the deleted comment.
 */
exports.deleteCommentOnPost = async (req, res) => {
    // Check if the provided ID is a valid MongoDB ObjectID
    if (!ObjectId.isValid(req.body.commentId)) {
    return res.status(404).send();
    }
    
    try {
        // Find and remove the comment from the database
        const comment = await CommentSchema.findByIdAndRemove(req.body.commentId);
        if (comment) {
            // If the comment is successfully deleted, send a success message with the deleted comment
            console.info('--Successfully deleted comment on post.');
            res.json({ message: 'Comment deleted successfully', comment });
        } else {
            // If the comment doesn't exist, return a 404 status
            res.status(404).send();
        }
    } catch (err) {
        // If there's an error, return a 500 status
        res.status(500).send();
    }
};

/**
 * Deletes a comment on a blog post by its comment ID.
 * If the comment ID is not valid, returns a 404 status.
 * If the comment is successfully deleted, returns a 200 status with a JSON response.
 * If the comment does not exist, returns a 404 status.
 * If there's an error, returns a 500 status.
 * @param {object} req - The HTTP request object with the comment ID.
 * @param {object} res - The response object.
 * @return {object} Return a JSON response with a message and the deleted comment.
 */
exports.deleteCommentOnPost = async (req, res) => {
    // Check if the provided ID is a valid MongoDB ObjectID
    if (!ObjectId.isValid(req.body.commentId)) {
        return res.status(404).send();
    }
    try {
        // Remove the comment from the database
        const comment = await CommentSchema.findByIdAndRemove(req.body.commentId);
        // If the comment is deleted, send a success message and the deleted comment in the response
        if (comment) {
            console.info('--Successfully deleted comment on post.');
            res.json({ message: 'Comment deleted successfully', comment });
        } else {
            // If the comment does not exist, send a 404 status
            res.status(404).send();
        }
    } catch (err) {
        // If there's an error, send a 500 status
        res.status(500).send();
    }
};

/**
 * Approves a comment on a blog post by its comment ID.
 * If the comment ID is not valid, returns a 404 status.
 * If the comment is successfully approved, returns a 200 status with a JSON response.
 * If the comment does not exist, returns a 404 status.
 * If there's an error, returns a 500 status with an error message.
 * @param {object} req - The HTTP request object with the comment ID.
 * @param {object} res - The HTTP response object.
 * @return {object} Return a JSON response with the approved comment.
 */
exports.approveComment = async (req, res) => {
    // Check if the provided ID is a valid MongoDB ObjectID
    if (!ObjectId.isValid(req.body.commentId)) {
        return res.status(404).send();
    }
    try {
        // Find the comment by ID and update the "approved" field to true
        const comment = await CommentSchema.findOneAndUpdate(
            { _id: req.body.commentId },
            { approved: true },
            { new: true }
        );
        if (comment) {
            // Log success message and send the updated comment
            console.info('Successfully approved comment on post.');
            res.send({ comment });
        } else {
            // Comment not found, return 404 status
            res.status(404).send();
        }
    } catch (err) {
        // Server error, return 500 status with error message
        res.status(500).send(err);
    }
};

/**
 * Creates a new blog post.
 * @param {object} post - The post object containing the information of the post.
 * @returns {object} The new created post.
 */
const createPost = function(post) {
    return PostSchema.create(post).then(docPost => {
        return docPost;
    });
};

/**
 * Creates a new tag.
 * @param {object} tag - The tag object containing the information of the tag.
 * @returns {object} The new created tag.
 */
const createTag = function(tag) {
    return TagSchema.create(tag).then(doc => {
        return doc;
    });
};

/**
 * Removes an orphan tag.
 * If the tag does not have any posts, it will be deleted.
 * @param {string} slug - The slug of the tag.
 */
const removeOrphanTags = async function(slug) {
    const tag = await Tag.findByOne({ slug: slug });

    if (tag) {
        if (!tag.posts.length) {
        await TagSchema.deleteOne({_id: tag._id});
        }
    }
};

/**
 * Checks if a post exists in a tag.
 * @param {string} postId - The ID of the post.
 * @param {string} tagId - The ID of the tag.
 * @returns {boolean} Whether or not the post exists in the tag.
 */
const checkIfPostExistsInTag = async (postId, tagId) => {
    const tag = await TagSchema.findById(tagId).populate('posts');
    let exists = false;
    tag.posts.forEach(post => {
        if (post.id === postId.toString()) {
            exists = true;
        }
    });
    return exists;
}

/**
 * Adds a post to a tag.
 * @param {string} tagId - The ID of the tag.
 * @param {string} postId - The ID of the post.
 * @returns {object} The updated tag object.
 */
const addPostToTag = function(tagId, postId) {
    return TagSchema.findByIdAndUpdate(
        tagId,
        { $push: { posts: postId } },
        { new: true, useFindAndModify: false }
    ).populate('posts');
};


/**
 * Removes a post from a given tag.
 * @param {string} tagId - The ID of the tag.
 * @param {string} postId - The ID of the post.
 * @returns {object} The updated tag object.
 */
const removePostFromTag = async function(tagId, postId) {
    try {
      // Find the tag with the given ID
      const tag = await TagSchema.findById(tagId);
      if (!tag) {
        throw new Error('Tag not found');
      }
      // Find the post with the given ID
      const post = await PostSchema.findById(postId);
      if (!post) {
        throw new Error('Post not found');
      }
      // Remove the post ID from the tag's posts array
      tag.posts.pull(postId);
      // Save the updated tag
      await tag.save();
      // Return the updated tag object
      return tag;
    } catch (error) {
      throw error;
    }
}

/**
 * Adds a tag to a post.
 * @param {string} postId - The ID of the post.
 * @param {string} tagId - The ID of the tag.
 * @returns {object} The updated post object.
 */
const addTagToPost = function(postId, tagId) {
    return PostSchema.findByIdAndUpdate(
        postId,
        { $push: { tags: tagId } },
        { new: true, useFindAndModify: false }
    ).populate('tags');
};

/**
 * Adds a comment to a post.
 * @param {string} postId - The ID of the post.
 * @param {string} commentId - The ID of the comment.
 * @returns {object} The updated post object.
 */
const addCommentToPost = function(postId, commentId) {
    return PostSchema.findByIdAndUpdate(
        postId,
        { $push: { comments: commentId } },
        { new: true, useFindAndModify: false }
    ).populate('comments');
};