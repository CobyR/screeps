function callForReplacement(creep){
var RECRUIT_TIME = 75;

  if(creep.ticksToLive == RECRUIT_TIME){
    console.log('recruit time.');
    if(creep.room.controller && creep.room.controller.level < 5){
      console.log('my room is insufficient');
      // request upgrader from another room
      lca(creep, 'it is time to request a replacement.');
      _.forEach(Game.rooms, function (room) {
                  console.log('considering ' + room.name);
                  if(room.name != creep.room.name){
                    console.log('considering ' + room.name + ' and it is not my room and the controller is ' + room.controller.level);
                    if(room.controller && room.controller.level >= 5){
                      console.log(room.name + ' is sufficient');
                      lca(creep, room.name + ' is of acceptable level to request a replacement from.');
                      var candidateCreeps = [];
                      _.forEach(Game.creeps, function (candidate){
                                  if(candidate.memory.role == creep.memory.role && candidate.room.name == room.name){
                                    candidateCreeps.push(candidate);

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

}