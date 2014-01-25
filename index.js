var undef;

module.exports = function(db){
  db.incr = function dbIncr(key,amount,cb){
    handle(key,amount,cb,1,this);
  };

  db.decr = function dbDecr(key,amount,cb){
    handle(key,amount,cb,-1,this);
  };
  // if i return the db will people think this is a unique sublevel?
  // i much prefer monkey patching in this case.
  return db;
}

// TODO BIGNUMS
// string - bigint
// buffer - math-buffer 
module.exports.pending = pending = {};

function handle(key,amount,cb,direction,db){
  if(amount === undef) amount = 1;
  else if(typeof amount == 'function') (cb = amount) && (amount = 1);

  cb = _cb(cb);

  if(amount === 0) return setImmediate(function(){
    cb(new Error('incr/decr does no good if you pass 0'));
  });
  amount *= direction;

  if(pending[key]){
    // add callback
    pending[key].incr += amount;
    pending[key].cbs.push(cb);
    return;
  }

  pending[key] = {
    current:undef,
    incr:amount,
    cbs:[cb]
  };
  
  getCurrent(db,key);

}

function getCurrent(db,key){
  // lru should be on in leveldown c. is it faster to lru in js?
  db.get(key,function(err,value){
    if(err && err.type != 'NotFoundError') {
      var o = pending[key];
      delete pending[key];
      while(o.cbs.length) o.cbs.shift()(err);
      return;
    } else if(err && err.type == 'NotFoundError') {
      value = 0;
    } else {
      value = +value;
      if(isNaN(value)) value = 0;
    }
    
    pending[key].current = value;
    updateValue(db,key);
  });
}

function updateValue(db,key){
  var savingValue = pending[key].current+pending[key].incr;
  pending[key].current = savingValue;
  pending[key].incr = 0;

  var cbs = pending[key].cbs;
  pending[key].cbs = [];

  db.put(key,savingValue,function(err){
    while(cbs.length) cbs.shift()(err,savingValue);
   
    if(pending[key].cbs.length) {
      if (!pending[key].incr) {
        // +0 === no change
        var morecbs = pending[key].cbs;
        delete pending[key];
        while(morecbs.length) morecbs.shift()(err,savingValue);  
      } else {
        return updateValue(key);
      }
    }
    delete pending[key];
  });
}

function _cb(cb){
  if(!cb) return function(e){
    if(e) throw e;
  }
  return cb;
}


