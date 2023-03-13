const PostSchema = require('../../../server/models/post.model');
const UserSchema = require('../../../server/models/user.model');
const CommentSchema = require('../../../server/models/comment.model');
const TagSchema = require('../../../server/models/tag.model');
const TagController = require('../../../server/controllers/tags');
const PostController = require('../../../server/controllers/posts');
const { ObjectId } = require('mongodb');
const { faker } = require('@faker-js/faker');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config({
  path: '../../../environment/.env.server'
});

function slugify(str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();
  
  // remove accents, swap ñ for n, etc
  const from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  const to   = "aaaaeeeeiiiioooouuuunc------";
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }
  
  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
           .replace(/\s+/g, '-') // collapse whitespace and replace by -
           .replace(/-+/g, '-'); // collapse dashes
  
  return str;
}

const seedPosts = [
  {
    section: 'Nature',
    comments: [],
    tags: [],
    _id: new ObjectId()
  },
  {
    section: 'Math',
    comments: [],
    tags: [],
    _id: new ObjectId()
  },
  {
    section: 'Math',
    comments: [],
    tags: [],
    _id: new ObjectId()
  }
];

let updatedSeedPosts = JSON.parse(JSON.stringify(seedPosts));

const seedComments = [
  {
    name: faker.name.firstName(),
    body: faker.lorem.sentence()
  },
  {
    name: faker.name.firstName(),
    body: faker.lorem.sentence()
  },
  {
    name: faker.name.firstName(),
    body: faker.lorem.sentence()
  },
  {
    name: faker.name.firstName(),
    body: faker.lorem.sentence()
  },
  {
    name: faker.name.firstName(),
    body: faker.lorem.sentence()
  },
];

const tagTitles = ['Mathematics', 'Geometry', 'Nature', 'Climate Change', 'Science'];

const seedTags = [
  {
    title: tagTitles[0],
    slug: slugify(tagTitles[0])
  },
  {
    title: tagTitles[1],
    slug: slugify(tagTitles[1])
  },
  {
    title: tagTitles[2],
    slug: slugify(tagTitles[2])
  },
  {
    title: tagTitles[3],
    slug: slugify(tagTitles[3])
  },
  {
    title: tagTitles[4],
    slug: slugify(tagTitles[4])
  }
];

const userOneId = new ObjectId();
const userTwoId = new ObjectId();
const userThreeId = new ObjectId();

const seedUsers = [
  {
    _id: userOneId,
    name: faker.name.firstName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET).toString(),
    role: 'admin'
  },
  {
    _id: userTwoId,
    name: faker.name.firstName(),
    email: faker.internet.email(),
    password: faker.internet.password()
  },
  {
    _id: userThreeId,
    name: faker.name.firstName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    token: jwt.sign({ _id: userThreeId }, process.env.JWT_SECRET).toString()
  }
];

const populateComments = async () => {
  await CommentSchema.deleteMany();
  const comments = await CommentSchema.insertMany(seedComments);
  return comments;
};

const populateTags = async () => {
  await TagSchema.deleteMany();
  const tags = await TagSchema.insertMany(seedTags);
  return tags;
};

const populatePosts = async () => {
  updatedSeedPosts = JSON.parse(JSON.stringify(seedPosts));
  const comments = await populateComments();
  const tags = await populateTags();
  await PostSchema.deleteMany();
  
  updatedSeedPosts[0].tags.push(tags[2]);
  updatedSeedPosts[0].comments.push(comments[0]);
  
  updatedSeedPosts[1].tags.push(tags[0]);
  updatedSeedPosts[1].tags.push(tags[1]);
  updatedSeedPosts[1].tags.push(tags[2]);
  updatedSeedPosts[1].comments.push(comments[1]);
  updatedSeedPosts[1].comments.push(comments[2]);
  
  updatedSeedPosts[2].tags.push(tags[2]);
  updatedSeedPosts[2].tags.push(tags[3]);
  updatedSeedPosts[2].tags.push(tags[4]);
  updatedSeedPosts[2].comments.push(comments[3]);
  updatedSeedPosts[2].comments.push(comments[4]);
  
  const posts = await PostSchema.insertMany(updatedSeedPosts);
  
  tags[0].posts.push(posts[1]._id);
  tags[1].posts.push(posts[1]._id);
  tags[2].posts.push(posts[0]._id);
  tags[2].posts.push(posts[1]._id);
  tags[2].posts.push(posts[2]._id);
  tags[3].posts.push(posts[2]._id);
  tags[4].posts.push(posts[2]._id);
  
  await Promise.all(tags.map(tag => tag.save()));
};

const populateUsers = async () => {
  await UserSchema.deleteMany();
  await new UserSchema(seedUsers[0]).save();
  await new UserSchema(seedUsers[1]).save();
  await new UserSchema(seedUsers[2]).save();
};

module.exports = {
  seedPosts,
  populatePosts,
  seedUsers,
  populateUsers,
  seedComments,
  seedTags
};
