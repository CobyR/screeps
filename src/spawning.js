/*
 * Stayalive - code to keep breeding creeps
 */
function spawnCreeps(){
  _.forEach(Game.rooms, function(room){
    initializeRoom(room);
    processRoom(room);
  });
}

function processRoom(room){
  _.forEach(Game.spawns, function (spawn){
    if(spawn.pos.roomName == room.name){
      stayAlive(spawn,room);
    }
  });
}

function stayAlive(spawn, room) {

  var harvesters = 0;
  var upgraders = 0;
  var guards = 0;
  var builders = 0;
  var warriors = 0;
  var medics = 0;
  var explorers = 0;
  var hoarders = 0;
  var sweepers = 0;
  var transporters = 0;
  var unknowns = 0;
  var runners = 0;

  var maximums = {
    harvesters:   room.memory.max.harvesters,
    hoarders:     room.memory.max.hoarders,
    sweepers:     room.memory.max.sweepers,
    transporters: room.memory.max.transporters,
    upgraders:    room.memory.max.upgraders,

    guards:       room.memory.max.guards,
    warriors:     room.memory.max.warriors,
    medics:       room.memory.max.medics,

    builders:     room.memory.max.builders,
    explorers:    room.memory.max.explorers,
    runners:      room.memory.max.runners
  };

  var results = OK;

  maximums =  overrideMaximums(room, maximums);

  // count creeps
  var totalCreeps = 0;

  for(var name in Game.creeps) {
    var creep = Game.creeps[name];
    if(creep.spawning){
      log(creep.name +  ' is still spawning.','spawn');
      continue;
    }

    if(creep.room.name == room.name){
      totalCreeps ++;
      switch(creep.memory.role){
      case 'harvester':
        harvesters ++;
        break;
      case 'hoarder':
        hoarders ++;
        break;
      case 'sweeper':
        sweepers ++;
        break;
      case 'transporter':
        transporters ++;
        break;
      case 'upgrader':
        upgraders ++;
        break;
      case 'guard':
        guards ++;
        break;
      case 'warrior':
        warriors ++;
        break;
      case 'medic':
        medics ++;
        break;
      case 'builder':
        builders ++;
        break;
      case 'explorer':
        explorers ++;
        break;
      case 'runner':
        runners ++;
        break;
      default:
        unknowns ++;
        break;
      }
    }
  }

  // report stats

  creepCountReport(room, guards, warriors, medics,
                   harvesters, hoarders, sweepers, transporters,
                   upgraders, builders, explorers, runners, unknowns, maximums);

  switch(true){
  case (room.controller.level == 1 && harvesters < maximums.harvesters):
    spawnHarvester(spawn, room, harvesters, maximums.harvesters);
    break;
  case (hoarders < maximums.hoarders):
    spawnHoarder(spawn, room, hoarders, maximums.hoarders);
    break;
  case (sweepers < maximums.sweepers):
    spawnSweeper(spawn, room, sweepers, maximums.sweepers);
    break;
  case(transporters < maximums.transporters):
    spawnTransporter(spawn, room, transporters, maximums.transporters);
    break;
  case (builders < maximums.builders):
    spawnBuilder(spawn, room, builders, maximums.builders);
    break;
  case (upgraders < maximums.upgraders):
    spawnUpgrader(spawn, room, upgraders, maximums.upgraders);
    break;
  case (guards < maximums.guards):
    spawnGuard(spawn, room, guards, maximums.guards);
    break;
  case(warriors < maximums.warriors):
    spawnWarrior(spawn, room, warriors, maximums.warriors);
    break;
  case(medics < maximums.medics):
    spawnMedic(spawn, room, medics, maximums.medics);
    break;
  case(explorers < maximums.explorers):
    spawnExplorer(spawn, room, explorers, maximums.explorers);
    break;
  case(runners < maximums.runners):
    if(Game.time % 100 === 0){
      spawnRunner(spawn, room, runners, maximums.runners);
      break;
    }
  default:
    log('No spawning happening this tick.', room.name);
  }
}

function spawnCreep(spawn, room, current, max,
                    BODY_PARTS, classification){

  var results = OK;
  var spawnLevel = room.controller.level;

  if(!spawn){
    log('Trying to spawn a ' + classification + ' in ' + room.name + ' and there is no spawn.','spawn');
    return ERR_INVALID_TARGET;
  } else {
    if(spawn.spawning){
      log('spawner is busy was called by ' + classification + ' with ' + current + ' of ' + max + '.', room.name);
      return ERR_BUSY;
    }

    for(var l = spawnLevel; l >= 1; l--){
    results = spawn.canCreateCreep(BODY_PARTS[l],
                                classification.charAt(0).toUpperCase() + l +
                                '_' + room.memory.counter[classification],
                                { role: classification});
      if(results == OK){
        spawnLevel = l;
        break;
      }
      if(results == ERR_NAME_EXISTS){
        log('Incrementing counter.' + classification + ' for ' + room.name + ' from ' + room.memory.counter[classification] + ' by 1 in check.', 'spawn');
        room.memory.counter[classification] ++;
        spawnLevel = l;
        break;
      }
      if(results == ERR_NOT_ENOUGH_ENERGY){
        spawnLevel = l;
      }
    }

    if(current < max) {
      log('Attempting to spawn a level ' + spawnLevel + ' ' + classification + '.');
      results = spawn.createCreep(BODY_PARTS[spawnLevel],
                  classification.charAt(0).toUpperCase() + spawnLevel +
                  '_' + room.memory.counter[classification],
                  { role: classification });

      if(results == OK){
        room.memory.counter[classification] ++;
      } else if(results == ERR_NAME_EXISTS){
        log('Incrementing counter.' + classification + ' for ' + room.name + ' from ' + room.memory.counter[classification] + ' by 1 in create.','spawn');
        room.memory.counter[classification] ++;
      } else {
        log('Spawning ' + classification + ' returned: ' + displayErr(results), 'spawn');
      }
    }
  }
}