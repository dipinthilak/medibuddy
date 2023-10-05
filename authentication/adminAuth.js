
const isLogin = async(req, res, next)=> {
    try {

        if(req.session.admin=true){  next();}
        else{
            res.redirect('/admin/')
        }

       
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async(req, res, next)=> {
    try {

        if(req.session.admin){
            res.redirect('/admin/adminuserManagement')
        }else{ next()
        }

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout
}