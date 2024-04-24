import mongoose from "mongoose";
import bcrypt from "bcrypt"

/// Define the user schema

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
    },
    mobile: {
        type: String,
    },
    address: {
        type: String,
        required: true,
    },
    aadharCardNumber: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["voter", "admin"],
        default: "voter",
        required: true,
    },
    isVoted: {
        type: Boolean,
        default: false,
    },
});


userSchema.pre("save", async function (next) {
    const user = this; 

    //hash the password if it is has been modified (or new)
    if (!user.isModified("password")) return next()

    try {
        //hash password generation
        const salt = await bcrypt.genSalt(10)

        //hash password
        const hashPassword = await bcrypt.hash(user.password, salt)

        //override the plain password with hash password
        user.password = hashPassword
        next();
    } catch (error) {
        return next(err)
    }
})

userSchema.methods.comparePassword = async function (password) {
    try {

        // use the bcrypt for compare password with hash password;
        const isMatched = await bcrypt.compare(password, this.password)
        return isMatched;
    } catch (error) {

    }

}
const User = mongoose.model("User", userSchema);

export default User;
