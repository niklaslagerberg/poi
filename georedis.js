"user strict"

var redis = require('redis')
var client = redis.createClient();
var geo = require('georedis').initialize(client);

var geoRedis = {
   deleteAll: function() {
      geo.delete(function() {
         console.log("deleted");
         return {deleted: "res"};
      })
   },
   getLocation: function(name, callback) {

      geo.location(name, function(err, location){
         if(err) {
            callback({error: err});
         } else {
            if(location) {
               callback({latitude: location.latitude, longitude: location.longitude, x_lat: location.x_lat, x_long: location.x_long});
            }else{
               callback({"Error": "No location found with the name: " + name});
            }
         }
      })
   },
   getLocations: function(lat, long, radius, callback) {
      // DN HUSET: 59.327962, 18.015884
      //geo.nearby({latitude: 18.015884, longitude: 59.327962}, 5000, function(err, locations){
      var options = {
        withCoordinates: true, // Will provide coordinates with locations, default false
        withHashes: true, // Will provide a 52bit Geohash Integer, default false
        withDistances: true, // Will provide distance from query, default false
        order: 'ASC', // or 'DESC' or true (same as 'ASC'), default false
        units: 'm', // or 'km', 'mi', 'ft', default 'm'
        count: 100, // Number of results to return, default undefined
        accurate: true // Useful if in emulated mode and accuracy is important, default false
      }

      geo.nearby({latitude: lat, longitude: long}, radius, options, function(err, locations){
         if(err) {
            console.log("error " + err);
            callback({'error:': err});
         } else {
            console.log('nearby locations:' + locations);
            callback({'nearby': locations});
         }
      })
   },
   addLocation: function(loc, callback) {
      console.log("adding " + loc.name + " at: " + loc.latitude + " " + loc.longitude);
      geo.addLocation(loc.name, {latitude: loc.latitude, longitude: loc.longitude, x_lat: loc.latitude, x_long: loc.longitude}, function(err, reply) {
         if(err) {
            console.log("error " + err);
            callback({error: err});
         } else {
            console.log('added location:' + reply);
            callback({added_location: reply});
         }
      })
   }
}

module.exports = geoRedis
