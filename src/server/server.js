// server.js
var frontEndPort = 8080;
// BASE SETUP
// =============================================================================
var mongoose = require('mongoose');
var List    = require('./models/list');
var Item  = require('./models/item');
var _ = require('lodash');
var cors = require('cors')


mongoose.connect('mongodb://luismasg:luismasg@ds133388.mlab.com:33388/listsluisma');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var path       = require('path');
var cookieParser = require('cookie-parser'); //not used

// configure app to use bodyParser()
// this will let us get the data from a POST
// app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var port = process.env.PORT || 8081;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router
//app.use(cookieParser());
// router.get('/', function(res, req) {
//     // res.json({ message: 'welcome to the iTexico Interview api!' });
//      res.sendFile();
// });
// app.options('*', cors());
router.get('/', function (req,res) {
  // res.sendFile(path.join(__dirname + './../client/app/index.html'));
  //this didn't work. i gave up
    // res.sendFile(path.resolve('../client/app/index.html'));

});


// middleware to use for all requests
router.use(function(req, res, next) {
// res.cookie('name', 'express').send('cookie set'); //Sets name=express
    // CORS headers
      res.header("Access-Control-Allow-Origin", "http://127.0.0.1:"+frontEndPort); // restrict it to the required domain
      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
      // Set custom headers for CORS
      res.header("Access-Control-Allow-Headers", "Content-type,Accept,X-Custom-Header");
      res.header("Access-Control-Allow-Credentials", "true");
    // res(cors());

      if (req.method === "OPTIONS") {
          return res.status(200).end();
      }

 console.log('\n \n cookies are: ',req.cookies);
   console.log('Signed Cookies: ', req.signedCookies);
   console.log('Signed Cookies: ', req.headers);
      return next();


});


// test route to make sure everything is working (accessed at GET http://localhost:8080/api)


// on routes that end in /list
// ----------------------------------------------------

router.route('/lists')
// create a list (accessed at POST http://localhost:8080/api/lists)
// if name is not empty, it will create a list,
//if name is empty it will return error

.post(function(req, res) {

    console.log(req.body.name);
    if(req.body.name){
        var list = new List({ name: req.body.name,avatar:req.body.avatar });
        list.save(function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('list '+list.name+'has been created');

                res.json({ message: 'list '+list.name+'has been created',data:list });
            }
        });
    }else{res.json({error:"name can't be empty"});}

})
// get all lists (accessed at GET http://localhost:8080/api/lists)
.get(function(req, res) {

        // res.header("Access-Control-Allow-Origin", "*");
    List.find(function (err, lists) {
        if (err) return console.error(err);
        console.log(lists);
        // res.json({ message:`${lists.length} lists found`,data:lists.map((item)=>{return{name:item.name,id:item._id}})});
        res.json(lists);
    });

});

// get the list with that name (accessed at GET http://localhost:8080/api/list/:name)
//todo: find a way to add a item to the list
router.route('/lists/:name')
.get(function(req, res) {
    List.find({ name: req.params.name },(err, list)=>{
        if (err)
        res.send(err);
        //var newItem=new Item({name:'star wars'}); // this is what id like to do
        //list.items.push(9);  // how can i do this?
        res.json({message:list.length+' List found',data:list});
    })
})
.post(function(req, res) {
    var itemsList=[];
    //var list.items=list[0].items;
    var item=new Item({n:req.body.name,d:req.body.description});
    console.log('item name recieved is : ',req.body.name);
        console.log('list recieved is : ', req.params.name);
    List.findOne({ name: req.params.name },function(err, list){
        console.log('list items length: ',list.items.length);
        if(list.items && list.items.length>=1){itemsList=list.items;}
        itemsList.push(item);
        console.log('itemslist: ',itemsList,'\n');
        // list.items=itemsList;
        //
        List.findOneAndUpdate({ name: req.params.name }, { items:itemsList} , function(err, list) {
            if (err) throw err;
            // we have the updated user returned to us
            list.items=itemsList;
            console.log(list);
            res.json(list);
        });



    });

    // use our list model to find the bear we want

})
//polish status code for deletion, maybe return deleted object?
.delete(function(req, res) {

    List.remove({ _id: req.params.name },function(err) {
        if (err)
        res.send(err);
        //if(list)
        res.json({status:204})
    });
});



//************************************

//new items deletelist

router.route('/lists/:id/:item')
// create a list (accessed at POST http://localhost:8080/api/lists)
// if name is not empty, it will create a list,
//if name is empty it will return error
.delete(function(req, res) {
    var itemsToDelete = JSON.parse(req.params.item);
    console.log('\n list ID:',req.params.id);
    console.log('\n list items: ', req.params.item);
    console.log('\n list array from URL: ', itemsToDelete);

    List.findById(req.params.id,function(err, list){
        console.log('\n the list in question: ',list.name);
        console.log('\n the items stored in DB: ',list.items);
        var listItems=list.items;
        var itemsList= _.pullAllWith(listItems,itemsToDelete,(arrVal, othVal)=>{return arrVal._id==othVal}).map((item)=>new Item({n:item.n,d:'empty'}));
        List.findOneAndUpdate({ _id: list._id }, { items:itemsList} , function(err, list) {
            if (err) throw err;
            // we have the updated user returned to us
            list.items=itemsList;
            console.log(list);
            res.json(list);
        });
    });

})
// get all lists (accessed at GET http://localhost:8080/api/lists)
.get(function(req, res) {
        // res.header("Access-Control-Allow-Origin", "*");
    List.find(function (err, lists) {
        if (err) return console.error(err);
        console.log(lists);
        // res.json({ message:`${lists.length} lists found`,data:lists.map((item)=>{return{name:item.name,id:item._id}})});
        res.json(lists);
    });

});

//****************************************


















// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);
// START THE SERVER
// =============================================================================
app.listen(port);
console.log('port is ' + port);
