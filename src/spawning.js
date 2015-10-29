/*
 * Stayalive - code to keep breeding creeps
 */
function spawnCreeps(){
  _.forEach(Game.rooms, function(room){
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

  var maximums = {
    harvesters:   getMaxCreeps(room, COLOR_YELLOW, 'h'),
    hoarders:     getMaxCreeps(room, COLOR_PURPLE, 'h'),
    sweepers:     getMaxCreeps(room, COLOR_GREEN,  's'),
    transporters: getMaxCreeps(room, COLOR_PURPLE, 't'),
    upgraders:    getMaxCreeps(room, COLOR_YELLOW, 'u'),

    guards:       getMaxCreeps(room, COLOR_RED,    'g'),
    warriors:     getMaxCreeps(room, COLOR_RED,    'w'),
    medics:       getMaxCreeps(room, COLOR_BLUE,   'm'),

    builders:     getMaxCreeps(room, COLOR_BROWN,  'b'),
    explorers:    getMaxCreeps(room, COLOR_ORANGE, 'e')
  }

  var MAX_HARVESTERS   = getMaxCreeps(room, COLOR_YELLOW, 'h');
  var MAX_HOARDERS     = getMaxCreeps(room, COLOR_PURPLE, 'h');
  var MAX_SWEEPERS     = getMaxCreeps(room, COLOR_GREEN,  's');
  var MAX_TRANSPORTERS = getMaxCreeps(room, COLOR_PURPLE, 't');
  var MAX_UPGRADERS    = getMaxCreeps(room, COLOR_YELLOW, 'u');

  var MAX_GUARDS       = getMaxCreeps(room, COLOR_RED,    'g');
  var MAX_WARRIORS     = getMaxCreeps(room, COLOR_RED,    'w');
  var MAX_MEDICS      = getMaxCreeps(room, COLOR_BLUE,   'h');

  var MAX_BUILDERS     = getMaxCreeps(room, COLOR_BROWN,  'b');
  var MAX_EXPLORERS    = getMaxCreeps(room, COLOR_ORANGE, 'e');

  var results = OK;

  initializeRoom(room);

  log('maximum[harvesters] ' + maximums.harvesters + ' at the top of stayAlive.');
 maximums =  overrideMaximums(room, maximums);
  log('maximum[harvesters] ' + maximums.harvesters + ' after call to overrideMaximums.');
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
      default:
        unknowns ++;
        break;
      }
    }
  }

  // report stats

  creepCountReport(room, guards, warriors, medics,
                   harvesters, hoarders, sweepers, transporters,
                   upgraders, builders, explorers, unknowns, maximums);

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
  default:
    log('No spawning happening this tick.');
  }
}

function getMaxCreeps(room, color, character){
  var maxCreeps = 0;
  var flags = null;

  //log('looking for flags that are ' + color);
  flags = room.find(FIND_FLAGS, { filter: {color: color}});
  for(var i in flags){
    var flag = flags[i];

    if(flag.name.charAt(0) == character){
      maxCreeps ++;
    }
  }
  return maxCreeps;
}

function spawnCreep(spawn, room, current, max,
                    BODY_PARTS, classification, counterName){
  if(spawn.spawning){
    log('spawner is busy was called by ' + classification + ' with ' + current + ' of ' + max + '.');
    return ERR_BUSY;
  }

  var results = OK;
  var spawnLevel = room.controller.level;

  if(!spawn){
    log('Trying to spawn a ' + classification + ' in ' + room.name + ' and there is no spawn.','spawn');
    return ERR_INVALID_TARGET;
  }

  for(var l = spawnLevel; l >= 1; l--){
    results = spawn.canCreateCreep(BODY_PARTS[l],
                                classification.charAt(0).toUpperCase() + l +
                                '_' + room.memory[counterName],
                                { role: classification});
    if(results == OK){
      spawnLevel = l;
      break;
    }
    if(results == ERR_NAME_EXISTS){
      log('Incrementing ' + counterName + ' for ' + room.name + ' from ' + room.memory[counterName] + ' by 1 in check.', 'spawn');
      room.memory[counterName] ++;
    }
    if(results == ERR_NOT_ENOUGH_ENERGY){
      spawnLevel = l;
    }
  }

  if(current < max) {
    log('Attempting to spawn a level ' + spawnLevel + ' ' + classification + '.');
    results = spawn.createCreep(BODY_PARTS[spawnLevel],
                                classification.charAt(0).toUpperCase() + spawnLevel +
                                '_' + room.memory[counterName],
                                { role: classification });
    if(results == OK){
      room.memory[counterName] ++;
    } else if(results == ERR_NAME_EXISTS){
      log('Incrementing ' + counterName + ' for ' + room.name + ' from ' + room.memory[counterName] + ' by 1 in create.','spawn');
      room.memory[counterName] ++;
    } else {
      log('Spawning ' + classification + ' returned: ' + displayErr(results), 'spawn');
    }
  }
}