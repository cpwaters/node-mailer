const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const nodemailer = require('nodemailer');
const cred = require('./credentials');

const app = express();

//view engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

app.locals.layout = false;
// use contact.handlebars page
app.get("/", (req, res) =>{
    res.render('contact', { layout:false })
});

app.post('/send', (req, res) => {
    const output = `
    <p>You have a new quote request</p>
    <h3>Contact Details</h3>
    <p>Name: ${req.body.name}<br>
       Email: ${req.body.email}<br>
       Tel: ${req.body.telno}<p>
    <h3>Insurance Required</h3>
    <p>Type of insurance required: ${req.body.type}<br>
       Renewal Date: ${req.body.renewal_date === undefined ? 'Not entered' : req.body.renewal_date}</p>
    <h3>Business Details</h3>
    <p>Company: ${req.body.company === undefined ? 'Not given' : req.body.company}<br>
       Address: ${req.body.houseNameNumber} ${req.body.address_1}<br>
                ${req.body.address_2 === '' ? req.body.town : req.body.address_2}<br>
                ${req.body.town}<br>
                ${req.body.city}<br>
                ${req.body.postcode}<br>
    </p>
    <h3>Other Information</h3>
    <p>${req.body.message === undefined ? 'None' : req.body.message}</p>
    `;

        // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: cred.credentials.host,
        port: cred.credentials.port,
        secure: false, // true for 465, false for other ports
        auth: {
        user: cred.credentials.user, // generated ethereal user
        pass: cred.credentials.pass, // generated ethereal password
        },
        tls: {
            rejectUnauthorized:false
        }, 
        dkim: {
            domainName: cred.credentials.domainName, 
            keySelector: cred.credentials.keySelector, 
            privateKey: cred.credentials.privateKey,
        }
    });

    // send mail with defined transport object
   let mailOptions = {
        from: cred.credentials.from, // sender address
        to: cred.credentials.to, // list of receivers
        subject: cred.credentials.subject, // Subject line
        text: "", // plain text body
        html: output, // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if(error){
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview url: %s', nodemailer.getTestMessageUrl(info));

        res.render('send', {msg: 'Your enquiry has been sent'})

    });
});

app.listen(3050, () => console.log('server started...'));