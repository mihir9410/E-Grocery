var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressSession = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const fs = require('fs');
const mongoose = require('mongoose');
let multer = require('multer');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dataRouter = require('./routes/data');
const passport = require('passport');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret:"hi hello"
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(dataRouter.serializeUser());
passport.deserializeUser(dataRouter.deserializeUser());

app.use(flash());

app.use(bodyParser.json());

app.get('/api/orders', (req, res) => {
  fs.readFile('orders.json', (err, data) => {
      if (err) {
          res.status(500).send('Error reading orders file');
      } else {
          res.send(JSON.parse(data));
      }
  });
});

// Endpoint to update an order status
app.put('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;
  const updatedStatus = req.body.status;

  fs.readFile('orders.json', (err, data) => {
      if (err) {
          res.status(500).send('Error reading orders file');
      } else {
          let orders = JSON.parse(data);
          const orderIndex = orders.findIndex(order => order.id === orderId);
          if (orderIndex !== -1) {
              orders[orderIndex].status = updatedStatus;
              fs.writeFile('orders.json', JSON.stringify(orders, null, 2), (err) => {
                  if (err) {
                      res.status(500).send('Error writing orders file');
                  } else {
                      res.send(orders[orderIndex]);
                  }
              });
          } else {
              res.status(404).send('Order not found');
          }
      }
  });
});

mongoose.connect("mongodb://127.0.0.1:27017/ownerDB")
.then(()=>{
    console.log('itemDB connected')
  })
  .catch(()=>{
    console.log('failed')
  });

const myschema = new mongoose.Schema({
    name: String,
    quantity: Number,
    date: Date,
    picture: String
});

const mymodel = mongoose.model('table', myschema);

// Storage Setting
let storage = multer.diskStorage({
    destination: './public/images', // directory (folder) setting
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname); // file name setting
    }
});

// Upload Setting
let upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == 'image/jpeg' ||
            file.mimetype == 'image/jpg' ||
            file.mimetype == 'image/png' ||
            file.mimetype == 'image/gif'
        ) {
            cb(null, true);
        } else {
            cb(null, false);
            cb(new Error('Only jpeg, jpg, png, and gif Image allowed'));
        }
    }
});

// SINGLE IMAGE UPLOADING
app.post('/singlepost', upload.single('single_input'), (req, res) => {
    let newRecord = {
        name: req.body.name,
        quantity: req.body.quantity,
        date: req.body.date,
        picture: req.file.filename
    };

    mymodel.create(newRecord)
        .then(() => {
            res.redirect('/view');
        })
        .catch((err) => {
            console.log(err);
        });
});


// DELETE IMAGE
app.post('/delete/:id', (req, res) => {
    mymodel.findByIdAndDelete(req.params.id)
        .then((data) => {
            // Delete the old image file from the server
            fs.unlink(path.join(__dirname, 'public', 'images', data.picture), (err) => {
                if (err) {
                    console.log(err);
                }
            });
            res.redirect('/view');
        })
        .catch((err) => {
            console.log(err);
        });
});

// EDIT IMAGE
app.get('/edit/:id', (req, res) => {
    mymodel.findById(req.params.id)
        .then((data) => {
            res.render('edit', { data });
        })
        .catch((err) => {
            console.log(err);
        });
});

// UPDATE IMAGE
app.post('/update/:id', upload.single('picture'), (req, res) => {
    let updateData = {
        name: req.body.name,
        quantity: req.body.quantity,
        date: req.body.date
    };
    
    if (req.file) {
        updateData.picture = req.file.filename;
    }

    mymodel.findByIdAndUpdate(req.params.id, updateData)
        .then((data) => {
            if (req.file) {
                // Delete the old image file from the server
                fs.unlink(path.join(__dirname, 'public', 'images', data.picture), (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
            }
            res.redirect('/view');
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get('/add', (req, res) => {
    res.render('add');
});

app.get('/view', (req, res) => {
    mymodel.find({})
        .then((data) => {
            res.render('preview', { data });
        })
        .catch((err) => {
            console.log(err);
        });
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
