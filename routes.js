require('dotenv').config();
const express = require('express')
const router = express.Router()
const User= require("./models/Emailschema")
var bcrypt=require('bcrypt')
var nodemailer = require('nodemailer');
var jwt=require('jsonwebtoken');
let ejs= require('ejs')



let sender= process.env.EMAIL
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL,
    pass: process.env.EMAILPASS,
    clientId: process.env.CLIENT_ID,
    clientSecret:process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN
  },
   tls: {
          rejectUnauthorized: false
      }
});



router.post('/updateCentralState', async (req, res, done)=>{
  let id=req.body.data['_id']
  await User.findOne({_id: id}, (err,person)=>{
    if (err) console.log(err)
    //done(null, person)
    res.json(person)
  })
})

router.post('/removeDone', async (req, res, done)=>{
  console.log(req.body)
  let update=req.body.Item;
  let query=req.body.data["_id"];
  User.findByIdAndUpdate(query, {$pull: { done: update[0]}},{new:true},(err,person)=>{
    if(err) console.log(err)
    console.log(person)
    done(null, person)
    res.json(person)
  })
})

router.post('/dueDone', async (req, res, done)=>{
  console.log(req.body)
  let update=req.body.Item;
  let query=req.body.data["_id"];
  User.findByIdAndUpdate(query, {$pull: { log: update[0]},$addToSet: {done: update[0]}},{new:true},(err,person)=>{
    if(err) console.log(err)
    console.log(person)
    done(null, person)
    res.json(person)
  })
})

router.post('/overdueDone', async (req, res, done)=>{
  console.log(req.body)
  let update=req.body.Item;
  let query=req.body.data["_id"];
  User.findByIdAndUpdate(query, {$pull: { overdue: update[0]},$addToSet: {done: update[0]}},{new:true},(err,person)=>{
    if(err) console.log(err)
    console.log(person)
    done(null, person)
    res.json(person)
  })
})


router.post('/removeTodo', async (req, res, done)=>{
  console.log(req.body)
  let update=req.body.Item;
  let query=req.body.data["_id"];
  User.findByIdAndUpdate(query, {$pull: { log: update[0]}},{new:true},(err,person)=>{
    if(err) console.log(err)
    console.log(person)
    done(null, person)
    res.json(person)
  })
})

router.post('/removeOverdue', async (req, res, done)=>{
  console.log(req.body)
  let update=req.body.Item;
  let query=req.body.data["_id"];
  User.findByIdAndUpdate(query, {$pull: { overdue: update[0]}},{new:true},(err,person)=>{
    if(err) console.log(err)
    console.log(person)
    done(null, person)
    res.json(person)
  })
})



router.post('/addTodo', async (req,res,done)=>{
  console.log("LOG"+ req.body.data.log)
  let query={_id: req.body.data["_id"]}
  let update= { $addToSet: { log: req.body.data.log }}
  User.findOneAndUpdate(query,update, {new: true}, (err,person)=>{
    if(err) console.log(err)
    console.log(person)
    done(null, person)
    res.json(person)
    
  })

})


router.post('/login', async (req, res) =>{

    const email =req.body.data.email
    const password =req.body.data.password
    try{
        const checkuser= await User.findOne({ "email": email })
        console.log(checkuser);
        if(checkuser){
          const cmp = await bcrypt.compare(password, checkuser.password);
          console.log("cmp"+ cmp)
          if (cmp) {
            //   ..... further code to maintain authentication like jwt or sessions
            const user= req.body.data;
            const token= jwt.sign({ user }, 'my_secret_key2')
            console.log(token)
            res.json({
              user: checkuser,
              token: token,
              text: "Auth Successful"
            });
            
          } else {
            res.status(401).send("Wrong username or password.");
          }
        } 
        else{
          res.status(400).send("Email Doesnt Exist")
        } 
        } catch (error) {
          console.log(error);
        res.status(500).send("Internal Server error Occured");
      }
    
    

})


router.post('/register', async (req, res) => {
    try {
        const  email = req.body.data.email
        const  username = req.body.data.user
        const  password = req.body.data.password
        console.log(req.body.data)
        console.log(req.body.data.email)
        const checkuser= await User.findOne({email: email})
        if (checkuser) {return res.status(400).send("Email already exists")}
        let t= new Date();
        let GMT= t.toLocaleString();

        await User.create({email,username,password}, (err,user)=>{
          ejs.renderFile(__dirname + "/views/RegisterEmail.ejs", {userName: username, time: GMT.slice(10,GMT.length), date: GMT.slice(0,10)},
        (err,data)=>{
          if (err) console.log(err)
          var mainOptions={
            from: `${sender}`,
            to: `${email}`,
            subject: 'Succesfully Registered ',
            html: data,
          }
          transporter.sendMail(mainOptions,(err,info)=>{
            if (err) console.log(err)
            console.log(info.response)
          })
        })
        
        return res.status(200).json(user)  
        })
      
      }
      catch (error) {
        return res.status(500).json({"error":error})
      }

  })


module.exports=router;
