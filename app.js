const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const nodemailer = require('nodemailer');
const cred = require('./credentials');
const multer = require('multer');
const fs = require('fs');


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

// MULTER
const storage = multer.diskStorage({
    destination: './upload',
    filename: function(req, file, cb){
        cb(null, file.fieldname = 'image' + path.extname(file.originalname));
    }
});

// init upload
const upload = multer({
    storage: storage, 
    limits: {fileSize:10000000}, // 10million bytes 10MB
    fileFilter: function(req, file, cb){
        checkFileType(file,cb)
    }
}).single('upload');

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
            if(req.file == undefined){
                res.render({ message: 'No file selected'});
            }else{
                res.render('contact', {
                    msg: `${req.file.filename} Uploaded, Please continue`,
                    file: `upload/${req.file.filename}`
                })
            }
        }
    })
})

app.use('/upload', express.static('upload'))

app.post('/send', (req, res) => {
    const output = `
    <p>You have a new quote request</p>
    <h3>Contact Details</h3>
    <p> Email: ${req.body.email}<br>
        Tel: ${req.body.telno}<p>
    <h3>Truck Details</h3>
    <p> Make: ${req.body.make}<br>
        Model: ${req.body.model}<br>
        Mileage: ${req.body.mileage}</p>
    <div><img src="cid:batman"/></div>
    
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

    const getImage = () => {
        try { 
            const files = fs.readdirSync('./upload');
            console.log(files[0]);
            return files[0];
        } catch (err){
            console.error(err);
        }
    }
    const isFile = getImage()
    
    // send mail with defined transport object
   let mailOptions = {
        from: cred.credentials.from, // sender address
        to: cred.credentials.to, // list of receivers
        subject: cred.credentials.subject, // Subject line
        text: "", // plain text body
        html: output, // html body
        attachments: [{
            filename: isFile,
             path: `./upload/${isFile}`,
            cid: 'batman' //same cid value as in the html img src
        }]
    };

    // sending here and killing images
    transporter.sendMail(mailOptions, (error, info) => {
        if(error){
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview url: %s', nodemailer.getTestMessageUrl(info));
        res.render('send', {msg: 'Your enquiry has been sent'})

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