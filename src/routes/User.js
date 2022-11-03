require('dotenv').config();
const { Router } = require('express');

const router = Router();
const QRCode = require('qrcode')
const User = require('../models/User');
const { authenticator } = require('otplib')

router.post('/register', async (req, res) => {
    const { username } = req.body;
    if (username) {
        const secret = authenticator.generateSecret();
        const user = new User({ username, secret });
        try {
            await user.save();
            const authenticatorUrl = authenticator.keyuri(username, process.env.APP_NAME, secret);
            const qr = await QRCode.toDataURL(authenticatorUrl);
            return res.json({ qr, authenticatorUrl });
        } catch (err) {
            if (err.code === 11000) {
                return res.status(400).json({ error: 'Username already exists' });
            } else {
                return res.status(400).json({ error: "Something went wrong. Code Error: " + err.code });
            }
        }
    } else {
        return res.status(403).json({ error: "The username field is required" })
    }
});


router.get('/info', async (req, res) => {
    const { username } = req.body;
    const user = await User.findOne({ username });
    if (user) {
        const authenticatorUrl = authenticator.keyuri(user.username, process.env.APP_NAME, user.secret);
        const qr = await QRCode.toDataURL(authenticatorUrl);
        return res.json({ qr, authenticatorUrl });
    } else {
        return res.status(404).json({ error: 'User not found' })
    }
});

router.post('/validate', async (req, res) => {
    const { username, otpCode } = req.body;
    if (username && otpCode) {
        const user = await User.findOne({ username });
        if (user) {
            const otpIsValid = await authenticator.check(otpCode, user.secret);

            if (otpIsValid)
                return res.json({ status: true, user })
            else
                return res.json({ status: false, msg: "Invalid OTP code" })
        } else {
            return res.json({
                status: false,
                msg: 'Incorrect Credentials'
            })
        }
    } else {
        res.status(403).json({ error: "The username and otpCode fields are required" })
    }
});

module.exports = router;