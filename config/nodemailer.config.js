const nodemailer = require("nodemailer");
const dotenv = require("dotenv").config;
const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

const sendConfirmationEmail = (username, email, confirmationCode) => {
  try {
    transport.sendMail({
      from: "noreplay@gmail.com",
      to: email,
      subject: "Confirm your account!",
      html: `<h1> Email Confirmation </h1>
               <h2> Hello ${username} </h2>
               <p> Please confirm your email by clicking on the following link </p>
               <a href=http://${process.env.IP}:3000/api/auth/confirm/${confirmationCode}> Click here </a>
               </div>
        `,
    });
  } catch (error) {
    console.log(error);
  }
};

const confirmedEmail = (username, email) => {
  transport.sendMail({
    from: "noreplay@gmail.com",
    to: email,
    subject: "Account has been verified!",
    html: `<h1> Account verified </h1>
             <h2> Hello ${username} </h2>
             <p> Your account has been verified and you can sign in! </p>
             </div>
      `,
  });
};

const changedPassword = (username, email) => {
  transport.sendMail({
    from: "noreplay@gmail.com",
    to: email,
    subject: "Password has been changed!",
    html: `<h1> Password changed </h1>
             <h2> Hello ${username} </h2>
             <p> Your password has been changed and you can sign in! </p>
             </div>
      `,
  });
};

module.exports.sendConfirmationEmail = sendConfirmationEmail;
module.exports.confirmedEmail = confirmedEmail;
module.exports.changedPassword = changedPassword;
