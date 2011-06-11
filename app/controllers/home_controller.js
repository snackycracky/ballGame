var
  userModel = require('./../models/user.js'),
  sessionModel = require('./../models/session.js'),
  ObjectID = require('mongodb').BSONNative.ObjectID,
  app = require('./../../app.js');


exports.defineController = function(db, mongoose) {
  // Define models
  userModel = userModel.defineModel(db, mongoose);  
  sessionModel = sessionModel.defineModel(db, mongoose);  

  // Routes
  return {
    
    /*
      Index action
    */
    index: function(req, res){
      var 
        userID, userInst;

      // User has a new session - place initial positioning
      if ( req.session.userID === undefined ) {
        req.session.pos = {
          x: 0,
          y: 40,
          z: 0
        };
        req.session.dir = {
          x: 0,
          y: 0,
          z: 0
        };
        req.session.moving = false;
        req.session.type = "rock";
        req.session.userID = req.sessionID;
      }
      
      // Make user active
      req.session.active = true;
      
      // Get userID as ObjectID
      userID = req.session.userID;

      // Find all sessions and output json data
      sessionModel.find({}, function(err, docs) {
        var i, len;
        
        // Look for current user
        for ( i = 0; len = docs.length, i < docs.length; i++) {
          docs[i] = docs[i].session
          if ( docs[i].userID === userID || docs[i].active === false) {
            docs.splice(i, 1);
            i--;
          } 
                    
        }
          
        userInst = req.session;  
        
        // Render page + JSON character data
        res.render("index", {
          "title": "Three.js - BallGame",
          "character": JSON.stringify(userInst),
          "players": JSON.stringify(docs),
          'socketHost': app.set('socketHost'),
          'socketPort': app.set('socketPort')
        });
      });
        
    }
    
  };

};

