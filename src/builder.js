function buildThings(creep, builder_index) {
  var t = null;

    if(creep.spawning === true) {
      lca(creep, 'is still spawning.');
      return ERR_BUSY;
    }

    var usefulExtensions = getExtensionsWithEnergy(creep);
    var extension = null;
  var spawn = creep.room.find(FIND_MY_STRUCTURES,{filter: {structureType: STRUCTURE_SPAWN}})[0];

  if(typeof spawn === 'undefined'){
    lca(creep, 'no spawn available in this room.');
    return OK;
  }

    if(creep.carry.energy === 0 || (creep.memory.state == 'filling' && creep.carry.energy != creep.carryCapacity)) {
      creep.memory.state = 'filling';
      if(creep.room.storage){
        t = creep.room.storage;
      } else {
        t = findNearestEnergy(creep);
      }
      if(t){
        lca(creep, 'is getting energy from '+ t.structureType + ' at ' + t.pos.x + ',' + t.pos.y +'.');
        creep.moveTo(t);
        t.transferEnergy(creep);
      } else if(ALLOW_SPAWN_USE === true || creep.room.controller.level < 4) {
        lca( creep, 'is getting energy from spawn.');
        creep.moveTo(spawn);
        spawn.transferEnergy(creep);
      } else {
        lca(creep, 'waiting for energy in extensions or storage.');
      }
    }
    else {
        if(creep.carry.energy === 0) {
          lca( creep, 'is traveling to spawn for energy.');
          creep.moveTo(spawn);
        }
        else {
            var targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
            if(targets.length === 0) {
              // lca(creep, 'calling fixPrioritizedStructure', true);
              creep.memory.state = 'repairing';
              fixPrioritizedStructure(creep);
            }
            else {
                // console.log('[DEBUG] Construction sites: ' + targets.length);
                if(targets.length > 0) {
                  // If creep is repairing and is mid energy and target ratio is under 65% then keep repairing
                  if(creep.memory.state == 'repairing' && creep.carry.energy != creep.carryCapacity && calcRatio(creep.memory.currentTarget) <= 0.65){
                    lca(creep,'but I am in repairing mode, and am going to stay that way until I run out of energy ' + pct(calcRatio(creep.memory.currentTarget)) + '.');
                    fixPrioritizedStructure(creep);
                  } else {
                    t =  findNearestConstructionSite(creep);
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
