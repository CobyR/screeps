var RUNNER = {
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

function processRunners(creeps){

  if(creeps.length > 0){
    log('------------ ' + creeps.length ,'Runners');

    var i = 0;

    _.forEach(creeps, function (creep){
      if(creep.spawning === true){
        lca(creep, 'is still spawning.');
        return OK;
      } else {
        i++;
        run(creep);
      }
    });
  }
}

function spawnRunner(spawn, room, current, max){
  spawnCreep(spawn, room, current, max,
             RUNNER, 'runner');
}

function run(creep){
  var results = OK;

  // Does the runner have an assignment?
  switch(creep.memory.state){
  case 'getEnergy':
    runnerGetEnergy(creep);
    break;
  case 'putEnergy':
    runnerPutEnergy(creep);
    break;
  default:
    lca(creep, 'my state ' + creep.memory.state + ' has no functionality...');
    creep.memory.state = 'roomTransfer';
  }
}