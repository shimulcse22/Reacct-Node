const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/Users');
const {check,validationResult} = require('express-validator');
  
  // @route    POST api/profile
  // @desc     Create or update user profile
  // @access   Private
  router.post(
    '/',
    [
      auth,
      [
        check('status', 'Status is required')
          .not()
          .isEmpty(),
        check('skills', 'Skills is required')
          .not()
          .isEmpty()
      ]
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
      } = req.body;
  
      // Build profile object
      const profileFields = {};
      profileFields.user = req.user.id;
      if (company) profileFields.company = company;
      if (website) profileFields.website = website;
      if (location) profileFields.location = location;
      if (bio) profileFields.bio = bio;
      if (status) profileFields.status = status;
      if (githubusername) profileFields.githubusername = githubusername;
      if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
      }
  
      // Build social object
      profileFields.social = {};
      if (youtube) profileFields.social.youtube = youtube;
      if (twitter) profileFields.social.twitter = twitter;
      if (facebook) profileFields.social.facebook = facebook;
      if (linkedin) profileFields.social.linkedin = linkedin;
      if (instagram) profileFields.social.instagram = instagram;
  
      try {
        // Using upsert option (creates new doc if no match is found):
        let profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true, upsert: true }
        );
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );

router.get('/me',auth,async (req,res)=>{
    try {
        const profile = await Profile.findOne({user : req.user.id}).populate('user',['name','avatar']);

        if(!profile){
            return res.status(400).send('This account has not the profile yet');
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

router.get('/all',async (req,res)=>{
    try {
        const profile = await Profile.find().populate('user',['name','avatar']);

        if(!profile){
            return res.status(400).send('There is no profile');
        }
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

router.get('/user/:user_id',async (req,res)=>{
    try {
        const profile = await Profile.findOne({ user : req.params.user_id}).populate('user',['name','avatar']);

        if(!profile){
            return res.status(400).send('Profile is not found');
        }
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        if(error.kind == 'ObjectId'){
            return res.status(400).send('Profile is not found');
        }
        res.status(500).send('Server Error');
    }
});

router.delete('/',auth,async (req,res)=>{
    try {
        await Profile.findOneAndRemove({ user : req.user.id});

        await User.findOneAndRemove({ _id : req.user.id});
        
        res.json({msg : 'User Removed'});
    } catch (error) {
        console.error(error.message);
        if(error.kind == 'ObjectId'){
            return res.status(400).send('Profile is not found');
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;