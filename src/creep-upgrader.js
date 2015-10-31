var UPGRADER = {
  1: [MOVE, WORK, CARRY, CARRY],
  2: [MOVE, MOVE, WORK, CARRY, CARRY],
  3: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK],
  4: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK],
  5: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK],
  6: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK]
}

var RECRUIT_TIME = 90;

function processUpgraders(creeps){
  var index = 0;

    if(creeps.length > 0){
      log('------------------- ' + creeps.length,'Upgraders');

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
        upgrade(creep, source);
      }
    }
}

function upgrade(creep, source) {
  var spawn = creep.room.find(FIND_MY_SPAWNS)[0];

  if(creep.spawning){
    lca(creep, 'is still spawning.');
    return OK;
  }

  if(creep.ticksToLive == RECRUIT_TIME){
    console.log('recruit time.');
    if(creep.room.controller && creep.room.controller.level < 5){
      console.log('my room is insufficient');
      // request upgrader from another room
      lca(creep, 'it is time to request a replacement.');
      _.forEach(Game.rooms, function (room) {
                  console.log('considering ' + room.name)
                  if(room.name != creep.room.name){
                    console.log('considering ' + room.name + ' and it is not my room and the controller is ' + room.controller.level);
                    if(room.controller && room.controller.level >= 5){
                      console.log(room.name + ' is sufficient');
                      lca(creep, room.name + ' is of acceptable level to request a replacement from.');
                      var candidateCreeps = [];
                      _.forEach(Game.creeps, function (creep){
                                  if(creep.memory.role == 'upgrader' && creep.room.name == room.name){
                                    candidateCreeps.push(creep);

                                  }
                                });
                      lca(creep, 'considering ' + candidateCreeps.length + ' as options.');
                      console.log('there are ' + candidateCreeps.length + ' as options');
                      if(candidateCreeps.length > 0){
                        console.log('popping the youngest');
                        var youngestCreep = candidateCreeps.pop();
                        if(youngestCreep){
                          console.log('youngest on is ' + youngestCreep.name);
                          lca(creep, youngestCreep.name + 'is being asked to join my room.');
                          youngestCreep.memory.previousRole = youngestCreep.memory.role;
                          youngestCreep.memory.role = 'explorer';
                          youngestCreep.memory.mode = 'room';
                          youngestCreep.memory.roomDestination = creep.room.name;
                          return OK;
                        }
                      } else {
                        lca(creep,'no candidates available for me in room ' + room.name);
                      }
                    }
                  }
                });
    }
  }

  switch(creep.memory.state){
  case 'fill':
    if(creep.carry.energy == creep.carryCapacity) {
      creep.memory.state = 'upgrade';
    } else {
      if(creep.room.storage){
        lca(creep, 'is moving to storage to get energy.');
        creep.moveTo(creep.room.storage);
        pickupEnergy(creep);
        creep.room.storage.transferEnergy(creep);
      } else if(spawn) {
        lca(creep, 'is getting energy from spawn.');
        creep.moveTo(spawn);
        spawn.transferEnergy(creep);
      } else {
        lca(creep, 'is gathering energy from a source.');
        creep.moveTo(source);
        creep.harvest(source);
        pickupEnergy(creep);
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
             UPGRADER, 'upgrader', 'upgraderCounter');
}