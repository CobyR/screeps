module.exports = function (creep, p_room) {
  var lca = require('logCreepAction');

  var fixPrioritizedStructure = require('builderGetPrioritizedStructure');

    if(creep.spawning == true) {
      lca(creep, 'is still spawning.');
      return 0;
    }

    if(creep.carry.energy == 0  && creep.room.storage.store.energy >= 10000) {
      lca( creep, 'is getting energy from storage.');
        creep.moveTo(creep.room.storage);
      creep.room.storage.transferEnergy(creep,creep.carryCapacity - creep.carry.energy);
    }
    else {
        if(creep.carry.energy == 0) {
          lca( creep, 'is traveling to spawn for energy.');
          creep.moveTo(Game.spawns.Harbor);
        }
        else {
            var targets = p_room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length == 0) {
              // lca(creep, 'calling fixPrioritizedStructure', true);
              creep.memory.state = 'repairing';
              fixPrioritizedStructure(creep);
            }
            else {
                // console.log('[DEBUG] Construction sites: ' + targets.length);
                if(targets.length > 0) {
                  creep.memory.state = 'constructing';
                  lca(creep, 'found a construction site.');
                  creep.moveTo(targets[0]);
                  creep.build(targets[0]);
                  creep.memory.currentTarget = null; // this causes them to forget what they were working on before
                } else {
                  console.log(creep.name + '|' + creep.memory.role + ' needs a construction site.');
                }
            }
        }
    }
}
