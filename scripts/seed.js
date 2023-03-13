const PostSchema = require("../server/models/post.model");
const UserSchema = require("../server/models/user.model");
const TagSchema = require('../server/models/tag.model');
const { ObjectId } = require("mongodb");
const { faker } = require('@faker-js/faker');
const jwt = require("jsonwebtoken");
const path = require('path');
var fs = require('fs');

require("dotenv").config({
  path: path.join(__dirname, "../environment/.env.server")
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

const seedPosts = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed_data.json'),'utf8'));

seedPosts.forEach(function (post) {
  post.section = post.section.toLowerCase()
});

console.log(seedPosts);

const addedTags = new Set();


// We create an array of Unique tags.
const seedTags = seedPosts.reduce((accumulator, post) => {
  post.tags.forEach(tag => {
    if (!addedTags.has(tag)) {
      accumulator.push({ title: tag, slug: slugify(tag) });
      addedTags.add(tag);
    }
  });
  return accumulator;
}, []);


const userOneId = new ObjectId();
const userTwoId = new ObjectId();
const userThreeId = new ObjectId();

const seedUsers = [
  {
    _id: userOneId,
    name: "Ángel",
    email: "angel.casas@protonmail.com",
    password: "123456789",
    token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET).toString(),
    role: "admin"
  },
  {
    _id: userTwoId,
    name: faker.name.firstName(),
    email: "user@test.com",
    password: "test1234"
  },
  {
    _id: userThreeId,
    name: faker.name.firstName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    token: jwt.sign({ _id: userThreeId }, process.env.JWT_SECRET).toString()
  }
];

const populateTags = async () => {
  await TagSchema.deleteMany();
  const tags = await TagSchema.insertMany(seedTags);
  return tags;
};

const populatePosts = async () => {
  const tags = await populateTags();
  await PostSchema.deleteMany();

  seedPosts[0].tags = [];
  seedPosts[0].tags.push(tags[0]);
  seedPosts[0].tags.push(tags[1]);
  
  seedPosts[1].tags = [];
  seedPosts[1].tags.push(tags[0]);
  seedPosts[1].tags.push(tags[2]);
  
  seedPosts[2].tags = [];
  seedPosts[2].tags.push(tags[0]);
  seedPosts[2].tags.push(tags[1]);

  seedPosts[3].tags = [];
  seedPosts[3].tags.push(tags[1]);
  seedPosts[3].tags.push(tags[2]);
  
  const posts = await PostSchema.insertMany(seedPosts);
  
  tags[0].posts.push(posts[0]._id);
  tags[0].posts.push(posts[1]._id);
  tags[0].posts.push(posts[2]._id);
  tags[1].posts.push(posts[0]._id);
  tags[1].posts.push(posts[2]._id);
  tags[1].posts.push(posts[3]._id);
  tags[2].posts.push(posts[1]._id);
  tags[2].posts.push(posts[3]._id);
  
  await Promise.all(tags.map(tag => tag.save()));

  return posts;
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
  seedTags
};
