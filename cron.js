require('dotenv').config();
var cron =require('node-cron');
var express=require('express')
var nodemailer=require('nodemailer')
let app=express();
const User = require('./models/Emailschema')
const ejs= require('ejs')



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




 

// The following function separates users scheduled tasks from the overdue ones!
function performUpdate(){
  cron.schedule('*/30 * * * * *', ()=>{
    console.log("performing Update")
    let t=new Date();
    let T=t.toISOString();
    let GMT= t.toLocaleTimeString([],{hour:'2-digit', minute:'2-digit',hour12:false})
    User.find({}, (err,d)=>{
      if (err) console.log(err)
      let t=d.length;
      for(let i=0;i<t;i++){
        
        let f=d[i].log
        let Id= d[i]['_id']
        let res=f.filter(z=>z.date<T.slice(0,10))
        let res2=f.filter(z=>z.date==T.slice(0,10))
        let pastTime=res2.filter(z=>z.time<GMT)
        let now=res2.filter(z=>z.time==GMT)
        //let res3=res2.filter(z=>z.time[0]=='0'?z.time.slice(1,5)<GMT.slice(0,5):z.time.slice(0,2)>12?(z.time.slice(0,2)-12+z.time.slice(2,5))<GMT.slice(0,5):z.time<GMT.slice(0,5))
        //let res4=res2.filter(z=>z.time.slice(0,2)>12?(z.time.slice(0,2)-12+z.time.slice(2,5))==GMT.slice(0,5):z.time==GMT.slice(0,5))
        if(now.length!==0){
          ejs.renderFile(__dirname + "/views/ReminderEmail.ejs", {userName: d[i].username, time: GMT, date: T.slice(0,10), mongoDB: now},
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
          
        } )
        User.findByIdAndUpdate(Id,{$pull:{log:{$in: pastTime}}, $addToSet:{overdue: pastTime}},{new: true}, (err,user)=>{
          if(err) console.log(err)
          console.log(user)
          
        } )
        

        

        

    }
    })

})
}
module.exports.performUpdate= performUpdate;
//performUpdate()
//app.listen(3002);
