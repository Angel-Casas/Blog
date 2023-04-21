const app = require('./server');

exports.handler = async (event, context) => {
  const response = await app(event, context);
  return response;
};