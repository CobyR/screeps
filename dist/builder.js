module.exports = function (creep, p_room) {
  var lca = require('logCreepAction');

  var fixPrioritizedStructure = require('builderGetPrioritizedStructure');

    if(creep.spawning == true) {
      lca(creep, 'is still spawning.');
      return 0;
    }

  var extensions = creep.room.find(FIND_MY_STRUCTURES, {filter: {
                                                          structureType: STRUCTURE_EXTENSION
                                                            } });
  var usefulExtensions = [];

  for(var id in extensions){
    var extension = extensions[id];
    if(extension.energy == extension.energyCapacity){
      usefulExtensions.push(extension);
    }
  }

    if(creep.carry.energy == 0 || (creep.memory.state == 'filling' && creep.carry.energy != creep.carryCapacity)) {
      creep.memory.state = 'filling';
      if(typeof creep.room.storage !== 'undefined' && creep.room.storage.store.energy > 10000) {
        lca( creep, 'is getting energy from storage.');
        creep.moveTo(creep.room.storage);
        creep.room.storage.transferEnergy(creep,creep.carryCapacity - creep.carry.energy);
      } else if(usefulExtensions.length > 0) {
        for(var id in usefulExtensions){
          var extension = usefulExtensions[id];

          if(extension.energy == extension.energyCapacity){
            lca(creep, 'is getting energy from an extension.');
            creep.moveTo(extension);
            extension.transferEnergy(creep);
            break;
          }
        }
      } else {
        lca( creep, 'is getting energy from spawn.');
        creep.moveTo(Game.spawns.Spawn1);
        Game.spawns.Spawn1.transferEnergy(creep);
      }
    }
    else {
        if(creep.carry.energy == 0) {
          lca( creep, 'is traveling to spawn for energy.');
          creep.moveTo(Game.spawns.Spawn1);
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
                  lca(creep, 'there are construction sites');
                  if(creep.memory.state == 'repairing' && creep.carry.energy != creep.carryCapacity){
                    lca(creep,'but I am in repairing mode, and am going to stay that way until I run out of energy.');
                    fixPrioritizedStructure(creep);
                  } else {
                    creep.memory.state = 'constructing';
                    lca(creep, 'found a construction site.');
                    creep.moveTo(targets[0]);
                    creep.build(targets[0]);
                    creep.memory.currentTarget = null; // this causes them to forget what they were working on before
                  }

                } else {
                  lca(creep, 'needs a construction site.');
                }
            }
        }
    }
}
