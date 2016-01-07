
var express = require('express');


var app = express();
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var poiRouter = express.Router();
var georedis = require('./georedis');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static('images'));

// Using Multer for image uploads.
var uploadImage = multer({
   dest: './images/'
})

poiRouter.route('/poi/:lat/:long/:rad')
   .get(function(req, res){
      console.log("getting locations,  lat: " + req.params.lat + " long: " + req.params.long + " radius: " + req.params.rad);
      georedis.getLocations(req.params.lat, req.params.long, req.params.rad, function(responseJson) {
         console.log(responseJson);
         res.json(responseJson);
      });
   });

poiRouter.route('/poi/:name/')
      .get(function(req, res){
         var responseJson = georedis.getLocation(req.params.name, function(responseJson){
            res.json(responseJson);
         });
      });

poiRouter.route('/poi/upload')
.post(uploadImage.single('image'), function(req, res) {
   // concat image url and name into 'name'
   req.body.name = req.file.filename  + "|" + req.body.name;
   console.log("adding:");
   console.log(req.body);
   georedis.addLocation(req.body, function(responseJson) {
      res.json(responseJson);
   });

});

poiRouter.route('/poi')
   // DN HUSET: 59.327962, 18.015884
   .get(function(req, res){
      georedis.getLocations(59.327962,18.015884 ,500, function(responseJson) {
         res.json(responseJson);
      })

   })
   .post(function(req, res) {

      georedis.addLocation(req.body, function(responseJson) {
         res.json(responseJson);
      })

   })
   .delete(function(req, res) {
      georedis.deleteAll(function(responseJson) {
         res.send("deleted...");
         console.log("deleted..." + responseJson);
      });
   });


app.use('/', poiRouter);

// app.get('/poi/', function(req, res){
//    console.log("get " + req);
//    res.send('Welcome to the POI API!');
// });

app.listen(port, function(req, res) {
   console.log("listening on port " + port )
});
