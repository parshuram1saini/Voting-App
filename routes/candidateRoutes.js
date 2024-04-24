import express from "express"
import Candidate from "../models/candidate.js"
import User from "../models/user.js"
import { jwtAuthMiddleware } from "../middleware/auth.js"

const router = express.Router()

const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID)
        return user.role === "admin"
    } catch (error) {
        return false;
    }
}

//----post route to add a candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
    try {
        if (! await checkAdminRole(req.user.id))
            return res.status(404).json({ message: "user has not admin role" })

        const data = req.body
        const newCandidate = new Candidate(data)

        const response = await newCandidate.save();  //save the new user
        console.log("data saved", response)

        res.status(200).json({ response })

    } catch (error) {
        console.log("err", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

// list of candidate of all user
router.get('/candidates-list', async (req, res) => {
    try {
        const candidate = await Candidate.find();
        res.status(200).json(candidate);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

//----update the date of candidate
router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
    try {

        if (! await checkAdminRole(req.user.id))
            return res.status(403).json({ message: "user has not admin role" })

        const candidateID = req.params.candidateID  // extract the id from the token
        const updatedCandidateData = req.body

        // --- find the user by userID
        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true,     // return the updated document
            runValidators: true  /// run mongoose validation
        })

        if (!response)
            return res.status(404).json({ candidate: "Candidate not found" })

        //return a user response
        console.log("candidate date saved")
        res.status(200).json(response)

    } catch (error) {
        console.log("err", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})


//----delete
router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
    try {

        if (! await checkAdminRole(req.user.id))
            return res.status(403).json({ message: "user has not admin role" })

        const candidateID = req.params.candidateID  // extract the id from the params

        // --- delete the user by userID
        const response = await Candidate.findByIdAndDelete(candidateID)

        if (!response)
            return res.status(404).json({ candidate: "Candidate not found" })

        //return a user response
        console.log("candidate deleted")
        res.status(200).json(response)

    } catch (error) {
        console.log("err", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})


//----start to voting
router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
    try {

        const candidateID = req.params.candidateID  // extract the id from params
        const userID = req.user.id  // extract the id from the token

        // --- find the candidate
        const candidate = await Candidate.findById(candidateID)

        if (!candidate)
            return res.status(404).json({ error: "Candidate not found" })

        const user = await User.findById(userID)

        if (!user)
            return res.status(404).json({ error: "User not found" })

        if (user.role === "admin")
            return res.status(404).json({ error: "Admin is not allowed" })

        if (user.isVoted)
            return res.status(404).json({ error: "User has given the vote already" })

        candidate.votes.push({ user: userID })
        candidate.voteCount++;
        await candidate.save()

        user.isVoted = true;
        await user.save()

        //return a user response
        res.status(200).json({ message: "vote recorded successfully" })

    } catch (error) {
        console.log("err", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

//vote count 
router.get("/vote/count", async (req, res) => {
    try {

        //get all candidate and sort by vote count
        const candidate = await Candidate.find().sort({ voteCount: "desc" })

        //map candidate only with party and voteCount
        const voteRecord = candidate.map((item) => ({ party: item.party, count: item.voteCount }))

        return res.status(200).json(voteRecord)
    } catch (error) {
        console.log("err", error)
        res.status(500).json({ error: "Internal Server Error" })
    }

})


export default router