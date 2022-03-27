require('dotenv').config()
const express= require('express')
const server =express()
const mongoose = require('mongoose')
const routes = require('./routes') // includes the routes.js file
const cors = require('cors') // includes cors module

const path=require('path')
const cronUpdate= require('./cron')


server.use(cors()) // We're telling express to use CORS
server.use(express.json()) // we need to tell server to use json as well
server.use(routes)
server.use(express.static(path.join(__dirname, '')))
server.use(express.static(path.join(__dirname, 'views/')))

mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection

server.get('/', async (req, res)=>{
    res.render('welcomePage.ejs',{userName: 'Node backend',time: new Date(), date: new Date().getMonth()})
})
  


db.on('error', (error) => console.error(error))
db.once('open', () => {
    console.log('database connected')
    cronUpdate.performUpdate()
    server.listen(process.env.PORT,()=>{
        console.log("The API is running on Port:" + process.env.PORT)
    })
    

})




