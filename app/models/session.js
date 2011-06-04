
exports.defineModel = function(db, mongoose) {
  var
    Schema = mongoose.Schema,
    Session;

  // Schema  
  var Session = new Schema({
    session: {
      userID: { type: String, index: true, get: getUserID },
      x: { type: Number, index: true },
      y: { type: Number, index: true },
      z: { type: Number, index: true }
    }  
  });
  
  // We display this publicly. Don't want to give the full sessionID of every user to just anybody!
  function getUserID(uid) {
    // First 24 chars of userID is the UUID, rest is the hash
    return uid.slice(0, 24);
  }

  // Define model
  mongoose.model('Session', Session);

  // Return model
  return db.model('Session');
};