// make sure your mongodb is on
// setup db schema and connection
require( './setup' );

var Flow     = require( '../../lib/flow' );
var mongoose = require( 'mongoose' );
var User     = mongoose.model( 'User' );
var data     = require( './data' );

var flow  = new Flow;
var users = {};

// delete all users before start
flow.series( function ( next ){
  User.remove( function ( err, count ){
    next();
  });
});

// insert records from source data
data.users.forEach( function ( user ){
  flow.parallel( function ( user, next ){
    new User( user ).save( function ( err, user ){
      next();
    });
  }, user );
});

// we must set an end point for parallel tasks
flow.join();

// find matching records
// 'fifi', 'jenny', 'steffi'
data.names.forEach( function ( name ){
  flow.parallel( function( name, ready ){
    User.findOne({
      name : name
    }, function ( err, user ){
      users[ name ] = user;
      ready();
    });
  }, name );
});

flow.join( true );

// print out records and disconnect
flow.end( function(){
  console.log( users );
  mongoose.disconnect();
});