const path = require('path')
const fs = require("fs")

// components
const BannerCollection = require('../model/BannerCollection');


exports.addBanner = async (req, res) => {
    try {
        const { bannerTitle } = req.body;
        const { computerBannerImage, mobileBannerImage } = req.files;
        if (!computerBannerImage) {
            return res.status(404).json({ error: "Please Select Computer Banner Image" })
        }

        if (!mobileBannerImage) {
            return res.status(404).json({ error: "Please Select Phone Banner Image" })
        }

        const bannerDetail = new BannerCollection({
            bannerTitle,
            computerBannerImage: computerBannerImage[0].filename,
            mobileBannerImage: mobileBannerImage[0].filename,
            createdBy: {
                AdminId: req.data._id
            }
        });

        await bannerDetail.save((error, banner) => {
            if (error) {
                return res.status(400).json({ error });
            }
            if (banner) {
                return res.status(200).json({ message: "Banner added Successfully" })
            }
        });

    } catch (error) {
        return res.status(400).json({ error: "Something Gone Wrong Please Try Again" })
    }
}


exports.getBanner = async (req, res) => {
    try {
        const bannerDetail = await BannerCollection.find({})

        if (bannerDetail) {
            return res.status(200).json({ bannerDetail })
        }
        return res.status(404).json({ error: "Banner not Found" })

    } catch (error) {
        return res.status(400).json({ error: "Something Gone Wrong Please Try Again" })
    }
}



exports.deleteBanner = async (req, res) => {
    const { bannerId } = req.body;
    try {
        const deletedBanner = await BannerCollection.findByIdAndDelete({ _id: bannerId })
        let imageArray = []
        imageArray.push(path.join(__dirname + '../../../' + '/public/BannerImages' + `/${deletedBanner.computerBannerImage}`))
        imageArray.push(path.join(__dirname + '../../../' + '/public/BannerImages' + `/${deletedBanner.mobileBannerImage}`))

        imageArray.forEach((image) => {
            fs.unlinkSync(image)
        })

        return res.status(200).json({ message: "Banner Deleted Successfully" })

    } catch (error) {
        return res.status(400).json({ error: "Something Gone Wrong Please Try Again" })
    }

}


exports.editBanner = async (req, res) => {
    const bannerValue = req.body
    try {
        await BannerCollection.findByIdAndUpdate({ _id: bannerValue._id }, bannerValue, { new: true })
        return res.status(200).json({ message: "Banner Edited Successfully" })
    } catch (error) {
        return res.status(400).json({ error: "Something Gone Wrong Please Try Again" })
    }
}