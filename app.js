var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var apiai = require('apiai');
var app = express();
var pg = require('pg');

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen(app.get('port'));
console.log('Se ha subido la aplicacion. http://localhost:5000/');

// Server frontpage
app.get('/', function(req, res) {
  console.log(req);
  res.send('Este es un Webhook!');
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

            var time = event.timestamp;
            var appapi = apiai("d8ff392035b34e418df6f05f12f101b3");
            var request = appapi.textRequest(event.message.text);
            request.on('response', function(response) {
                var txtMsg = response['result']['fulfillment']['speech'];
                if (txtMsg) {
                    sendMessage(event.sender.id, {text: txtMsg });
                    insertData(1, txtMsg, time, 'bot', '');
                }                
                // Get User info
                getUserInfo(event.sender.id, event.message.text, time);
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
            console.log('Error en send: ', response.body.error);
        }
    });
};

// Get user info
function getUserInfo(id, text, time) {
    var url = 'https://graph.facebook.com/v2.6/' + id + '?fields=first_name,last_name,profile_pic&access_token=' + process.env.PAGE_ACCESS_TOKEN;
    //console.log("2: " + url);
    request({
        url: url,
        method: 'GET',
        contentType: 'application/json'
    }, function(error, response, body) {
        if (error) {
            console.log('Error en user info: ', error);
        } else if (response.body.error) {
            console.log('Error en send user info: ', response.body.error);
        }
        else{

            body = JSON.parse(body);
            var customerName = body.first_name + ' ' + body.last_name;
            var customerImage = body.profile_pic;
            //console.log('Nombre: ' + body.first_name + ' ' + body.last_name + ' img:' + body.profile_pic);
            // DataBase
            insertData(id, text, time, customerName, customerImage);
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

function insertData(customerId, message, time, customerName, customerImage){
    var client = new pg.Client({
        user: "aqqqwndvanofqy",
        password: "okOt8byPmeWttNtfKYY6AB6ihB",
        database: "dach7eo5s7la18",
        port: 5432,
        host: "ec2-54-235-240-76.compute-1.amazonaws.com",
        ssl: true
    }); 

    client.connect(function(err) {
        if(err) {
            return console.log('could not connect to postgres2', err);
        }        
        
        client.query("INSERT INTO public.incoming (\"Message\", \"CustomerMobile\", \"ChatType\",\"TimeStamp\",\"IdState\",\"CustomerName\",\"CustomerImage\") values($1,$2,$3,$4,$5,$6,$7)",
            [message, customerId, '2', time, '0', customerName, customerImage], function(err, result) {
            if(err) {
                return console.log('Se presentó error en la ejecución del query2.', err);
            } 
            console.log('Inserción Ok.');
            client.end();
        });
    });
}

app.listen();
