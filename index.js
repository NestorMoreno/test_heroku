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

//var pg = require('pg');



app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen(app.get('port'));
console.log('Se ha subido la aplicacion en el puerto 5000');
console.log('http://localhost:5000/');

//var client = new pg.Client({
//    user: "aqqqwndvanofqy",
//    password: "okOt8byPmeWttNtfKYY6AB6ihB",
//    database: "dach7eo5s7la18",
//    port: 5432,
//    host: "ec2-54-235-240-76.compute-1.amazonaws.com",
//    ssl: true
//}); 

//client.connect(function(err) {
//  if(err) {
//    return console.error('could not connect to postgres', err);
//  }
//  var query = 'SELECT "Id","Message","CustomerMobile","ChatType","Date","IdState","CustomerName","IdAttached" FROM public.incoming;';
//  client.query(query, function(err, result) {
//    if(err) {
//      return console.error('Se presentó error en la ejecución del query.', err);
//    } 
//    console.log(result.rows[0].Message);
//    client.end();
//  });
//});


// Server frontpage
app.get('/', function(req, res) {
  console.log(req);
  res.send('Webhook de prueba. ¡Funciona!');
});

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
                sendMessage(event.sender.id, {text: response['result']['fulfillment']['speech']});
                console.log('Se fue a insertar. ');
                //insertData();
                console.log('Terminó de insertar. ');
            });
            request.on('error', function(error) {
                console.log(error);
                sendMessage(event.sender.id, {text: 'Se presentó error: ' + error});
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
                            "title": "Título principal",
                            "subtitle": "Texto de prueba para el mensaje, este es un texto de prueba para el mensaje.",
                            "image_url": imageUrl ,
                            "buttons": [{
                                "type": "web_url",
                                "url": imageUrl,
                                "title": "Mostrar imagen"
                                }, {
                                "type": "postback",
                                "title": "Botón de acción",
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

function insertData(){
  // SQL Query > Insert Data
  client.query('INSERT INTO public.incoming("Message","CustomerMobile","ChatType","Date","IdState","CustomerName") ' + 
    'values("Mensaje3", "123456789", "2", "06-23-2016", "0","CustomerName")');
   client.query(query, function(err, result) {
    if(err) {
      return console.error('Se presentó error en la inserción.', err);
    }
    console.log('Insertó!!!');
    client.end();
  });
}

app.listen();
