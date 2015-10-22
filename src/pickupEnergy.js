function pickupEnergy(creep, drops) {
  if(drops === null) {
    drops = creep.room.find(FIND_DROPPED_ENERGY);
  }

  for(var index in drops) {
    var drop = drops[index];

    var results = creep.pickup(drop);
    if(results != OK && results != ERR_NOT_IN_RANGE){
      lca(creep, 'tried to pickup dropped energy: ' + displayErr(results));
    } else {
      lca(creep, 'tried to pickup dropped energy: ' + displayErr(results), true);

    }
  }
}