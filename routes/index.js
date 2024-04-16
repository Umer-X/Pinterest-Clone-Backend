var express = require('express');
var router = express.Router();
var userModel = require("./users");
var postModel = require("./post");
var passport = require('passport');
const upload = require('./multer');

const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function(req, res ) {
  res.render('index');
});

router.get('/profile', isLogggedIn, async function(req, res ) {
  const user = 
 await userModel
               .findOne({username : req.session.passport.user})
               .populate("posts")
  res.render('profile', {user});
});



router.get('/show/posts', isLogggedIn, async function(req, res ) {
  const user =  
 await userModel
               .findOne({username : req.session.passport.user})
               .populate("posts")
  res.render('show', {user});
});

router.get('/feed', isLogggedIn, async function(req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const posts = await postModel.find().populate("user"); // Fixed the variable name here
  res.render('feed', { user, posts }); // Fixed the variable name here
});


router.get('/add', isLogggedIn, async function(req, res ) {
  const user = await userModel.findOne({username : req.session.passport.user});
  res.render('add', {user});
});

router.post('/createpost', isLogggedIn, upload.single("postimage"),  async function(req, res ) {
  const user = await userModel.findOne({username : req.session.passport.user});
  const post = await postModel.create({
    user: user._id,
    tittle: req.body.tittle,
    description: req.body.description,
    image: req.file.filename
  })
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

router.post('/fileupload', isLogggedIn, upload.single("image"), async function(req, res ) {
 const user = await userModel.findOne({username : req.session.passport.user});
 user.profileImage = req.file.filename;
 await user.save();
 res.redirect("/profile");
});

router.get('/login', function(req, res ) {
  
  res.render('login', { error : req.flash('error')});
});


router.get("/profile", isLogggedIn ,  function(req, res, next) {

  res.send("profile");
});



router.get("/feed", isLogggedIn , function(req, res, next) {
  res.send("feed");
});


router.post('/register', function(req, res, next) {
  const {username, email, fullname } = req.body;
  const userData = new userModel ({username, email,  fullname });
  userModel.register(userData, req.body.password)
  .then(function(){
    passport.authenticate("local")(req, res, function(){
      res.redirect("/profile");
    })
  })
});

router.post('/login', passport.authenticate('local',{
  successRedirect: "/profile",
  failureRedirect: "/login", 
  failureFlash: true

}), function(req, res){

});

router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

function isLogggedIn(req, res, next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login");
}
module.exports = router;
