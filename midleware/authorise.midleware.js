


const authorise = (role_array) => {
    //inner function
    return (req, res, next) => {
        const userrole = req.body.userrole
        if(role_array.includes(userrole)){
            next()
        }
        else{
            res.send("not authorised")
        }
    }
}



module.exports = {authorise}

