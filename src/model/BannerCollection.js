const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    bannerTitle: {
        type: String,
        required: true,
        trim: true
    },
    show: {
        type: Boolean,
        required: true,
        default: true
    },
    computerBannerImage: {
        type: String,
        required: true
    },
    mobileBannerImage: {
        type: String,
        required: true
    },
    createdBy: {
        AdminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'admin',
            required: true
        }
    },
}, { timestamps: true });


const BannerCollection = mongoose.model('banners', bannerSchema);

module.exports = BannerCollection;