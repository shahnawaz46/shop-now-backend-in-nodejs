const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    phoneNo: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cpassword: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user'
    },
    profilePicture: {
        type: String
    },
    location: {
        type: String
    }

}, { timestamps: true })


userSchema.pre('save', async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12)
        this.cpassword = await bcrypt.hash(this.cpassword, 12)
    }
    next()
})


const UserCollection = mongoose.model("users", userSchema)

module.exports = UserCollection;