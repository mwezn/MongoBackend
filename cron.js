require('dotenv').config();
var cron =require('node-cron');
var express=require('express')
var nodemailer=require('nodemailer')
let app=express();
const mongoose=require('mongoose')
const User = require('./models/Emailschema')

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
  var mailOptions = {
    from: `${sender}`,
    to: 'wezleyg78@gmail.com',
    subject: 'Welcome after Registering! ',
    html: '<h1>That was easy!</h1>'
  };

function cronFunc(){
  cron.schedule('* * * * *', ()=>{
    let t=new Date();
    let f=t.toISOString();
    User.find({}, (err,d)=>{
      mailOptions.html=`Email sent at: ${f.slice(11,19)} & the user in db is ${d} `
      console.log(d)
      console.log('running every minute');
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

    })

    

})
  
}

function performUpdate(){
  cron.schedule('*/10 * * * * *', ()=>{
    let t=new Date();
    let T=t.toISOString();
    User.find({}, (err,d)=>{
      if (err) console.log(err)
      let t=d.length;
      console.log(t)
      for(let i=0;i<t;i++){
        let f=d[i].log
        //console.log(f,typeof(f))
        let res=f.filter(z=>z.date<=T.slice(0,10))
        res.push(d[i].email)
        console.log(res)

    }

      console.log('running every 10 secs')
    })

})
}

function onTime(){
  var mailOpts = {
    from: `${sender}`,
    to: '',
    subject: 'Your tasks for today ',
    html: '<h1>That was easy!</h1>'
  };
  cron.schedule('*/10 * * * * *', ()=>{
    let t=new Date();
    let T=t.toISOString();
    User.find({}, (err,d)=>{
      if (err) console.log(err)
      let t=d.length;
      console.log(t)
      for(let i=0;i<t;i++){
        let f=d[i].log
        //console.log(f,typeof(f))
        let res=f.filter(z=>z.date==T.slice(0,10))
        //res.push(d[i].email)
        console.log(res)
        mailOpts.html=`Email sent at: ${T} & your tasks for today: <ul>`
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


onTime();
app.listen(3002);
