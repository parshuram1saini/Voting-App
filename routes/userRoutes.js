import express from "express"
import User from "../models/user.js"
import { generateToken, jwtAuthMiddleware } from "../middleware/auth.js"

const router = express.Router()

//----signup route to add a user
router.post("/signup", async (req, res) => {
    try {
        const data = req.body

        // Check if there is already an admin user
        const adminUser = await User.findOne({ role: 'admin' });
        if (data.role === 'admin' && adminUser) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }

        // Validate Aadhar Card Number must have exactly 12 digit
        if (!/^\d{12}$/.test(data.aadharCardNumber)) {
            return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits' });
        }

        // Check if a user with the same Aadhar Card Number already exists
        const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
        if (existingUser) {
            return res.status(400).json({ error: 'User with the same Aadhar Card Number already exists' });
        }


        const newUser = new User(data)

        const response = await newUser.save();  //save the new user

        const payload = {
            id: response.id,
        }

        const token = generateToken(payload)
        console.log("token", token)
        res.status(200).json({ response, token })

    } catch (error) {
        console.log("err", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

//----login route to get a user
router.post("/login", async (req, res) => {
    try {
        const { aadharCardNumber, password } = req.body

        // Check if aadharCardNumber or password is missing
        if (!aadharCardNumber || !password) {
            return res.status(400).json({ error: 'Aadhar Card Number and password are required' });
        }

        // find the user 
        const user = await User.findOne({ aadharCardNumber: aadharCardNumber })

        // if user does not exist or doesn't match password , return error
        if (!user || !(await user.comparePassword(password)))
            return res.status(401).json({ error: "Invalid username or password" })

        const payload = {
            id: user.id,
        }

        const token = generateToken(payload)
        console.log("token", token)
        //return a token as response
        res.status(200).json({ token })

    } catch (error) {
        console.log("err", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

//----profile of user
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
    try {

        const userData = req.user
        const userId = userData.id;
        const user = await User.findById(userId)

        //return a user response
        res.status(200).json({ user })

    } catch (error) {
        console.log("err", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

// list of profile of all user
router.get('/profile-list', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

//----change the password of user
router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
    try {

        const userID = req.user.id  // extract the id from the token
        const { currentPassword, newPassword } = req.body

        // Check if currentPassword and newPassword are not present in the request body
        if (!(currentPassword && newPassword)) {
            return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
        }
        // --- find the user by userID
        const user = await User.findById(userID)
        console.log("user", userID)

        // if user doesn't match password , return error
        if (!(await user.comparePassword(currentPassword)))
            return res.status(401).json({ error: "Password does not match" })

        user.password = newPassword;
        await user.save()

        //return a user response
        res.status(200).json({ message: "Password changed successfully" })

    } catch (error) {
        console.log("err", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})


export default router