const express= require('express');
const mongoose=require('mongoose');
const morgan= require('morgan');
const mongoosastic = require('mongoosastic');
const { Client } = require('@elastic/elasticsearch')

const app= express();
app.use(morgan('tiny'));
app.use(express.json());
const mongo_atlas= 'mongodb+srv://sravan_restaurant:sravan123restaurant@restaurant.hzxzr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
mongoose.connect(mongo_atlas || 'mongodb://localhost/restaurant_data',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.connection.on('connected',()=>{
    console.log('connected successfully to database.');
});


const Schema = mongoose.Schema;
const structure= new Schema({
      Name: {type: String, es_type:'text', es_indexed:true},
      Description: {type: String,  es_type:'text', es_indexed:true}, 
               
      geo_with_lat_lon:{
        geo_point: {
            type: String,
            es_type: 'geo_point',
        
            es_indexed:true
            
        },
        lat: {type: Number},
        lon: {type: Number}
        
      },
      avg_rating: {type: Number,  es_type:'double', es_indexed:true},
      no_of_ratings: {type: Number,  es_type:'double',es_indexed:true}

});

structure.plugin(mongoosastic, {
    //"host": "https://54be8995ca0c44a49be87d6975ece257.us-east-1.aws.found.io:9243",
    "host":"localhost",
    "port": 9200
    //"protocol": "https",
    //"auth": "elastic:WZ2GroGD43pnsa9rjw4Nn9Hv"
});
var restaurant = mongoose.model('restaurant', structure);





function insert(res,name,description,objlatlon,avgrating,norating){
    res.createMapping((err, mapping) => {
        if(err){
            console.log('error creating mapping (you can safely ignore this)');
            console.log(err);
          }else{
            console.log('mapping created!');
            console.log(mapping);
          }
    });


var first= new res({
    Name: name ,
    Description: description,
    geo_with_lat_lon:objlatlon,
    avg_rating: avgrating,
    no_of_ratings:norating
});

first.save((err) => {
    if(err) {
        console.log(err);
    }
    console.log('restaurant added in both the databases');
})

first.on('es-indexed', (err, result) => {
    console.log('indexed to elastic search');
});
res.synchronize();
}




 app.get('/:lon/:lat/:km',(req,res)=>{
   restaurant.search({
        bool: {
            must: {
                match_all: {}
            },
            filter :{
                geo_distance: {
                    distance: req.params.km+"km",
                    geo_with_lat_lon: {lat: req.params.lat,
                    lon: req.params.lon}
                }
            }
        }
    },
    function (err, results) {
        
      if (err) {
         res.send(err);
       } else {
         const result123= ({result:results['hits']['hits'].map(function(i){
            return i['_source']; 
        })});
        res.send(result123);
       }
     });
     
     
 });
 app.post('/insert',(req,res)=>{
     if(req.body.name && req.body.description && req.body.objlatlon && req.body.avgrating && req.body.norating){
    insert(restaurant,req.body.name,req.body.description,req.body.objlatlon,req.body.avgrating,req.body.norating)
    res.send("Records synced successfully!");
}
else{
    res.send("enter proper details to submit");}


 });
 app.listen(3000,()=>{
     console.log("listening to port...");
 });
