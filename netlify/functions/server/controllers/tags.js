const TagSchema = require('../models/tag.model');

/**
 * Tries to retrieve all the tags in the DB.
 * If there's an error, returns a 404 status if tag not found, otherwise returns status code 505 internal server error.
 * @param {object} req - The HTTP request object.
 * @param {object} res - The HTTP response object.
 * @return {object} Return a Object with the tags.
 */
exports.getTagList = async (req, res) => {
    try {
        // Find all tags in the database and populate their 'posts' field
        const tags = await TagSchema.find({}).populate('posts');
        // If no tags are found or the array is empty, send a 404 response
        if (!tags || !tags.length) {
            return res.status(404).send();
        }
        // If tags are found, log a success message and send the list of tags
        console.info('--Successfully retrieved all tags.');
        res.send({ tags });
    } catch (err) {
        // If an error occurs, log it and send a 500 response
        console.error(err);
        res.status(500).send();
    }
};

/**
 * Tries to retrieve a specific tag in the DB.
 * If the tag is not found, returns a 404 status code, otherwise returns the tag and a 200 status code.
 * @param {object} req - The HTTP request object containing the tag slug.
 * @param {object} res - The HTTP response object.
 * @return {object} Returns a JSON object with the tag data.
 */
exports.getTag = async (req, res) => {
    try {
        // Find the tag in the database by the slug and populate its 'posts' field
        const tag = await TagSchema.findOne({ "slug": req.params.tag }).populate({ path: 'posts', populate: { path: 'tags' }});
        // If the tag is not found, send a 404 response
        if (!tag) {
            return res.status(404).send();
        }
        // If the tag is found, log a success message and send the tag
        console.info("--Successfully retrieved specific tag.");
        res.send({ tag });
    } catch (err) {
        // If an error occurs, log it and send a 500 response
        console.error(err);
        res.status(500).send();
    }
};

/**
 * Tries to create a new tag in the DB.
 * If there's an error, returns a 400 status with a message.
 * @param {object} req - The HTTP request object.
 * @param {object} res - The HTTP response object.
 * @return {object} Returns the new tag object.
 */
exports.createTag = async (req, res) => {
    // Get the title and slug from the request body
    const { title, slug } = req.body;
    // Create a new tag object
    const tag = new TagSchema({ title, slug });
    try {
        // Save the tag to the DB and get the saved document
        const doc = await tag.save();
        // Log a success message and send the saved tag object
        console.info('--Successfully created new tag.');
        res.send({ tag: doc });
    } catch (err) {
        // If an error occurs, log it and send a 400 response with an error message
        res.status(400).send({ message: 'Failed to save new tag.' });
    }
};

/**
 * Deletes all orphaned tags from the database.
 * An orphaned tag is a tag that has no posts associated with it.
 * If there's an error, returns a status code 400 bad request with an error message.
 * @param {object} req - The HTTP request object.
 * @param {object} res - The HTTP response object.
 * @return {object} Returns a success message.
 */
exports.removeOrphans = async (req, res) => {
    try {
        // Find all tags in the database and populate their 'posts' field
        const tags = await TagSchema.find().populate('posts');
        // Iterate through each tag, and delete it if it has no associated posts
        tags.forEach(async tag => {
            if (!tag.posts.length) {
                await TagSchema.deleteOne({ _id: tag._id });
            }
        });
        // If the operation is successful, log a success message and send a response
        console.info('--Successfully deleted orphan tags.');
        res.json({ message: 'Deleted orphan tags successfully' });
    } catch (err) {
    // If an error occurs, log it and send a 400 response with an error message
    console.error(err);
    res.status(400).send({ message: 'Failed to remove orphan tags.' });
    }
};