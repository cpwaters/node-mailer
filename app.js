const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const nodemailer = require('nodemailer');
const mailView = require('./views/mailview')

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
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>
        <li>${req.body.title} ${req.body.firstname} ${req.body.surname}</li>
        <li>${req.body.email_address}</li>
    </ul>
    <h3>Cover Required</h3>
    <p>${req.body.radio_1}</p>
    <h3>Business Details</h3>
    <p>Name: ${req.body.business_name}</p>
    <p>Postcode: ${req.body.postcode}</p>
    <p>Turnover(£): ${req.body.turnover}</p>
    `;


        // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "iron.cloudhosting.co.uk",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
        user: 'quote@plant-insurance.co.uk', // generated ethereal user
        pass: 'wlb*bX*$AMPC', // generated ethereal password
        },
        tls: {
            rejectUnauthorized:false
        }, 
        dkim: {
            domainName: "plant-insurance.co.uk", 
            keySelector: "default", 
            privateKey: "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwpBqbattdYYlYWdU2+gpgPQIMlUeD2rqf4z1stSGfP99GFuy6r3Jaz3u+gbPtLDjda8dQbIVzlRR07o0KuDdNAPS+tGaieMlVFzHpEhqt4Mp4vRthUaBO/DSCfeCNWd7+tAA2w2BR0sZYoXaajq2OIWunpaD0d/mluNqmRMiyn51f6ZsPMAob/le9pvJKhr0/YOHnkkwf5h0VleUln1RLwo8nZygj3w0mdoQijTgH/2kw+wYRXMisGLK4xJyXQn6ImHaxnvSAv7JWCr+Y0WTXLQoCS7SESvscjUvGN96vTdCo1i+pougDqCZcfJldl3VasdI7dZYf3G/KU4Pzv8sGQIDAQAB;"
        }
    });

    // send mail with defined transport object
   let mailOptions = {
        from: '"plant-insurance.co.uk" <quote@plant-insurance.co.uk>', // sender address
        to: "cp-waters@hotmail.co.uk", // list of receivers
        subject: "New quote request", // Subject line
        text: "", // plain text body
        html: output, // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if(error){
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview url: %s', nodemailer.getTestMessageUrl(info));

        res.render('contact', {msg: 'Enquiry has been sent'})

    });
});

app.listen(3050, () => console.log('server started...'));