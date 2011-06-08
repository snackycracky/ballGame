
exports.defineModel = function(db, mongoose) {
  var
    Schema = mongoose.Schema,
    User;

  // Schema  
  var User = new Schema({
    userID: { type: String, index: true},
    pos: {
      x: { type: Number, index: true },
      y: { type: Number, index: true },
      z: { type: Number, index: true }
    },
    dir: {
      x: { type: Number, index: true },
      y: { type: Number, index: true },
      z: { type: Number, index: true }
    },
    moving: Boolean,
    type: { type: String, index: true }
  });

  // Define model
  mongoose.model('User', User);

  // Return model
  return db.model('User');
};