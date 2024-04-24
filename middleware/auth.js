import jwt from "jsonwebtoken"

export const jwtAuthMiddleware = (req, res, next) => {
    /// ----first check request header  has authorization or not
    const authorization = req.headers.authorization
    if (!authorization) return res.status(401).json({ error: "token not found" })

    //split the authorization for token
    const token = authorization.split(" ")[1]
    if (!token) return res.status(401).json({ error: "Unauthorized" })

    try {
        //-- verify the jwt token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        //attached user information to the object
        req.user = decoded
        next();
    }
    catch (err) {
        res.status(401).json({ error: "Invalid token" })
    }
}

/// ---- function to generate jwt token

export const generateToken = (userData) => {
    //generate a token using user data
    return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: 30000 })
}
