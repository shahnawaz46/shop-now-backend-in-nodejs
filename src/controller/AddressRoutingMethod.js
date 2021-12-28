const UserAddress = require('../model/AddressCollection')

exports.addAddress = async (req, res) => {
    const userAddress = req.body;
    try {
        const userAddressAlready = await UserAddress.findOne({ userId: req.data._id })
        if (userAddressAlready) {
            if (userAddress._id) {
                console.log("if")
                console.log(userAddress)
                const a = await UserAddress.findOneAndUpdate({ userId: req.data._id, 'address._id': userAddress._id }, {
                    "$set": {
                        "address.$": userAddress
                    }
                }, { new: true, upsert: true })
                console.log(a)
                return res.status(201).json({ message: "Address Edit Successfully" })
            } else {
                console.log("else")
                await UserAddress.findOneAndUpdate({ userId: req.data._id }, {
                    "$push": {
                        "address": userAddress
                    }
                })
                return res.status(201).json({ message: "Address Add Successfully" })
            }

        } else {
            const address = new UserAddress({ userId: req.data._id, userAddress })
            await address.save((error, addres) => {
                if (error) {
                    return res.status(400).json({ error: "Address Not Added Please Try Again" })
                }
                if (addres) {
                    return res.status(201).json({ message: "Address Add Successfully" })
                }
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: "something gone wrong please try again" })
    }
}

exports.getAddress = async (req, res) => {
    try {
        const getUserAddress = await UserAddress.findOne({ userId: req.data._id })
        if (getUserAddress) {
            return res.status(200).json({ userAddress: getUserAddress.address })
        } else {
            return res.status(400).json({ error: "don't have address" })
        }
    } catch (error) {
        return res.status(400).json({ message: "something gone wrong please try again" })
    }
}

exports.editAddress = async (req, res) => {
    try {
        await UserAddress.findOneAndUpdate({ userId: req.data._id }, {
            "$pull": {
                address: { _id: req.body.addressId }
            }
        })
        return res.status(200).json({ message: "Address deleted Successfully" })
    } catch (error) {
        return res.status(400).json({ message: "something gone wrong please try again" })
    }
}