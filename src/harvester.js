function harvest(creep, source) {
  var busy = 0;
  var STORAGE_LIMIT = 200000;
  //if(typeof creep.room.storage !== 'undefined' && creep.room.storage.store.energy > 500000) {
  //  // forget harvesting I'm just going to upgrade
  //  creep.memory.role = 'upgrade';
  //  creep.memory.state = 'fill';
  //  upgrade(creep);
  //  return OK;
  //}
  var spawn = creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN}})[0];
  var drops = creep.room.find(FIND_DROPPED_ENERGY);
  var targets = null;

  if(drops > 0){
    lca(creep,'dropped energies available: ' + drops.length);
  }

  if(creep.carry.energy === 0 || (creep.memory.state == 'gathering' && creep.carry.energy < creep.carryCapacity)) {
    lca(creep, 'is gathering energy: ' + creep.carry.energy + ' of ' + creep.carryCapacity + ' from Source at ' + source.pos.x + ',' + source.pos.y + ' ' + source.pos.roomName + '.');
    creep.moveTo(source);
    if(drops.length > 0) {
      pickupEnergy(creep,drops);
    }
    creep.harvest(source);
    creep.memory.state = 'gathering';
  } else {
    creep.memory.state = 'transferring';
    if(spawn.energy == spawn.energyCapacity) {
      lca(creep, 'observed that the spawn energy level is at capacity.', true);
      lca(creep, 'has ' + creep.carry.energy + ' energy.',true);
      if(creep.carry.energy > 0) {
        var target = findNearestEnergyNeed(creep);
        if(target !== null){
          lca(creep, 'is taking energy to a (' + target.structureType + ' - ' + target.pos.x +',' + target.pos.y + ' it is at ' + target.energy + ' of ' + target.energyCapacity + ').');
          creep.moveTo(target);
          creep.transferEnergy(target);
          busy = 1;
        } else {
          lca(creep, 'all extensions and spawn are full.');
        }
      }

      if(busy === 0 && (typeof creep.memory.locked === 'undefined' || creep.memory.locked === false)) {
        creep.memory.role = 'upgrade';
        console.log(creep.name + ' is now in \'upgrade\' mode.');
      }
    } else {
      lca(creep, 'is taking energy to spawn: ' + creep.carry.energy + ' of ' + creep.carryCapacity + '.');
      creep.moveTo(spawn);
      creep.transferEnergy(spawn);
    }
  }
}
