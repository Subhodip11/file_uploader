const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
const ejs = require('ejs');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');

mongoose.connect("mongodb://localhost:27017/upload_files", {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

let imageurl = new mongoose.Schema({
    imageURL: String
})

let image = mongoose.model('image', imageurl);

app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));

let storage = multer.diskStorage({
    destination: './public/uploads/images/',
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

let upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        let fileType = /jpeg|jpg|png|gif/;
        let checkFileType = fileType.test(path.extname(file.originalname).toLowerCase());
        if (checkFileType)
            return cb(null, "Image uploaded Successfully")
        else
            return cb("Erorr: please upload images only");
    }
});

app.get('/', (req, res) => {
    image.find({})
        .then(data => {
            res.render('index', { url: data });
        }).catch(err => {
            console.log(err);
        })
})

app.get('/upload', (req, res) => {
    res.render('upload');
});


//single file upload starts here
app.post('/uploadSingle', upload.single('fileSelect'), (req, res) => {
    let file = req.file;
    console.log(file)
    if (!file) {
        return console.log('Please Select Images only');
    }
    let url = file.path.replace('public', '');
    image.findOne({ imageURL: url })
        .then(data => {
            if (data) {
                console.log('Duplicate image');
            }
            image.create({ imageURL: url })
                .then(data => {
                    res.redirect('/');
                }).catch(err => {
                    console.log(err);
                })
        }).catch(err => {
            console.log(err);
        })
});

//multiple upoloading starts here
app.post('/uploadMultiple', upload.array('multiple'), (req, res) => {
    let files = req.files;
    if (!files) {
        return console.log('Please Select images only');
    }

    files.forEach(file => {
        let url = file.path.replace('public ', '');
        console.log(url);
        image.findOne({ imageURL: url }).then(data => {
            if (data) {
                console.log('Duplicate image ')
            }
            image.create({ imageURL: url }).then(data => {
                res.redirect('/');
            }).catch(err => {
                console.log(err);
            })
        }).catch(err => {
            console.log(err);
        })
    })
});

//deleting image url from database starts here
app.delete('/uploadSingleDelete:id', (req, res) => {
    let id = { _id: req.params.id };
    image.remove(id).then(data => {
        res.redirect('/');
    }).catch(err => {
        console.log(err);
    })
})


const port = process.env.PORT || 2222;
app.listen(port, () => {
    console.log('Server has started listening at ' + port);
})