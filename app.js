
/**
 * Module dependencies.
 */

var 
  express = require('express'), 
  app = module.exports = express.createServer(),
  mongoose = require('mongoose'),
  db = mongoose.connect('mongodb://localhost/ballGame'),
  mongooseStore = require('connect-mongodb'),
  mongooseStoreInst = new mongooseStore({
      url: 'mongodb://localhost/ballGame'
  }),
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
    store: mongooseStoreInst, 
    cookie: { maxAge: 60000 * 20 }
  }));
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.set('socketHost', 'localhost');
  app.set('socketPort', '3000');
  
  app.use(express.logger());
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.set('socketHost', '50.19.253.147');
  app.set('socketPort', '80');
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
  
  // Look for client update messages
  client.on('message', function(message){
    var messageObj = JSON.parse(message);
    
    // Get session obj and update datastore
    mongooseStoreInst.get(messageObj.userID, function(err, session){
      
      if (session !== undefined) {
        session.pos = messageObj.pos;
        session.dir = messageObj.dir;
        session.clientID = client.sessionId;
        session.active = true;
        session.moving = messageObj.moving;
        mongooseStoreInst.set(messageObj.userID, session);
      }
    });
    
    // Broadcast update to clients
    client.broadcast(messageObj);
    
  }); 
  
  // Handle disconnects
  client.on('disconnect', function(){
    
    // Update active status in db
    mongooseStoreInst.getCollection().findOne({ 'session.clientID': client.sessionId}, function(err, data) {
      if ( data !== undefined ) {
        data.session.active = false;
        mongooseStoreInst.set(data._id, data.session, function(err, data){});
        
        // Broadcast disconnect to clients
        client.broadcast(data.session);
      }
    });
    
  });
});

// Start server

app.listen(3000);
console.log("Express server listening on port %d", app.address().port);
