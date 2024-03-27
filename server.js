if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

const express = require("express");

const uuid = require("uuid");
const passport = require("passport");
const bcrypt = require("bcrypt");
const flash = require("express-flash");
const session = require("express-session");

const sql = require("./serverUtils/pgUtils.js");


const initializePassport = require("./serverUtils/passport-config.js")
initializePassport(passport)


async function createUser(name, password){
  console.log("running create user")
  const userSearch = await sql`select * from users where name=${name};`
  console.log(userSearch);
  console.log(userSearch.length);
  if (userSearch.length<1){
    console.log("running insert");
    const user = await sql`
      insert into users
      (id, name, password)
      values
      (${uuid.v4()},${name},${password})
      returning name;
    `
    console.log(user);
    console.log("done")
    return true;
  }else{
    return false;
  }

}


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

app.get("/", (req, res) => {
  res.render('index');
})

app.get("/login",notAuthCheck, (req, res) => {
  res.render('login');
})

app.post("/login", passport.authenticate('local',{
  successRedirect:'dashboard',
  failureRedirect: 'login',
  failureFlash:true
}))

app.get("/register",notAuthCheck, (req,res)=>{
  res.render("register");
})

app.post("/register",notAuthCheck, async(req,res)=>{
  try{
    const pass = await bcrypt.hash(req.body.password, 10);
    if (await createUser(req.body.name,pass)){
      res.redirect("/login");
    }else{
      req.flash('error','That user already exists');
      res.render("register");
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