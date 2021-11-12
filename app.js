const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const nodemailer = require('nodemailer');

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
        host: "iron.cloudhosting.co.uk",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
        user: 'quote@plant-insurance.com', // generated ethereal user
        pass: 'cj,)JDqY^nfS', // generated ethereal password
        },
        tls: {
            rejectUnauthorized:false
        }, 
        dkim: {
            domainName: "plant-insurance.com", 
            keySelector: "default", 
            privateKey: "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr2fR+8xKVl2Z6mRj+waSK55kTL4C8YijPi5yxXtQ9Lqo5PSjf3avl+c9ORWg1sFOlgBNnLgjyk2unKs6caADyQPgFEN6zAYdsyvp06hR2Ony39/WS19oGNQokohO4AObzAuFTMTocHdUlsFeh6Tn51JSOeS7bs75pggFcFE27BZDpDUJeUnzZfcOtZas+vkPgEz2CYZ92zrvxuj17fRXAiQ1847d3XcHTLw+KckSKsluYRxrj14Y2RESdGtv7/vhk4XPIjut2qXH4XdNZriPwxXNfFslM3o7KK3+SGL/9hnf+Y5RC1C+KoWeR6tPQoR3zTMOKHKRpeiCRaF/OoypkwIDAQAB;"
        }
    });

    // send mail with defined transport object
   let mailOptions = {
        from: '"plant-insurance.com" <quote@plant-insurance.com>', // sender address
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

        res.render('send', {msg: 'Your enquiry has been sent'})

    });
});

app.listen(3050, () => console.log('server started...'));