function buildThings(creep, builder_index) {
  var USE_STORAGE_THRESHOLD = 10000;

    if(creep.spawning === true) {
      lca(creep, 'is still spawning.');
      return 0;
    }

  var extensions = creep.room.find(FIND_MY_STRUCTURES, {filter: {
                                                          structureType: STRUCTURE_EXTENSION
                                                            } });
  var usefulExtensions = [];
  var extension = null;

  for(var id in extensions){
    extension = extensions[id];
    if(extension.energy == extension.energyCapacity){
      usefulExtensions.push(extension);
    }
  }

    if(creep.carry.energy === 0 || (creep.memory.state == 'filling' && creep.carry.energy != creep.carryCapacity)) {
      creep.memory.state = 'filling';
      if(typeof creep.room.storage !== 'undefined' && creep.room.storage.store.energy >= USE_STORAGE_THRESHOLD) {
        lca( creep, 'is getting energy from storage.');
        creep.moveTo(creep.room.storage);
        creep.room.storage.transferEnergy(creep,creep.carryCapacity - creep.carry.energy);
      } else if(usefulExtensions.length > 0) {
        for(id in usefulExtensions){
          extension = usefulExtensions[id];

          if(extension.energy == extension.energyCapacity){
            lca(creep, 'is getting energy from an extension.');
            creep.moveTo(extension);
            extension.transferEnergy(creep);
            break;
          }
        }
      } else if(ALLOW_SPAWN_USE === true) {
        lca( creep, 'is getting energy from spawn.');
        creep.moveTo(Game.spawns.Spawn1);
        Game.spawns.Spawn1.transferEnergy(creep);
      } else {
        lca(creep, 'waiting for energy in extensions or storage.');
      }
    }
    else {
        if(creep.carry.energy === 0) {
          lca( creep, 'is traveling to spawn for energy.');
          creep.moveTo(Game.spawns.Spawn1);
        }
        else {
            var targets = p_room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length === 0) {
              // lca(creep, 'calling fixPrioritizedStructure', true);
              creep.memory.state = 'repairing';
              fixPrioritizedStructure(creep);
            }
            else {
                // console.log('[DEBUG] Construction sites: ' + targets.length);
                if(targets.length > 0) {
                  if(creep.memory.state == 'repairing' && creep.carry.energy != creep.carryCapacity){
                    lca(creep,'but I am in repairing mode, and am going to stay that way until I run out of energy.');
                    fixPrioritizedStructure(creep);
                  } else {
                    var t = targets[builder_index];
                    creep.memory.state = 'constructing';
                    if(t){
                      lca(creep, 'found a ' + t.structureType + ' to construct at ' + t.pos.x + ',' + t.pos.y + '.');
                      creep.moveTo(t);
                      pickupEnergy(creep);
                      creep.build(t);
                      creep.memory.currentTarget = null; // this causes them to forget what they were working on before
                    } else {
                      // This gets hit when there are more builders than construction sites to work on.
                      creep.memory.state = 'repairing';
                      fixPrioritizedStructure(creep);
                    }
                  }

                } else {
                  lca(creep, 'needs a construction site.');
                }
            }
        }
    }
}
