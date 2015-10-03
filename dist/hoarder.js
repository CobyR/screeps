module.exports = function(creep) {
  var lca = require('logCreepAction');
  var nwc = require('numberWithCommas');
  var busy = 0;

  if(creep.spawning == true) {
    lca(creep, 'is still spawning.');
    return 0;
  }

  if(creep.carry.energy == 0 || creep.memory.state == 'gathering') {
    var sources = creep.room.find(FIND_SOURCES);
    lca(creep, 'is gathering energy.');
    creep.moveTo(sources[0]);
    creep.harvest(sources[0]);
    if(creep.carry.energy == creep.carryCapacity) {
      creep.memory.state = 'transferring';
    } else {
      creep.memory.state = 'gathering';
    }
  } else {
    var target = creep.room.storage;
    lca(creep, 'is taking energy (' + creep.carry.energy + ') to storage (' + nwc(target.store.energy) + ' of ' + nwc(target.storeCapacity) + ').');
    creep.moveTo(creep.room.storage);
    creep.transferEnergy(creep.room.storage);
  }
};