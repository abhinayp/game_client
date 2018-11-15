var mongodb = require('mongodb');

var base = (function() {

  var mongoClient = function(callback) {
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/asnetwork';

    MongoClient.connect(url, function(err, db) {
      if (err) {
        console.log('Unable to connect')
        callback(null, 500, err);
      }
      else {
        console.log('Connection establised');
        callback(db, 200);
        db.close();
      }
    });
  }

  return {
    mongoClient: mongoClient,
  }
})();

module.exports = base;
