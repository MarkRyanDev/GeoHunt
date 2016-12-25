var https = require('https')
var express = require('express')
var fs = require('fs')

var logger = require('morgan')
var bodyParser = require('body-parser');

var web = __dirname + '/web'
var app = express()

app.use(logger('dev'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//add new hunt
app.post('/api/v1/hunts/:name', (req, res) => {
  fs.stat('hunts/' + req.params.name, (err, stats) => {
    if (stats && stats.isFile()){
      res.status(409)
      res.json({
        status: 409,
        message: 'name already used'
      })
    } else {
      fs.writeFile('hunts/' + req.params.name, JSON.stringify(req.body), err => {
        if (err) console.error(err);
        else res.sendStatus(201)
      })
    }
  })
})

app.get('/api/v1/hunts', (req, res) => {
  fs.readdir('hunts', (err, files) => {
    if (err) {
      console.error(err)
      res.sendStatus(400)
    }
    else res.json(files)
  })
})

app.get('/api/v1/hunts/:name', (req, res) => {
  fs.readFile('hunts/' + req.params.name, 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      res.sendStatus(400)
    }
    else res.json(JSON.parse(data))
  })
})

app.use(express.static(web))

app.get('/*', function(req, res){
  res.sendFile(web + '/index.html');
});


var privateKey  = fs.readFileSync('secret/server.key', 'utf8');
var certificate = fs.readFileSync('secret/server.crt', 'utf8');
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
