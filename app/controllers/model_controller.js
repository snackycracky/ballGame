
exports.defineController = function(db, mongoose) {
  
  return function(req, res) {
    res.charset = 'utf8';
    res.send('', {
      'Content-Length': 0,
      'Content-Type': 'application/javascript'
      //,'Etag'
    }, 200);
  };

}