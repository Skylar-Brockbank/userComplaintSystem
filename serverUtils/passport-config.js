const LocalStrategy = require('passport-local').Strategy
const bcrypt=require("bcrypt");
const sql = require('./pgUtils.js');

function initialize(passport){
  const authenticateUser= async(name, password, done)=>{
    const result = await sql`select * from users where name=${name};`;
    const user=result[0];
    if(user==null){
      return done(null, false, {message:"incorrect username"});
    }
    try{
      console.log(user);
      if (await bcrypt.compare(password, user.password)){
        return done(null,user,)
      }else{
        return done(null, false, {message: "incorrect password"})
      }
    }catch(e){
      return done(e);
    }
  }
  passport.use(new LocalStrategy({usernameField:'name'},authenticateUser))
  passport.serializeUser((user,done)=>{
    done(null,user.id);
  })
  passport.deserializeUser((id,done)=>{
    const getUserById = async(id)=>{
      const user = await sql`select * from users where id=${id}`
      return user;
    }
    return done(null,getUserById(id));
  })
}

module.exports=initialize;