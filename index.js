/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

var bodyParser = require('body-parser');
var express = require('express');
var fbsub = require("fbsub");
var app = express();

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));
console.log('Se ha subido la aplicacion en el puerto 5000.');
console.log('http://localhost:5000/');
app.use(bodyParser.json());




 
fbsub.init({
    appId: 164231482595,
    appSecret: a4292a0aae9cb62cfd507dd485d696aa,
    verifyToken: EAAAAJjz1jOMBAK91lXnjNMNK4qWAjZA6TnvRxNdp8vayXkj6E6zsWzDXK7DlNlWqh0GHTdOE4zfq9Bp1KqMoZAWXCpZChg2lyzRHgNM9Ta4ZCIfrdZC3WWvgpgKW5TZC5HWjUSmv617iZBRHKGfsfdEn0A7HDCnb98506jyI1oZCmAZDZD,
    callbackUrl: 'https://tiendaf.herokuapp.com/facebook',
});






app.get('/', function(req, res) {
  console.log(req);
  res.send('It works! Hola esta es una prueba');
});

app.get(['/facebook', '/instagram'], function(req, res) {
  if (
    req.param('hub.mode') == 'subscribe' &&
    req.param('hub.verify_token') == 'EAAAAJjz1jOMBAH4OuHdaMRpX72xAOuoWZCRGTfRAi4JeI4aGXON7y6gmEjxIEjLJLFuSzGwkM8ob5WKKsMDsQehBrSnF1sBdMQE4oKrRQZCOnhg8WZCP6spRX6orSyliWJrgT7GNULpbq1TgKBW23XDZCLViaxJd1ulNdg1ykgZDZD'

  ) {
    res.send(req.param('hub.challenge'));
  } else {
    res.sendStatus(400);
  }
});

app.post('/facebook', function(req, res) {
  console.log('Facebook request body:');
  console.log(req.body);
  // Process the Facebook updates here
  res.sendStatus(200);
});

app.post('/instagram', function(req, res) {
  console.log('Instagram request body:');
  console.log(req.body);
  // Process the Instagram updates here
  res.sendStatus(200);
});

app.listen();
