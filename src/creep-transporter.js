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
      MOVE, CARRY],
  6: [MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY
     ]
}

function processTransporters(transporters, hoarders, room){

  if(transporters.length > 0){
    log('------------ ' + transporters.length ,'Transporters', room.name);

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
             TRANSPORTER, 'transporter');
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
    modeCleanup(creep);
    break;
  case 'transferring':
    modeTransferring(creep);
    break;
  case 'roomTransfer':
    modeRoomTransfer(creep);
    break;
  default:
    lca(creep, 'my state ' + creep.memory.state + ' has no functionality...');
    creep.memory.state = 'cleanup';
  }

  if(creep.carry.energy === 0){
    creep.memory.state = 'cleanup';
  }
}