
const User = require("../models/userSchema");

const isLogin = async(req, res, next)=> {
    try {

        if(req.session.user_id){ 
            console.log("isLogin>>> user active ,so next");
                next();
            }
        else{
            console.log("isLogin>>> user not-active ,so / ");
            res.redirect('/')
        }

       
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async(req, res, next)=> {
    try {

        if(!req.session.user_id){
            console.log("isLogout>>> user not-active ,so next")

            next();            
        }
        else{ 
            console.log("isLogout>>> user active ,so home")

            res.redirect('/userHome')
        }

    } catch (error) {
        console.log(error.message);
    }
}

const isActive=async(req,res,next)=>
{
    const user =await User.findById(req.session.user_id);
    console.log(user.isActive);
    if(user.isActive)
    {
        console.log("is active true middleware   ->>>"+req.session.user_id);
        next();
    }
    else{
        req.session.destroy();
        console.log("is not active  middleware  ->>> session over");

        res.redirect("/userSignin",)
    }
}

module.exports = {
    isLogin,
    isLogout,
    isActive
}