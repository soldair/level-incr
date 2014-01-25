level-incr
==========

add an atomic increment/decrement command to a level db

### incr(db)
  path the db object with incr and decr

### incr(db,incrStart)
  you may optionally oass incrStart if you need to do something like odd/even

### db.incr(key,cb)
  increment the key by one

### db.incr(key,amount,cb)
  increment the key by amount

### db.decr(key,cb)
  decrement the key by 1

### db.decr(key,amoumt,cb)

  decrement the key by amount
