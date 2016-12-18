var http = require('http')
var express = require('express')

var logger = require('morgan')
var bodyParser = require('body-parser');

var web = __dirname + '/web'
var app = express()

// app.use(logger('dev'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.post('/api/v1/location', (req, res) => {
  console.log(`lat:${req.body.latitude}, long:${req.body.longitude}, acc:${req.body.accuracy} meters`)
  res.sendStatus(200)
})



app.use(express.static(web))

var server = app.listen(8080, "127.0.0.1");

function gracefulShutdown(){
    console.log('\nStarting Shutdown');
    server.close(() => {
        console.log('\nShutdown Complete');
    });
}

process.on('SIGTERM', gracefulShutdown);

process.on('SIGINT', gracefulShutdown);

console.log(`listening on port:${8080}`);
