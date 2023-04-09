require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
    // cookie: { secure: true }
  }));

  app.use(passport.initialize());
  app.use(passport.session());


mongoose.connect("mongodb+srv://aag9131:hBF4Wn1al9kRwX2Z@cluster0.kfta6pw.mongodb.net/secrets");

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema)

passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

async function createUser(newUser){
    let res = await User.insertMany(newUser);
    return res;
}

async function findUser(username){
    let res = await User.findOne({username: username});
    console.log(res);
    return res;
}

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
})
app.get("/secrets", function(req, res){
    if( req.isAuthenticated()){
        res.render("secrets");
    } else {
        res.redirect("/login"); 
    }
})


app.post("/register", function(req,res){
    console.log(req.body.username);
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets")
            })
        }
    })
})
    
app.post("/login", function(req, res){
    const newUser = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(newUser, function(err){
        console.log(err)
        if(err){
            console.log(err);
            res.redirect("login");
        }else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
        
    })
})



app.listen(3000, function() {
    console.log("Server started on port 3000");
});