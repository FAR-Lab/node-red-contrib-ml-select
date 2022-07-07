var http = require('http');

//create a server object:
var configJson = {
    input:{

    },
    help:{
        
    }
}
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});; //write a response to the client
  res.write(JSON.stringify(configJson));
  res.end(); //end the response
}).listen(9080); //the server object listens on port 8080