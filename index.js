var https = require('https')
var express = require('express')
var fs = require('fs')

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
var privateKey  = fs.readFileSync('server.key', 'utf8');
var certificate = fs.readFileSync('server.crt', 'utf8');
var cred = {key: privateKey, cert: certificate}

// var server = app.listen(8080)
var server = https.createServer(cred, app).listen(8443, ()=>{
  console.log(`listening on port:${8443}`)
})

function gracefulShutdown(){
    console.log('\nStarting Shutdown')
    server.close(() => {
        console.log('\nShutdown Complete')
    });
}

process.on('SIGTERM', gracefulShutdown)

process.on('SIGINT', gracefulShutdown)
