//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const bcrypt = require("bcrypt");
const saltRounds = 11;


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://aag9131:hBF4Wn1al9kRwX2Z@cluster0.kfta6pw.mongodb.net/secrets");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields:["password"]});

const User = mongoose.model("User", userSchema)

async function createUser(newUser){
    let res = await User.insertMany(newUser);
    return res;
}

async function findUser(email){
    let res = await User.findOne({email: email});
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


app.post("/register", function(req,res){

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const newUser = new User({
            email: req.body.username,
            password: req.body.password
        });
    
        newUser.save().then(function(){
            console.log("New User Created");
            res.render("secrets");
        });
    });

    
    

    // createUser(newUser).then(function(){
    //     console.log("New User Created");
    //     res.render("secrets");
    // })
})

app.post("/login", function(req, res){
    const userName = req.body.username;
    const password = req.body.password;

    findUser(userName).then(function(foundUser){
        console.log(foundUser)
        if(foundUser !== null){
            bcrypt.compare(password, foundUser.password, function(err, result) {
                if(result === true){
                    res.render("secrets");
                }});
        }  else{
            res.redirect("/");
        }
    })
})



app.listen(3000, function() {
    console.log("Server started on port 3000");
});