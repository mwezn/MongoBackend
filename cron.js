require('dotenv').config();
var cron =require('node-cron');
var express=require('express')
var nodemailer=require('nodemailer')
let app=express();
const mongoose=require('mongoose')
const User = require('./models/Emailschema')
const ejs= require('ejs')

mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => {
  console.log('database connected')


})

let sender= process.env.EMAIL
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS
    },
     tls: {
            rejectUnauthorized: false
        }
  });



function sendMail(){
  cron.schedule('*/30 * * * * *',()=>{
    console.log("Running every 30 seconds")
    let t= new Date()
    let GMT=t.toLocaleString();

    User.find({}, (err,d)=>{
      if (err) console.log(err)
      let t=d.length;
      for(let i=0;i<t;i++){
        ejs.renderFile(__dirname + "/views/ReminderEmail.ejs", {userName: d[i].username, time: GMT.slice(10,GMT.length), date: GMT.slice(0,10), mongoDB: d[i].log},
        (err,data)=>{
          if (err) console.log(err)
          var mainOptions={
            from: `${sender}`,
            to: `${d[i].email}`,
            subject: 'Succesfully Registered ',
            html: data,
          }
          transporter.sendMail(mainOptions,(err,info)=>{
            if (err) console.log(err)
            console.log(info.response)
          })
        })
      }
    })
  })
}
 

// The following function separates users scheduled tasks from the overdue ones!
function performUpdate(){
  cron.schedule('*/30 * * * * *', ()=>{
    console.log("performing Update")
    let t=new Date();
    let T=t.toISOString();
    let GMT=t.toLocaleTimeString()
    User.find({}, (err,d)=>{
      if (err) console.log(err)
      let t=d.length;
      for(let i=0;i<t;i++){
        let f=d[i].log
        let Id= d[i]['_id']
        let res=f.filter(z=>z.date<T.slice(0,10))
        let res2=f.filter(z=>z.date==T.slice(0,10))
        let res3=res2.filter(z=>z.time[0]=='0'?z.time.slice(1,5)<GMT.slice(0,5):z.time<GMT.slice(0,5))
        let res4=res2.filter(z=>z.time==GMT.slice(0,5))
        if(res4.length!==0){
          ejs.renderFile(__dirname + "/views/ReminderEmail.ejs", {userName: d[i].username, time: GMT, date: T.slice(0,10), mongoDB: res4},
          (err,data)=>{
          if (err) console.log(err)
          var mainOptions={
            from: `${sender}`,
            to: `${d[i].email}`,
            subject: 'Your reminder ',
            html: data,
          }
          transporter.sendMail(mainOptions,(err,info)=>{
            if (err) console.log(err)
            console.log(info.response)
          })
        })


        }
        User.findByIdAndUpdate(Id,{$pull:{log:{$in: res}}, $addToSet:{overdue: res}},{new: true}, (err,user)=>{
          if(err) console.log(err)
          console.log(user)
        } )
        User.findByIdAndUpdate(Id,{$pull:{log:{$in: res3}}, $addToSet:{overdue: res3}},{new: true}, (err,user)=>{
          if(err) console.log(err)
          console.log(user)
        } )
        

        

        

    }
    })

})
}

function onTime(){
  var mailOpts = {
    from: `${sender}`,
    to: '',
    subject: 'Your tasks for today ',
    html: '<h1>That was easy!</h1>',
    attachments: [ 
      {filename: 'EmailImage.jpg', path: './EmailImage.jpg'}
    ]
  };
  cron.schedule('*/10 * * * * *', ()=>{
    let t=new Date();
    let GMT=t.toLocaleString();
    let T=t.toISOString();
    User.find({}, (err,d)=>{
      if (err) console.log(err)
      let t=d.length;
      console.log(t)
      for(let i=0;i<t;i++){
        let f=d[i].log
        let res=f.filter(z=>z.date==T.slice(0,10))
        console.log(res)
        mailOpts.html=`Email sent at: ${GMT.slice(10,GMT.length)} on ${GMT.slice(0,10)}<br>Your tasks for today: <ul>`
        res.forEach((d,i)=>{
          mailOpts.html+=`<li>${JSON.stringify(d)}</li>`
        })
        mailOpts.html+='</ul>'
        mailOpts.to=`${d[i].email}`
    
        transporter.sendMail(mailOpts, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      })

    }
    

      console.log('running every 10 secs')
    })


})
}

performUpdate()
app.listen(3002);
