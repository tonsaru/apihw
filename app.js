// =======================
// get the packages we need ============
// =======================
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
// var User = require('./models/user'); // get our mongoose model
var Users = require('./controllers/userController');
var Post = require('./controllers/postController');
// =======================
// configuration =========
// =======================
var port = process.env.PORT || config.port; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('appSecret', config.secret); // secret variable
app.set('views', __dirname);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// =======================
// routes ================
// =======================
// basic route
app.post('/login', function(req,res){
    Users.login(req,res);
});

app.post('/users', (req,res) => {
    Users.addUser(req,res);
});

// API ROUTES -------------------

app.get('/', (req,res) => {
    Users.getAllUsers(req,res);
});

app.use( (req,res,next) => {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Invalid token.' });
            } else {
                req.decoded = decoded; // add decoded token to request obj.
                next(); // continue to the sensitive route
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
})

app.get('/users', (req,res) => {
    Users.getUsers(req,res);
});

app.get('/users/:id', (req, res) => {
    Users.getUserById(req,res);
});

app.put('/users/:id', (req, res) => {
    Users.updateUserById(req,res);
});

app.delete('/users/:id', (req, res) => {
    Users.removeUserById(req,res);
});

// =======================
// start the server ======
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);
