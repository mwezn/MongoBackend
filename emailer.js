require('dotenv').config();
var nodemailer=require('nodemailer')
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
  from: `${process.env.EMAIL}`,
  to: 'wezleyg78@gmail.com',
  subject: 'Welcome after Registering!',
  attachments: [ 
    {filename: 'EmailImage.jpg', path: './views/EmailImage.jpg'}
  ]
  
}
transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });