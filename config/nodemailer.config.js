const nodemailer = require("nodemailer");
const sng = require("nodemailer-sendgrid-transport");
const dotenv = require("dotenv").config;
const transport = nodemailer.createTransport(
  sng({ auth: { api_key: process.env.SNG_API_KEY } })
);

const sendConfirmationEmail = (username, email, confirmationCode) => {
  try {
    transport.sendMail({
      from: "recosysgame@gmail.com",
      to: email,
      subject: "Confirm your account!",
      html: `<h1> Email Confirmation </h1>
               <h2> Hello ${username} </h2>
               <p> Please confirm your email by clicking on the following link </p>
               <a href=https://tfg-recosys.herokuapp.com/api/auth/confirm/${confirmationCode}> Click here </a>
               </div>
        `,
    });
  } catch (error) {
    console.log(error);
  }
};

const confirmedEmail = (username, email) => {
  try {
    transport.sendMail({
      from: "recosysgame@gmail.com",
      to: email,
      subject: "Account has been verified!",
      html: `<h1> Account verified </h1>
             <h2> Hello ${username} </h2>
             <p> Your account has been verified and you can sign in! </p>
             </div>
      `,
    });
  } catch (error) {
    console.log(error);
  }
};

const changedPassword = (username, email) => {
  try {
    transport.sendMail({
      from: "recosysgame@gmail.com",
      to: email,
      subject: "Password has been changed!",
      html: `<h1> Password changed </h1>
               <h2> Hello ${username} </h2>
               <p> Your password has been changed and you can sign in! </p>
               </div>
        `,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports.sendConfirmationEmail = sendConfirmationEmail;
module.exports.confirmedEmail = confirmedEmail;
module.exports.changedPassword = changedPassword;
