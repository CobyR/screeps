var HARVESTER = {
  1: [MOVE, WORK, CARRY, CARRY],
  2: [MOVE, MOVE, WORK, CARRY, CARRY],
  3: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK],
  4: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK],
  5: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK],
  6: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK]
}

function processHarvesters(creeps){
  var index = 0;

  if(creeps.length > 0){
    log('-------------------' + creeps.length ,'Boot Straper');

    var sources = null;
    var source = null;

    for(var id in creeps) {
      var creep = Game.getObjectById(creeps[id]);
      index ++;

      // lca(creep, creep.room.name + ' vs ' + p_room.name, true );
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
      harvest(creep, source);
    }
  }
}

function harvest(creep, source) {
  var busy = 0;
  var STORAGE_LIMIT = 200000;

  switch(creep.memory.state){
  case 'gathering':
    if(creep.carry.energy == creep.carryCapacity){
      creep.memory.state = 'transferring';
    } else {
      lca(creep, 'is gathering energy: ' + creep.carry.energy + ' of ' + creep.carryCapacity + ' from Source at ' + source.pos.x + ',' + source.pos.y + ' ' + source.pos.roomName + '.');
      creep.moveTo(source);
      creep.harvest(source);
    }
    break;
  case 'transferring':
    var target = findNearestEnergyNeed(creep);

    creep.moveTo(target);
    creep.transferEnergy(target);

    if(creep.carry.energy === 0){
      creep.memory.state = 'gathering';
    }
    break;
  default:
    if(creep.carry.energy > 0){
      creep.memory.state = 'transferring';
    } else {
      creep.memory.state = 'gathering';
    }
  }
}

function spawnHarvester(spawn, room, current, max){
  spawnCreep(spawn, room, current, max,
             HARVESTER, 'harvester');
}