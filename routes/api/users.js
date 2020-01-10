const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
// const { check, validationResult } = require('express-validator/check');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User')

// @route   POST api/users
// @desc    Register User
// @access  Public

router.post('/', [
    check('name', 'Name is required')
        .not()
        .isEmpty(),
    check('email', 'Please use a valid email')
        .isEmail(),
    check('password', 'Please use a password with 6 or more characters')
        .isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password } = req.body;

    try {
        // See if the user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400)
                .json({ errors: [{ msg: 'User already exists' }] });
        }
        // Get user gravtar from email if they have
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })
        user = new User({
            name,
            email,
            avatar,
            password
        });
        // Encrypt the password with bcrypt
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        // Save the user to the database
        await user.save();
        // return the json web token
        console.log(req.body);
        res.send('User Registered');

    } catch (err) {
        console.error(err.message)
        res.status(500)
            .send('Server Error')
    }

});
module.exports = router;