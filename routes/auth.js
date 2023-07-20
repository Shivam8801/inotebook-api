import express from "express"
const router = express.Router()

import User from "../models/User.js"
import { body, validationResult } from "express-validator"
import bcrypt from "bcryptjs"

import pkg from 'bcryptjs';
const { genSalt } = pkg;

import jwt from "jsonwebtoken"
import fetchUser from "../middleware/fetchUser.js"
import dotenv from "dotenv"
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET

// Route 1 : create a user using: POST "/api/auth/createuser". Does not require login

router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must contain at least 5 characters.').isLength({ min: 5 }),
], async (req, res) => {

    let success = false

    // if there are errors, return bad request and the errors

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() })
    }

    // check whether the user with this email exists already

    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success, error: "Sorry, a user with this email already exists!" })
        }

        // create a new user

        const salt = await genSalt(10)
        const securedPassword = await bcrypt.hash(req.body.password, salt)

        user = await User.create({
            name: req.body.name,
            password: securedPassword,
            email: req.body.email,
        })

        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET)

        success = true
        res.json({ success, authToken })
    }

    catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error!")
    }
})


// Route 2 : authenticate a user using : POST "/api/auth/login". No login required

router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank.').exists(),
], async (req, res) => {

    let success = false

    // if there are errors, return bad request and the errors

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }


    const { email, password } = req.body
    try {
        let user = await User.findOne({ email });
        if (!user) {
            success = false
            return res.status(400).json({ error: "Please try to login with correct credentials!" })
        }
        const passwordCompare = await bcrypt.compare(password, user.password)
        if (!passwordCompare) {
            success = false
            return res.status(400).json({ success, error: "Please try to login with correct credentials!" })
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET)
        success = true
        res.json({ success, authToken })
    }

    catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error!")
    }
})


// Route 3 : get logged in user details : POST "/api/auth/getuser". login required

router.post('/getuser', fetchUser, async (req, res) => {

    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user)
    }

    catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error!")
    }

})


export default router