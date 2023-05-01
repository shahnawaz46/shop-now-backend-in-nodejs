const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const path = require("path")
const fs = require("fs")


// components
const UserCollection = require("../model/user")
const UserAddress = require('../model/address')


exports.signup = async (req, res) => {
    const { firstName, lastName, email, phoneNo, password, cpassword } = req.body

    try {
        const alreadyUser = await UserCollection.findOne({ email })
        if (alreadyUser) {
            return res.status(400).json({ msg: "User Already Exist Please Signin" })
        }

        if (password !== cpassword) {
            return res.status(400).json({ msg: "Password and Confirm Password not Matched" })
        }

        // hasing the password
        const hashPassword = await bcrypt.hash(password, 12)

        // const user = new UserCollection({ firstName, lastName, email, phoneNo, password, cpassword })
        const user = await UserCollection.create({ firstName, lastName, email, phoneNo, password:hashPassword})

        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' })

        // if origin is same (means if client and server domain is same) then sameSite = lax, otherwise sameSite = none
        res.cookie("_f_id", token, {
            httpOnly: true,
            sameSite: "none",
            secure: true
        })

        return res.status(200).json({ msg: "Signup Successfully", userId:user._id })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ msg: "Something Gone Wrong Please Try Again" })
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

                // if the origin is same (means if client and server domain are same) then sameSite = lax, otherwise sameSite = none
                res.cookie("_f_id", token, {
                    httpOnly: true,
                    sameSite: "none",
                    secure: true
                })

                return res.status(200).json({ msg: "Login Successfully" , userId:alreadyUser._id})
            }

            return res.status(401).json({ msg: "Invalid credential" })
        }

        return res.status(404).json({ msg: "No Account Found Please Signup First" })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ msg: "Something Gone Wrong Please Try Again" })
    }
}

exports.userProfile = async (req, res) => {
    try {
        const userDetail = await UserCollection.findOne({ _id: req.data._id }).select("firstName lastName email phoneNo profilePicture location")
        const getUserAddress = await UserAddress.findOne({ userId: req.data._id })
        // console.log(getUserAddress)
        const address = getUserAddress ?  getUserAddress.address : []
        
        return res.status(200).json({ userDetail, userAddress: address })

    } catch (err) {
        // console.log(err)
        return res.status(400).json({ msg: "Something Gone Wrong Please Try Again" })
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
    const userDetail = req.body.userDetail

    try {
        // if ((userDetail.phoneNo).toString().length != 10) {
        //     return res.status(400).json({ error: "Phone No Must Be 10 Digit Long" })
        // }
        const result = await UserCollection.findByIdAndUpdate( req.data._id , userDetail, {new: true}).select("firstName lastName email phoneNo profilePicture location")
        // console.log(result)
        return res.status(200).json({ message: "Profile Update Successfully", userDetail: result })

    } catch (err) {
        console.log(err)
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