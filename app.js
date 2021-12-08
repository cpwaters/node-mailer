require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const nodemailer = require('nodemailer');
const cred = require('./credentials');
const multer = require('multer');
const {readdirSync} = require('fs');
const fs = require('fs');

//const accountSid = process.env.TWILIO_ACCOUNT_SID;
//const authToken = process.env.TWILIO_AUTH_TOKEN;
//const client = require('twilio')(accountSid, authToken);

const app = express();

//view engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// static folder
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/splide', express.static(__dirname+"/node_modules/@splidejs/splide/dist"))

app.locals.layout = false;
// use contact.handlebars page
app.get("/", (req, res) =>{
    res.render('contact', { layout:false })
});

let num = 1;

// MULTER
const storage = multer.diskStorage({
    destination: './upload',
    filename: function(req, file, cb){
        cb(null, file.fieldname = 'image'+ num++ + path.extname(file.originalname));
    }
});

// init upload
const upload = multer({
    storage: storage, 
    limits: {fileSize:10000000}, // 10million bytes 10MB
    fileFilter: function(req, file, cb){
        checkFileType(file,cb)
    }
}).array('upload');

// check file and mime type
function checkFileType(file, cb){
    const filetypes = /jpeg|jpg|png|gif/;
    const extention = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extention){
        return cb(null, true);
    }else {
        cb('error images only')
    }
}

app.post('/', (req, res) => {
    upload(req, res, (err) => {
        if(err){
            res.render({ message: err });
        }else{
            res.render('contact', {
                msg: 'Uploaded, Please continue'
            })
        }
    })
})

app.use('/upload', express.static('upload'))

app.post('/send', (req, res) => {
    
/*
    const WhatsappOutput = `
    You have a new quote request
    Contact Details:
    Email: ${req.body.email}
    Tel: ${req.body.telno}
    Truck Details:
    Make: ${req.body.make}
    Model: ${req.body.model}
    Mileage: ${req.body.mileage}
    `;
*/


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
 
    const getImages = () => {
        try { 
                const [...files] = readdirSync('./upload');
                return files;
            } catch (err){
                console.error(err);
        }
    }

    const isFile = getImages()

    let attachments = [];
    for(let i=0;i < isFile.length; i++){
        attachments.push({
            filename: `${isFile[i]}`,
            path: `./upload/${isFile[i]}`,
            cid: `M${isFile[i]}`,
        });
        console.log('attachments: ', attachments)
    }
    
    const output = `
    <p>You have a new quote request</p>
    <h3>Contact Details</h3>
    <p> Email: ${req.body.email}<br>
        Tel: ${req.body.telno}<p>
    <h3>Truck Details</h3>
    <p> Make: ${req.body.make}<br>
        Model: ${req.body.model}<br>
        Mileage: ${req.body.mileage}</p>
    <div>${isFile[0] == undefined ? '' : `<img src="cid:M${isFile[0]}"/></div>` }</div>
    <div>${isFile[1] == undefined ? '' : `<img src="cid:M${isFile[1]}"/></div>` }</div>
    <div>${isFile[2] == undefined ? '' : `<img src="cid:M${isFile[2]}"/></div>` }</div>
    <div>${isFile[3] == undefined ? '' : `<img src="cid:M${isFile[3]}"/></div>` }</div>
    <div>${isFile[4] == undefined ? '' : `<img src="cid:M${isFile[4]}"/></div>` }</div>
    `;

    // send mail with defined transport object
    let mailOptions = {
        from: cred.credentials.from, // sender address
        to: cred.credentials.to, // list of receivers
        bcc: cred.credentials.bcc,
        subject: cred.credentials.subject, // Subject line
        text: "", // plain text body
        html: output, // html body
        attachments: attachments
    };

    // sending here and killing images

    transporter.sendMail(mailOptions, (error, info) => {
        if(error){
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview url: %s', nodemailer.getTestMessageUrl(info));
        res.render('send', {msg: 'Your enquiry has been sent'})

        // whatsapp twilio
        /*
        client.messages
        .create({
            from: 'whatsapp:+14155238886',
            body: WhatsappOutput,
            mediaUrl: [`http://localhost:3050/upload/${isFile}`],
            to: 'whatsapp:+447496980896'
        })
        .then(message => console.error(message.sid));
        */
        
        // Kills images in ./upload (temp pics)
        const directory = './upload';
        fs.readdir(directory, (err, files) => {
            if(files != null){
                for (const file of files) {
                    fs.unlink(path.join(directory, file), err => {
                        if(err) throw err;
                    });
                }
            }else{
                null
            }   
        });

    });

});

app.listen(3050, () => console.log('server started...'));