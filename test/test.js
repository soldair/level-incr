var test = require('tape');
var level = require('level');
var incr = require('../')

test("can inc a value",function(t){
  var db = level('./db');
  var k = 'testinc';

  incr(db);
  var c = 2;
  db.incr(k,function(err,res){
    console.log(err,res);
    if(!--c) t.end();
  })
  db.incr(k,-2,function(err,res){
    console.log(err,res);
    t.end();
    if(!--c) t.end();
  })
})
