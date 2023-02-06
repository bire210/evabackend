var jwt = require('jsonwebtoken');
const fs = require("fs")
require('dotenv').config();
const authenticate = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1]
   
    if(!token){
        res.send("login again")
    }
    const blacklisteddata = JSON.parse(fs.readFileSync("./blacklist.json", "utf-8"))

    if(blacklisteddata.includes(token)){
       return  res.send("login again")
    }
  

    jwt.verify(token, process.env.normal_key, function(err, decoded) {
            if(err){
                res.send({"message" : "plz login first", "err" : err.message})
            }
            else{
                const userrole = decoded.role
                req.body.userrole = userrole
                next()
            }
      });

}




module.exports = {authenticate}

