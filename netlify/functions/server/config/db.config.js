const { MONGO_DB_URI, DB_NAME, DB_NAME_TEST } = process.env;

const dbName = process.env.NODE_ENV === 'test' ? DB_NAME_TEST : DB_NAME;

module.exports = {
    url: `${MONGO_DB_URI}/${dbName}`,
    mongoOptions: {
        socketTimeoutMS: 90000,
        keepAlive: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
};