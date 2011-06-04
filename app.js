
/**
 * Module dependencies.
 */

var 
  express = require('express'), 
  app = module.exports = express.createServer(),
  mongoose = require('mongoose'),
  db = mongoose.connect('mongodb://localhost/ballGame'),
  mongooseStore = require('connect-mongodb'),
  homeController = require('./app/controllers/home_controller.js').defineController(db, mongoose),
  modelController = require('./app/controllers/model_controller.js').defineController(db, mongoose),
  io = require('socket.io'),
  socket;

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/app/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ 
    secret: 'ballGamesareAwesome',
    store: new mongooseStore({
      url: 'mongodb://localhost/ballGame'
    }), 
    cookie: { maxAge: 60000 }
  }));
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.logger());
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

/** 
 *  Routes
 */
app.get('/', homeController.index );

// Models
app.get('/clientModels/*.*', modelController);


// Socket.io

socket = io.listen(app);
socket.on('connection', function(client) { 
  client.on('message', function(){}); 
  client.on('disconnect', function(){});
});

// Start server

app.listen(3000);
console.log("Express server listening on port %d", app.address().port);
