const seed = require("./seed");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../environment/.env")
});

const { MONGO_DB_URI, DB_NAME } = process.env;

mongoose.connect(`${MONGO_DB_URI}/${DB_NAME}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

(async () => {
  try {
    await seed.populateUsers();
    console.log("Successfully seeded user accounts");
    const posts = await seed.populatePosts();
    console.log(`Successfully seeded ${posts.length} posts`);
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
})();
