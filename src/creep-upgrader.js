var UPGRADER = {
  1: [ MOVE, WORK, CARRY, CARRY]
}

function processUpgraders(creeps){
  
}

function upgrade(creep) {
  var spawn = creep.room.find(FIND_MY_SPAWNS)[0];
  var sources = creep.room.find(FIND_SOURCES);

  switch(creep.memory.state){
  case 'fill':
    if(creep.carry.energy == creep.carryCapacity) {
      creep.memory.state = 'upgrade';
    } else {
      lca(creep, 'is gathering energy.');
      creep.moveTo(sources[0]);
      creep.harvest(sources[0]);
      pickupEnergy(creep);
    }
    break;
  case 'upgrade':
    if(creep.carry.energy === 0){
      creep.memory.state = 'fill';
    } else {
      lca(creep, 'is upgrading controller.');
      creep.moveTo(creep.room.controller);
      creep.upgradeController(creep.room.controller);
    }
    break;
  }
}

function spawnUpgrader(spawn, room, current, max){
  spawnCreep(spawn, room, current, max,
             UPGRADER, 'upgrader', 'upgraderCounter');
}