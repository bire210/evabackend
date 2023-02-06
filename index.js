const express=require("express");
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const fs=require("fs")
const {authenticate}=require("./midleware/authenticate.midleware");
const {authorise}=require("./midleware/authorise.midleware")
const {connection}=require("./config/db")
const {UserModel}=require("./model/user.model")
require('dotenv').config();
const app=express();

app.use(express.json());
app.get("/",(req,res)=>{
    res.send("base point of Api");
})

app.post("/signup", async(req, res) => {
    const {name, email, password, role} = req.body;
    const user = await UserModel.findOne({email})||undefined;
    if(user){
        res.send("You are already registered ! Sigin please")
    }else{
        bcrypt.hash(password, 5, async function(err, hash) {
            const user = new UserModel({
                name,
                email : email,
                password : hash,
                role
            })
            await user.save();
            res.send("Sign up Successfull")
        });
    }
   
})

app.post("/login", async (req, res) => {
    const {email, password} = req.body;
    const user = await UserModel.findOne({email})
    //console.log(user)
    if(!user){
        res.send("Please signup first")
    }
    const hashpass = user.password
    bcrypt.compare(password, hashpass, (err, result)=> {
        if(result){
            const token = jwt.sign({userID : user._id, role : user.role},process.env.normal_key ,{expiresIn : 60})
            const refresh_token = jwt.sign({userID : user._id,role : user.role}, process.env.refresh_key, {expiresIn : 300})
            res.send({msg : "login successfull", token, refresh_token})
        }
        else{
            //console.log(result)
            res.send("login failed")
        }
    });
})


app.get("/goldrate", authenticate, (req, res) => {
    res.send("goldrates are here")
})

app.get("/userstats", authenticate, authorise(["manager"]), (req, res) => {
    res.send(" users data are here");
})

app.get("/logout", (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    const blacklisteddata = JSON.parse(fs.readFileSync("./blacklist.json", "utf-8"))
    blacklisteddata.push(token)
    fs.writeFileSync("./blacklist.json", JSON.stringify(blacklisteddata))
    res.send("Logged out successfully")
})


app.get("/getnewtoken", (req, res) => {
    const refresh_token = req.headers.authorization.split(" ")[1]

    if(!refresh_token){
        res.send("login again")
    }
    jwt.verify(refresh_token,process.env.refresh_key , function(err, decoded) {
        if(err){
            res.send({"message" : "plz login first", "err" : err.message})
        }
        else{
            //console.log(decoded)
            const token = jwt.sign({userID : decoded.userID,role:decoded.role}, process.env.normal_key, {expiresIn : 60})
            res.send({msg : "login successfull", token})
        }
  });
})

app.listen(process.env.port,async()=>{
    try {
        await connection
        console.log("data base is connected");
    } catch (error) {
        console.log("database is not coneected")
    }
    console.log(`server is running over ${process.env.port}`);
})