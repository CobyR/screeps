module.exports = function (creep, p_room) {
  var lca = require('logCreepAction');
  var pickup = require('pickupEnergy');

  if(creep.spawning == true) {
    lca(creep,'is still spawning.');
    return 0;
  }

  if(creep.memory.state == 'fill') {
    if(creep.carry.energy == creep.carryCapacity) {
      if(Game.spawns.Harbor.energy < Game.spawns.Harbor.energyCapacity) {
        creep.memory.role = 'harvester';
        lca(creep, 'is now in \'harvester\' mode.');
      } else {
        if(typeof creep.memory.locked === 'undefined' || creep.memory.locked == false) {
          creep.memory.state = 'upgrade';
          lca(creep, 'is now in \'upgrade\' mode.');
        } else {
          lca(creep, 'is a permanent harvester.');
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
    lca(creep, 'is gathering energy.');
    creep.moveTo(sources[0]);
    creep.harvest(sources[0]);
    pickup(creep);
  } else {
    if(Game.spawns.Harbor.energy < Game.spawns.Harbor.energyCapacity) {
      lca(creep, 'spawn is low on energy changing to harvester mode.');
      creep.memory.role='harvester';
    } else {
      lca(creep, 'is upgrading controller.');
      creep.moveTo(creep.room.controller);
      pickup(creep);
      creep.upgradeController(creep.room.controller);
    }
  }
};