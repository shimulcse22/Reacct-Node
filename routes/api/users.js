const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const {check,validationResult} = require('express-validator');
const User = require('../../models/Users');
const bcrypt = require('bcryptjs');

router.post('/',[
    check('name','Name is required').not().isEmpty(),
    check('email','Please enter a valid emial').isEmail(),
    check('password','Please enter a password with 6 or more character').isLength({min : 6})],
    async (req,res)=>
    {
        const  errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors : errors.array()});   
        }
        const { name,email,password } = req.body;

        try{
            let user = await User.findOne({email});
            if(user){
                return res.status(400).json({errors :[{ msg : 'User Already exist'}]});
            }
            const avatar = gravatar.url(email,{
                s:'200',
                r:'pg',
                d:'mm'
            })
            user = new User(
                {
                    name,
                    email,
                    password,
                    avatar
                }
            )
            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password,salt);

            await user.save();
            res.send('User Registered');
        }catch(err){
            console.error(err.message);
            return res.status(500).send('Server Error');
        }
        
});

module.exports = router;