if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

const express = require("express");
const fs = require("fs");

const uuid = require("uuid");
const passport = require("passport");
const bcrypt = require("bcrypt");
const flash = require("express-flash");
const session = require("express-session");

const sql = require("./serverUtils/pgUtils.js");

//You are planning to create a docker file for a redis container and
//then replace the global variable you have with a redis database.

// const initializePassport = require("./serverUtils/passport-config.js")
// initializePassport(passport, (name)=>{
//   return usrData.find(e=>e.name==name);
// },(id)=>{
//   return usrData.find(e=>e.id==id);
// })

const initializePassport = require("./serverUtils/passport-config.js")
initializePassport(passport, (name)=>{
  return usrData.find(e=>e.name==name);
},(id)=>{
  return usrData.find(e=>e.id==id);
})

// Beginning of the old database system
let usrData='';
try{
  const dataString = fs.readFileSync('./resources/config.json');
  usrData=JSON.parse(dataString);
}catch(err){
  console.log(err);
}

function updateUserData(){
  fs.writeFileSync('./resources/config.json',JSON.stringify(usrData));
}

//End of the old DB section


const app = express();

app.use(express.static(__dirname));
app.use(express.urlencoded({extended:false}));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave:false,
  saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())

app.listen(3000);
console.log("Server is now listening on port:3000")
app.set('view engine','ejs');

function authCheck(req,res,next){
  if(req.isAuthenticated()){
    return next()
  }
    res.redirect('/login');
}
function notAuthCheck(req,res,next){
  if(req.isAuthenticated()){
    return res.redirect('/dashboard');
  }else{
    return next();
  }
}
//Views
app.get("/", (req, res) => {
  res.render('index');
})


app.get("/login",notAuthCheck, (req, res) => {
  res.render('login');
})

// app.post("/login", async(req,res)=>{
//   if(await bcrypt.compare(req.body.password,usrData[req.body.name].pass)){
//     res.redirect("/dashboard/"+usrData[req.body.name].id);
//   }else{
//     res.status(401).send();
//   }
//})
app.post("/login", passport.authenticate('local',{
  successRedirect:'dashboard',
  failureRedirect: 'login',
  failureFlash:true
}))

app.get("/register",notAuthCheck, (req,res)=>{
  res.render("register",{msg:""});
})

app.post("/register",notAuthCheck, async(req,res)=>{
  try{
    //We use a try statement because this is an asynch function
    //bcrypt is encrypting the password here
    const pass = await bcrypt.hash(req.body.password, 10);
    //here we check to make sure that this username isn't already in use
    if(!usrData.find(e=>{e.name==req.body.name})){
      //here we are pushing the new user object to usrData
      usrData.push({id:uuid.v4(),name:req.body.name,pass:pass});
      //then we call the updateUserData function to sync the file
      updateUserData();
      res.redirect("/login")
    }else{
      res.render("register",{msg:"username is taken"})
    }
  }catch(err){
    res.status(err);
  }
})

app.get("/dashboard",authCheck,(req,res)=>{
  res.render("dashboard",{name: req.user.name});
})

app.post("/logout", (req,res)=>{
  console.log("logging out");
  req.logout((e)=>{if(e){return next(e)}});
  res.redirect('/login');
})