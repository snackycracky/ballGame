
exports.defineModel = function(db, mongoose) {
  var
    Schema = mongoose.Schema,
    User;

  // Schema  
  var User = new Schema({
    x: { type: Number, index: true },
    y: { type: Number, index: true },
    z: { type: Number, index: true }
  });

  // Define model
  mongoose.model('User', User);

  // Return model
  return db.model('User');
};