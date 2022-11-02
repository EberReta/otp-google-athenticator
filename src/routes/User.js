const { Router } = require('express');
const router = Router();
const User = require('../models/User');

const { authenticator } = require('otplib')
const QRCode = require('qrcode')


router.get('/', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

router.post('/sign-up', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    const secret = authenticator.generateSecret();


    const user = new User({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        secret
    });


    try {
        await user.save();
        const keyUri = authenticator.keyuri(email, '2FA Node App test', secret);
        const qr  = await QRCode.toDataURL(keyUri);
        res.json({
            qr,
            authenticatorUrl: authenticator.keyuri(email, '2FA Node App test', secret)
        });
    } catch (err) {
        res.json(err.code);
    }
});



router.get('/qr', async (req, res) => {

const { email } = req.body; 
    const user = await User.findOne({email});
    if(user){
        const keyUri = authenticator.keyuri(user.email, '2FA Node App test', user.secret);
        const qr  = await QRCode.toDataURL(keyUri);
        res.send(
            `<img src="${qr}"/>`
        );
    }else{
        res.status(404)
    }
});
router.post('/login', async (req, res) => {
    const { email, password, otpCode } = req.body; 

    const user = await User.findOne({email, password});
    if(user){
        const otpValidateRes = await authenticator.check(otpCode, user.secret);
        if(otpValidateRes)
            res.json({status: true, user})
        else 
            res.json({status: false, msg: "OTP Invalid"})
    }else{
        res.json({ 
            status: false,
            msg: 'Incorrect Credentials'
        })
    }
    

});

module.exports = router;

