function sweep(creep){
  var drops = creep.room.find(FIND_DROPPED_ENERGY);

  var closestDrop = null;
  var distance = 0;
  var shortestDistance = 50;

  for(var index in drops){
    var drop = drops[index];

    distance = creep.pos.getRangeTo(drop);

    if(distance < shortestDistance) {
      shortestDistance = distance;
      closestDrop = drop;
    }
  }
  if(closestDrop === null){
    lca(creep, 'waiting for someone to drop some energy.');
  } else{
    lca(creep, 'moving to ' + closestDrop.pos.x + ',' + closestDrop.pos.y + ' to pickup ' + closestDrop.energy + ' energy.');
  creep.moveTo(closestDrop);
  creep.pickup(closestDrop);
  }

}

function processSweepers(sweepers, room){
  if(sweepers.length > 0) {
    log('[Sweepers] -----------------','creep');

    for(var id in sweepers) {
      var creep = Game.getObjectById(sweepers[id]);
      sweep(creep);
    }
  }

}