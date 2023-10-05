
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

module.exports = {
    isLogin,
    isLogout
}