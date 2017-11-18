var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var User = require('../models/user');
var config = require('../config');
var hash = require('../hash')

exports.getAllUsers = function(req,res) {
    User.find().sort({id: 1}).exec((err,users) => {
        if (err) throw err;
        res.render('index', {user: users} );
    });
};

exports.getUsers = function(req,res) {
    User.find().sort({id: 1}).exec((err,users) => {
        if (err) throw err;
        res.json(users);
    });
};

exports.addUser = (req,res) => {
    var salt = hash.genRandomString(16);
    var pwd_data = hash.sha512(req.body.password, salt);
    User.find({}).sort({id: -1}).limit(1).exec( (err,users) => {
        if (err) throw err;
        if (users && users.length != 0){
            var newuser = new User({
                id: users[0].id + 1,
                name: req.body.name,
                age: parseInt(req.body.age),
                email: req.body.email,
                salt: pwd_data.salt,
                passHash: pwd_data.passwordHash,
                admin: req.body.admin ? req.body.admin : false
            });
            newuser.save( function(err,user) {
                if (err) {
                    return res.json({
                        success: false,
                        message: 'Unable to add new user!',
                        error: err,
                    });
                } else {
                    return res.json({
                        success: true,
                        message: 'New user has been created',
                        user: {
                            name: newuser.name,
                            email: newuser.email,
                            admin: newuser.admin
                        }
                    });
                }
            });
        } else {
            return res.json({
                success: false,
                message: 'User cannot be added!'
            });
        }
    });
    
}

exports.getUserById = (req,res) => {
    var validParam = parseInt(req.params.id);
    if ( isNaN(validParam) ) return res.json({result : 'Bad user id parameter'});
    User.findOne( {id: req.params.id }, (err,user) => {
        if(err) throw err;
        if (!user){
            res.json({result : 'User id ' + req.params.id + ' doesn\'t exist'})
        }
        else {
            res.json(user);
        }
    });
}

exports.updateUserById = (req,res) => {
    var queryId = { id: req.params.id};
    User.findOne(queryId, (err,user) => {
        if (err) throw err;
        if (user && user.length != 0){
            user.name = req.body.name? req.body.name:user.name;
            user.email = req.body.email? req.body.email:user.email;
            user.age = req.body.age? req.body.age:user.age;
            user.save( function(err,user) {
                if (err) {
                    return res.json({
                        success: false,
                        message: 'Unable to update user data!',
                        error: err.message,
                    });
                } else {
                    return res.json({
                        success: true,
                        message: 'User ' + req.params.id + ' has been updated',
                        updatedUser: {
                            name: user.name,
                            email: user.email,
                            admin: user.admin
                        }
                    });
                }
            });
        } else {
            return res.json({
                success: false,
                message: 'User does not exist!',
            });
        }
    });
}

exports.removeUserById = (req,res) => {
    var queryId = req.params.id;
    User.findOneAndRemove({id: queryId}, (err,user) => {
        if (err) throw err;
        else if (user && !user.admin) {
            res.json({
                success: true,
                message: 'Successfully removed user id ' + user.id
            });
        } else {
            res.json({
                success: false,
                message: 'User already not exist'
            });
        }

    });
}

exports.login = (req,res) => {
    User.findOne({email: req.body.email}, (err,user) => {
        if (err) throw err;
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Authentication failed. User not found.'
            });
        }
        else if (user) {
            var passwdData = hash.sha512(req.body.password, user.salt);
            if (user.pastHash != passwdData.passwordHash) {
                return res.json({
                    success: false,
                    message: 'Authentication failed. Wrong password.' });
            } else {
                const payload = {
                    id: user.id,
                    email: user.email,
                    admin: user.admin
                };
                var token = jwt.sign(payload, config.secret, {
                    expiresIn: 86400 // expires in 24 hours
                });
                return res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                });
            }
        } // end of else if(user)
    }); // end of the callback function
}
