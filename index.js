const express=require('express');
const app=express();
const mongoose=require('mongoose')
const path = require('path')
const nocache = require('nocache')
const logger = require('morgan')
app.use(logger('dev'))
mongoose.connect("mongodb://127.0.0.1:27017/medibuddy")
const userRouters = require('./routers/user_Routers');
const admin_routers = require('./routers/admin_routers');

app.use(nocache())

app.use('/assets',express.static('public/user/assets'));
app.use('/assetsbackend',express.static(path.resolve(__dirname,"public/admin/assets")))
app.use('/admin-assets',express.static(path.resolve(__dirname,"public/admin")))

app.use('/', userRouters);
app.use('/admin', admin_routers);







app.listen(3000, () => {
    console.log('Server started...');
})