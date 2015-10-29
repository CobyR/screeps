function harvest(creep, source) {
  var busy = 0;
  var STORAGE_LIMIT = 200000;

  switch(creep.memory.state){
  case 'gathering':
    if(creep.carry.energy == creep.carryCapacity){
      creep.memory.state = 'transferring';
    } else {
      lca(creep, 'is gathering energy: ' + creep.carry.energy + ' of ' + creep.carryCapacity + ' from Source at ' + source.pos.x + ',' + source.pos.y + ' ' + source.pos.roomName + '.');
      creep.moveTo(source);
      creep.harvest(source);
    }
    break;
  case 'transferring':
    var target = findNearestEnergyNeed(creep);

    creep.moveTo(target);
    creep.transferEnergy(target);

    if(creep.energy === 0){
      creep.memory.state = 'gathering';
    }
    break;
  }
}
