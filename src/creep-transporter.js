var TRANSPORTER = {
  1: [MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY],
  2: [MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY],
  3: [MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY],
  4: [MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY],
  5: [MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY]
}

function processTransporters(transporters, hoarders){

  if(transporters.length > 0){
    log('------------ ' + transporters.length ,'Transporters');

    var i = 0;

    updateAssignments(transporters, hoarders);

    for(var id in transporters){
      var creep = Game.getObjectById(transporters[id]);

      if(creep.spawning === true){
        lca(creep, 'is still spawning.');

        return 0;
      } else {
        i ++;
        transport(creep);
      }
    }
  }
}

function spawnTransporter(spawn, room, current, max){
  spawnCreep(spawn, room, current, max,
             TRANSPORTER, 'transporter', 'transporterCounter');
}

function transport(creep){
  var results = OK;

  if(creep.spawning){
    lca(creep, 'is still spawning.');
    return OK;
  }

  callForReplacement(creep);

  // Does the transporter have an assignment?
  switch(creep.memory.state){
  case 'cleanup':
    if(creep.carry.energy == creep.carryCapacity) {
      lca(creep, 'my carryCapacity has been reached, transferring...');
      creep.memory.state = 'transferring';
    } else {
      if(creep.memory.follow){
        var follow = Game.getObjectById(creep.memory.follow.id);
        if(follow){
          results = creep.moveTo(follow);
          if(results == ERR_INVALID_TARGET){
            lca(creep, 'was following an INVALID_TARGET, clearning memory.follow');
            creep.memory.follow = null;
          } else {
            lca(creep, 'following ' + follow.name + ' to pickup  energy. '+ displayErr(results));
            var closestDrop = findNearestDroppedEnergy(creep,1);
            pickupEnergy(creep);
          }
        } else {
          lca(creep, 'my follower is missing...');
          creep.memory.follow = null;
        }
      } else {
        lca(creep, 'not following, moving to pickup dropped energy.');
        var drop = findNearestDroppedEnergy(creep);
        creep.moveTo(drop);
        creep.pickup(drop);
      }
    }
    break;
  case 'transferring':
    var storage = creep.room.storage;

    if(storage){
      lca(creep, 'is taking energy(' + creep.carry.energy +
          ') to storage (' + nwc(storage.store.energy) +
          ' of ' + nwc(storage.storeCapacity) + ').');
      creep.moveTo(creep.room.storage);
      creep.transferEnergy(creep.room.storage);

    } else { // No storage exists
      var altTarget = findNearestEnergyNeed(creep);
      if(altTarget){
        // log('altTarget is a ' + altTarget.structureType)

        if(altTarget !== null){
          lca(creep, 'is taking energy to a (' + altTarget.structureType + ' - ' + altTarget.pos.x +',' + altTarget.pos.y + ' it is at ' + altTarget.energy + ' of ' + altTarget.energyCapacity + ').');
          creep.moveTo(altTarget);
          creep.transferEnergy(altTarget);
        } else {
          lca(creep, 'all extensions and spawn are full.');
        }
      } else {
        lca(creep, 'no targets need the energy I carry: ' + creep.carry.energy + '.');
      }
    }
    break;
  default:
    lca(creep, 'my state ' + creep.memory.state + ' has no functionality...');
    creep.memory.state = 'cleanup';
  }

  if(creep.carry.energy === 0){
    creep.memory.state = 'cleanup';
  }
}

function updateAssignments(creeps, hoarders){
  for(var i in creeps){
    var creep = Game.getObjectById(creeps[i]);

    if(!creep.memory.follow){
      // Creep has no assignment, let's figure one out.
      lca(creep, 'getting a new assignment',true);
      updateAssignment(creep, hoarders);
    }
  }
}

function updateAssignment(creep, hoarders){
  if(!creep.memory.follow){
    _.forEach(hoarders, function(hoarder_id) {
                var hoarder = Game.getObjectById(hoarder_id);
                if(creep.pos.roomName == hoarder.pos.roomName){
                  if(!hoarder.memory.transporter ){
                    hoarder.memory.transporter = creep;
                    creep.memory.follow = hoarder;
                    lca(creep, 'assigned to ' + hoarder.name);
                  } else {
                    lca(creep, hoarder.name + ' already has a transporter: ' + hoarder.memory.transporter.name + '.',true);
                    var checkCreep = Game.getObjectById(hoarder.memory.transporter.id);
                    if(checkCreep && checkCreep.id == creep.id){
                      creep.memory.follow = hoarder;
                      lca(creep, 'WTF? ' + hoarder.name + ' thought I was his transporter, so now I am',true);
                    }
                  }
                }
              });
  }
}