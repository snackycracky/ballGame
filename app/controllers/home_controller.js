var
  userModel = require('./../models/user.js'),
  sessionModel = require('./../models/session.js'),
  ObjectID = require('mongodb').BSONNative.ObjectID;


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
        req.session.x = 0;
        req.session.y = 0;
        req.session.z = 0;
        req.session.userID = req.sessionID;
      }
      
      // Get userID as ObjectID
      userID = req.session.userID;

      // Find all sessions and output json data
      sessionModel.find({}, function(err, docs) {
        var i, len;
        
        
        // Look for current user
        for ( i = 0; len = docs.length, i < docs.length; i++) {
          
          if ( docs[i].session.userID === userID ) {
            userInst = docs[i];
            docs.splice(i, 1);
          }
          
        }
          
        if ( userInst === undefined ) {
          // Couldn't find user
          userInst = req.session;
        }
        
        
        // Render page + JSON character data
        res.render("index", {
          "title": "Three.js - BallGame",
          "character": JSON.stringify(userInst),
          "players": JSON.stringify(docs)
        });
      });
        
    }
    
  };

};

