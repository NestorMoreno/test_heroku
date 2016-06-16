/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */


var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var apiai = require('apiai');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen(app.get('port'));
console.log('Se ha subido la aplicacion en el puerto 5000');
console.log('http://localhost:5000/');

 
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


// Server frontpage
app.get('/', function(req, res) {
  console.log(req);
  res.send('Webhook de prueba.');
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



// Facebook Webhook
app.get(['/webhook'], function(req, res) {
  if (req.query['hub.verify_token'] === 'falachattoken') {
    res.send(req.query['hub.challenge']);
    console.log('-----------------------------------------:');
    console.log(req.body);
  } else {
    res.send('Error, en validación de token!!!');    
    console.log('------------ERROR-----------------------------:');
  }
});


// handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
          if (!kittenMessage(event.sender.id, event.message.text)) {
            
            var appapi = apiai("d8ff392035b34e418df6f05f12f101b3");
            var request = appapi.textRequest(event.message.text);
            request.on('response', function(response) {
                //console.log('respuesta bot:' + response);
                sendMessage(event.sender.id, {text: 'respuesta bot:' + response['result']['fulfillment']['speech']});
            });

            request.on('error', function(error) {
                console.log(error);
                sendMessage(event.sender.id, {text: 'Se presentó error.'+error});
            });
            request.end()
            
          }else if (event.postback) {
            console.log("Postback received: " + JSON.stringify(event.postback));
          }

        }
    }
    res.sendStatus(200);
});

// generic function sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};


// send rich message with kitten
function kittenMessage(recipientId, text) {
    
    text = text || "";
    var values = text.split(' ');
    
    if (values.length === 3 && values[0] === 'gato') {
        if (Number(values[1]) > 0 && Number(values[2]) > 0) {
            
            var imageUrl = "https://placekitten.com/" + Number(values[1]) + "/" + Number(values[2]);
            
            message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Kitten",
                            "subtitle": "Cute kitten picture",
                            "image_url": imageUrl ,
                            "buttons": [{
                                "type": "web_url",
                                "url": imageUrl,
                                "title": "Show kitten"
                                }, {
                                "type": "postback",
                                "title": "I like this",
                                "payload": "User " + recipientId + " likes kitten " + imageUrl,
                            }]
                        }]
                    }
                }
            };
    
            sendMessage(recipientId, message);
            
            return true;
        }
    }
    
    return false;
    
};

app.listen();
