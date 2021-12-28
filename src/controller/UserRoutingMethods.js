const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const path = require("path")
const fs = require("fs")


// components
const UserCollection = require("../model/UserCollection")


exports.signup = async (req, res) => {
    const { firstName, lastName, email, phoneNo, password, cpassword } = req.body

    try {
        const alreadyUser = await UserCollection.findOne({ email })
        if (alreadyUser) {
            return res.status(400).json({ error: "User Already Exist" })
        }

        if (password !== cpassword) {
            return res.status(400).json({ error: "Password and Confirm Password not Matched" })
        }

        const user = new UserCollection({ firstName, lastName, email, phoneNo, password, cpassword })
        await user.save((error, user) => {
            if (error)
                return res.status(400).json({ error })

            if (user) {
                const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' })

                // if origin is same (means if client and server domain is same) then sameSite = lax, otherwise sameSite = none
                res.cookie("user_token", token, {
                    httpOnly: true,
                    sameSite: "none",
                    secure: true
                })

                return res.status(200).json({ message: "Signup Successfully" })
            }
        })

    } catch (err) {
        return res.status(400).json({ error: "Something Gone Wrong Please Try Again" })
    }
}

exports.signin = async (req, res) => {
    const { email, password } = req.body

    try {
        const alreadyUser = await UserCollection.findOne({ email })
        if (alreadyUser && alreadyUser.role === "user") {

            const passwordMatch = await bcrypt.compare(password, alreadyUser.password)

            if (passwordMatch) {
                const token = jwt.sign({ _id: alreadyUser._id, role: alreadyUser.role }, process.env.JWT_SECRET, { expiresIn: '30d' })

                // if the origin is same (means if client and server domain is same) then sameSite = lax, otherwise sameSite = none
                res.cookie("user_token", token, {
                    httpOnly: true,
                    sameSite: "none",
                    secure: true
                })

                return res.status(200).json({ message: "Login Successfully" })
            }

            return res.status(401).json({ error: "Invalid credential" })
        }

        return res.status(404).json({ error: "No Account Found Please Signup First" })

    } catch (err) {
        console.log(err)
        return res.status(400).json({ error: "Something Gone Wrong Please Try Again" })
    }
}

exports.userProfile = async (req, res) => {
    try {
        const userDetail = await UserCollection.findOne({ _id: req.data._id }).select("firstName lastName email phoneNo  profilePicture location")
        return res.status(200).json({ userDetail })

    } catch (err) {
        return res.status(400).json({ error: "Something Gone Wrong Please Try Again" })
    }
}

exports.updateProfilePic = async (req, res) => {
    try {
        const profilePicture = req.file
        let userDetail = await UserCollection.findOne({ _id: req.data._id })
        if (userDetail) {
            // console.log(userDetail)
            if (userDetail.profilePicture)
                fs.unlinkSync(path.join(__dirname + '../../../' + '/public/profileImages' + `/${userDetail.profilePicture}`))

            userDetail.profilePicture = profilePicture.filename

            await UserCollection.findByIdAndUpdate({ _id: req.data._id }, userDetail)
            return res.status(200).json({ message: "Profile Pic Update Successfully" })
        }
    } catch (err) {
        console.log(err)
        return res.status(400).json({ error: "Something Gone Wrong Please Try Again" })
    }
}

exports.editUserProfileDetail = async (req, res) => {
    const userDetail = req.body
    try {
        if ((userDetail.phoneNo).toString().length != 10) {
            return res.status(400).json({ error: "Phone No Must Be 10 Digit Long" })
        }
        await UserCollection.findByIdAndUpdate({ _id: req.data._id }, userDetail)
        return res.status(200).json({ message: " Profile Update Successfully" })

    } catch (err) {
        // console.log(err)
        if (err.codeName == "DuplicateKey") {
            return res.status(400).json({ error: "This Email Already Exist" })
        }
        return res.status(400).json({ error: "Something Gone Wrong Please Try Again" })
    }
}

exports.signout = (req, res) => {
    res.clearCookie("user_token")
    return res.status(200).json({ message: "Signout Successfully" })
}