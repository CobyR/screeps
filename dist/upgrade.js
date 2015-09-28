module.exports = function (creep, p_room) {
  if(creep.spawning == true) {
    console.log(creep.name + '|' + creep.memory.role + ' is still spawning.');
    return 0
  }

  if(creep.memory.state == 'fill') {
    if(creep.carry.energy == creep.carryCapacity) {
      if(Game.spawns.Harbor.energy < Game.spawns.Harbor.energyCapacity) {
        creep.memory.role = 'harvester';
        console.log(creep.name + ' is now in \'harvester\' mode.');
      } else {
        if(typeof creep.memory.locked === 'undefined' || creep.memory.locked == false) {
          creep.memory.state = 'upgrade';
          console.log(creep.name + ' is now in \'upgrade\' mode.');
        } else {
          console.log(creep.name + ' is a permanent harvester.');
        }
      }
    }
  } else {
    if(creep.carry.energy == 0) {
      creep.memory.state = 'fill';
    }
  }

  if(creep.carry.energy == 0  || creep.memory.state == 'fill') {
    var sources = creep.room.find(FIND_SOURCES);
    console.log(creep.name + '|' + creep.memory.role + ' is gathering energy.');
    creep.moveTo(sources[0]);
    creep.harvest(sources[0]);
  } else {
    console.log(creep.name + '|' + creep.memory.role + ' is upgrading controller.');
    creep.moveTo(creep.room.controller);
    creep.upgradeController(creep.room.controller);
  }
}