var UPGRADER = {
  1: [MOVE, WORK, CARRY, CARRY],
  2: [MOVE, MOVE, WORK, CARRY, CARRY],
  3: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK],
  4: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK],
  5: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK],
  6: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK]
}

function processUpgraders(creeps){
  var index = 0;

    if(creeps.length > 0){
      log('------------------- ' + creeps.length,'Upgraders');

      var sources = null;
      var source = null;

      for(var id in creeps) {
        var creep = Game.getObjectById(creeps[id]);
        index ++;

        sources = creep.room.find(FIND_SOURCES);

        if(sources.length > 1){
          if(index % 2){
            source = sources[0];
          } else {
            source = sources[1];
          }
        } else if(sources.length == 1) {
          source = sources[0];
        } else {
          lca(creep, 'Odd - there are ' + sources.length + ' sources in this room ' + creep.pos.roomName + ', and there is no code in creep-upgrader to deal with this.');
          return OK;
        }
        upgrade(creep, source);
      }
    }
}

function upgrade(creep, source) {

  if(creep.spawning){
    lca(creep, 'is still spawning.');
    return OK;
  }

  callForReplacement(creep);

  switch(creep.memory.state){
  case 'fill':
    if(creep.carry.energy == creep.carryCapacity) {
      creep.memory.state = 'upgrade';
    } else {
      // prefer nearestEnergy
      var nearestEnergy = findNearestEnergy(creep);
      if(nearestEnergy){
        lca(creep, 'is getting energy from a ' + nearestEnergy.structureType + '.');
        creep.moveTo(nearestEnergy);
        if(!nearestEnergy.structureType){
          pickupEnergy(creep);
        } else {
          nearestEnergy.transferEnergy(creep);
        }
      } else {
        // no nearestEnergy figure out what else we can use.
        findEnergy(creep, source);
      }
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
  default:
    creep.memory.state = 'fill';
  }
}

function spawnUpgrader(spawn, room, current, max){
  spawnCreep(spawn, room, current, max,
             UPGRADER, 'upgrader');
}