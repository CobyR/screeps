function hoardRCL(creep) {

  if(creep.spawning) {
    lca(creep, 'is still spawning.');
    return 0;
  }


  if(creep.memory.state == 'fill' || creep.carry.energy === 0) {
    creep.moveTo(creep.room.storage);
    creep.room.storage.transferEnergy(creep,creep.carryCapacity - creep.carry.energy);
    lca(creep, 'getting ' + creep.carryCapacity - creep.carry.energy + ' from storage.');
  } else {
    creep.moveTo(creep.room.controller);
    creep.upgradeController(creep.room.controller);
    lca(creep, 'upgrading controller, ' + creep.carry.energy + ' energy until empty.');
  }
}