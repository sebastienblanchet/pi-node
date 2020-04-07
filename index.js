//require http server, and create server with function handler()
var http = require('http').createServer(handler);
//require filesystem module
var fs = require('fs');
//require socket.io module and pass the http object (server)
var io = require('socket.io')(http)
//include pigpio to interact with the GPIO
var Gpio = require('pigpio').Gpio,
  //use GPIO pin 4 as output for RED
  ledRed = new Gpio(4, {
    mode: Gpio.OUTPUT
  }),
  //use GPIO pin 17 as output for GREEN
  ledGreen = new Gpio(17, {
    mode: Gpio.OUTPUT
  }),
  //use GPIO pin 27 as output for BLUE
  ledBlue = new Gpio(27, {
    mode: Gpio.OUTPUT
  }),
  //set starting value of RED variable to off (0 for common cathode)
  redRGB = 0,
  //set starting value of GREEN variable to off (0 for common cathode)
  greenRGB = 0,
  //set starting value of BLUE variable to off (0 for common cathode)
  blueRGB = 0;

//RESET RGB LED
// Turn RED LED off
ledRed.digitalWrite(0);
// Turn GREEN LED off
ledGreen.digitalWrite(0);
// Turn BLUE LED off
ledBlue.digitalWrite(0);

//listen to port 8080
http.listen(8080);

//what to do on requests to port 8080
function handler(req, res) {
  //read file index.html in public folder
  fs.readFile(__dirname + '/public/index.html', function (err, data) {
    if (err) {
      res.writeHead(404, {
        'Content-Type': 'text/html'
      });
      //display 404 on error
      return res.end("404 Not Found");
    }
    //write HTML
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    //write data from index.html
    res.write(data);
    return res.end();
  });
}

// Web Socket Connection
io.sockets.on('connection', function (socket) {
  //get light switch status from client
  socket.on('rgbLed', function (data) {
    //output data from WebSocket connection to console
    console.log(data);

    //for common cathode RGB LED 0 is fully off, and 255 is fully on
    redRGB = parseInt(data.red);
    greenRGB = parseInt(data.green);
    blueRGB = parseInt(data.blue);

    //set RED LED to specified value
    ledRed.pwmWrite(redRGB);
    //set GREEN LED to specified value
    ledGreen.pwmWrite(greenRGB);
    //set BLUE LED to specified value
    ledBlue.pwmWrite(blueRGB);
  });
});

//on ctrl+c
process.on('SIGINT', function () {
  // Turn RED LED off
  ledRed.digitalWrite(0);
  // Turn GREEN LED off
  ledGreen.digitalWrite(0);
  // Turn BLUE LED off
  ledBlue.digitalWrite(0);
  //exit completely
  process.exit();
});