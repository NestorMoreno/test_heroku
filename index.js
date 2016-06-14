/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

var bodyParser = require('body-parser');
var express = require('express');
// var fbsub = require("fbsub");
var app = express();

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));
console.log('Se ha subido la aplicacion en el puerto 5000');
console.log('http://localhost:5000/');
app.use(bodyParser.json());




 
// fbsub.init({
//     appId: 164231482595,
//     appSecret: 'a4292a0aae9cb62cfd507dd485d696aa',
//     verifyToken: 'tokendeprueba',              
//     callbackUrl: 'https://tiendaf.herokuapp.com/facebook',
// });

// var object = 'user';
// var fields = ['interests','about','about_me','likes'];

// fbsub.authenticate(function(err) {
//     if (err == null) {
//         fbsub.subscribe(object, fields, function(err) {
//             if (err == null) {
//                 // ... 
//                 console.log('fbsub subscribe succeed!');
//             } else {
//                 // ... 
//                 console.log('fbsub subscribe failed...' + err);
//             }
//         });
//     } else {
//         // ... 
//         console.log('fbsub auth failed...');
//     }
// });



app.get('/', function(req, res) {
  console.log(req);
  res.send('Funciona!');
});

// app.get(['/facebook', '/instagram'], function(req, res) {
//   if (
//     req.param('hub.mode') == 'subscribe' &&
//     req.param('hub.verify_token') == 'tokendeprueba'

//   ) {
//     res.send(req.param('hub.challenge'));
//   } else {
//     res.sendStatus(400);
//   }
// });

// app.post('/facebook', function(req, res) {
//   console.log('Facebook request body:');
//   console.log(req.body);
//   // Process the Facebook updates here
//   res.sendStatus(200);
// });

// app.post('/instagram', function(req, res) {
//   console.log('Instagram request body:');
//   console.log(req.body);
//   // Process the Instagram updates here
//   res.sendStatus(200);
// });



// Prueba falaChat
app.get(['/webhook'], function(req, res) {
  if (req.query['hub.verify_token'] === 'falachattoken') {
    res.send(req.query['hub.challenge']);
    console.log('-----------------------------------------:');
    console.log(req.body);
  } else {
    res.send('Error, wrong validation token!!!');    
    console.log('------------ERROR-----------------------------:');
  }
});




app.listen();
