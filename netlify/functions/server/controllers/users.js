const UserSchema = require('../models/user.model.js');

/**
 * Registers a new user with provided name, email, and password.
 * If user is successfully registered, returns a 200 status with a JSON response.
 * If there's an error, returns a 400 status.
 * @param {object} req - The HTTP request object with the user information.
 * @param {object} res - The HTTP response object.
 * @return {object} Return a JSON response with the newly registered user and authorization token.
*/
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    // Create a new user object
    const user = new UserSchema({ name, email, password });
    try {
        // Save the new user object
        const doc = await user.save();
        // Generate authorization token for the newly created user
        const token = await doc.generateAuthToken();
        console.info('--Successfully registered a new user.');
        // Send the newly registered user and authorization token in response header
        res
            .header('authorization', `Bearer ${token}`)
            .send({ user: doc });
    } catch (err) {
        res.status(400).send(err);
    }
};

/**
 * Authenticates user's login credentials, and returns a JSON Web Token (JWT) if successful.
 * If the user does not exist, returns a 400 status.
 * If the credentials are incorrect, returns a 400 status.
 * @param {object} req - The HTTP request object with the user information.
 * @param {object} res - The HTTP response object.
 * @return {object} Returns a JSON response with user and JWT token.
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;
    // Check if user exists
    const doesEmailExist = await UserSchema.exists({ email: email });
    if (!doesEmailExist) {
        return res.status(400).send({ message: 'User does not exist' });
    }
    try {
        // Verify user credentials
        const user = await UserSchema.findByCredentials(email, password);
        const token = await user.generateAuthToken();
        console.info('--Successfully logged in.');
        // Set JWT token as Authorization header and return user object
        res
            .header('authorization', `Bearer ${token}`)
            .send({ user });
    } catch (err) {
        res.status(400).send(err);
    }
};

/**
 * This is a controller function for handling user logout requests.
 * attempts to remove the token associated with the authenticated user making the request.
 * If there is an error during the token removal process, it sends an error response with a status code of 500.
 * @param {object} req - The HTTP request object with the user information.
 * @param {object} res - The HTTP response object.
 * @return {object} Returns a response object with a status code of 200.
 */
exports.logout = async (req, res) => {
    try {
        // Remove the token associated with the authenticated user making the request
        await req.user.removeToken(req.token);
        console.info('--Successfully logged out.');
        // Send a successful response with a status code of 200
        res.status(200).send();
    } catch (err) {
        // Send an error response with a status code of 500 if there is an error during the token removal process
        res.status(500).send();
    }
};

exports.read = async (req, res) => res.send({ user: req.user });