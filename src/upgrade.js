function upgrade(creep) {
  var spawn = creep.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_SPAWN}})[0];

  if(creep.memory.state == 'fill') {
    if(creep.carry.energy == creep.carryCapacity) {
      if(spawn.energy < spawn.energyCapacity && !creep.memory.locked) {
        creep.memory.role = 'harvester';
        lca(creep, 'is now in \'harvester\' mode.');
      } else {
        if(typeof creep.memory.locked === 'undefined' || creep.memory.locked === false) {
          creep.memory.state = 'upgrade';
          lca(creep, 'is now in \'upgrade\' mode.');
        } else {
          lca(creep, 'is a permanent harvester.');
        }
      }
    }
  } else {
    if(creep.carry.energy === 0) {
      creep.memory.state = 'fill';
    }
  }
  var usefulExtensions = getExtensionsWithEnergy(creep);
  var extension = null;

  if(creep.carry.energy === 0  || (creep.memory.state == 'fill' && creep.carry.energy < creep.carryCapacity)) {
    if(typeof creep.room.storage !== 'undefined' && creep.room.storage.store.energy >= USE_STORAGE_THRESHOLD){
      lca(creep, 'is getting energy from storage.');
      creep.moveTo(creep.room.storage);
      pickupEnergy(creep);
      creep.room.storage.transferEnergy(creep,creep.carryCapacity - creep.carry.energy);
    } else if(usefulExtensions.length > 0){
      for(var id in usefulExtensions){
        extension = usefulExtensions[id];

        if(extension.energy == extension.energyCapacity){
          lca(creep,'is getting energy from an extension.');
          creep.moveTo(extension);
          extension.transferEnergy(creep);
          break;
        }
      }
    } else {
      var sources = creep.room.find(FIND_SOURCES);
      lca(creep, 'is gathering energy.');
      creep.moveTo(sources[0]);
      creep.harvest(sources[0]);
      pickupEnergy(creep);
    }
  } else {
    if(spawn.energy < spawn.energyCapacity  && !creep.memory.locked && creep.room.level < 4) {
      lca(creep, 'spawn is low on energy changing to harvester mode.');
      creep.memory.role='harvester';
    } else {
      lca(creep, 'is upgrading controller.');
      creep.moveTo(creep.room.controller);
      creep.upgradeController(creep.room.controller);
    }
  }
}
