var cron =require('node-cron');
var express=require('express')
var nodemailer=require('nodemailer')
let app=express();
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: YOUR_EMAIL_ADDRESS,
      pass: YOUR_PASSWORD
    },
     tls: {
            rejectUnauthorized: false
        }
  });
  var mailOptions = {
    from: 'YOUR_EMAIL_ADDRESS',
    to: 'RECIPIENT',
    subject: 'Welcome after Registering! ',
    html: '<h1>That was easy!</h1>'
  };



cron.schedule('* * * * *', ()=>{
    let t=new Date();
    let f=t.toISOString();

    mailOptions.html=`Email sent at: ${f.slice(11,19)}`
    console.log('running every minute');
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

})
app.listen(3000);
