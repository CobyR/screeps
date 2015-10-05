module.exports = function(creep) {
  var lca = require('logCreepAction');
  var pickup = require('pickupEnergy');

  if(creep.memory.state == 'fill' || creep.carry.energy == 0) {
    creep.moveTo(creep.room.storage);
    creep.room.storage.transferEnerger(creep,creep.carryCapacity - creep.carry.energy);
    lca(creep, 'getting ' + creep.carryCapacity - creep.carry.energy + ' from storge.');
  } else {
    creep.moveTo(creep.room.controller);
    creep.upgradeController(creep.room.controller);
    lca(creep, 'upgrading controller, ' + creep.carry.energy + ' energy until empty.');
  }
};