const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    verificationCode: {
        type: String,
        required: true,
        trim: true,
    },
    verificationCodeExpiry: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400, // Auto-delete after 24 hours (TTL index)
    },
});

module.exports = mongoose.model('PendingUser', pendingUserSchema);

