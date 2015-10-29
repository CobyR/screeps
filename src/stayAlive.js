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

  var workers = 0;
  var harvesters = 0;
  var upgraders = 0;
  var guards = 0;
  var builders = 0;
  var warriors = 0;
  var healers = 0;
  var explorers = 0;
  var hoarders = 0;
  var sweepers = 0;
  var transporters = 0;
  var unknowns = 0;

  var MAX_WORKERS =      getMaxCreeps(room, COLOR_YELLOW, 'w');
  var MAX_GUARDS =       getMaxCreeps(room, COLOR_RED,    'g');
  var MAX_WARRIORS =     getMaxCreeps(room, COLOR_RED,    'w');
  var MAX_BUILDERS =     getMaxCreeps(room, COLOR_BROWN,  'b');
  var MAX_HEALERS =      getMaxCreeps(room, COLOR_BLUE,   'h');
  var MAX_EXPLORERS =    getMaxCreeps(room, COLOR_ORANGE, 'e');
  var MAX_SWEEPERS =     getMaxCreeps(room, COLOR_GREEN,  's');

  var MAX_HOARDERS =     getMaxCreeps(room, COLOR_PURPLE, 'h');
  var MAX_TRANSPORTERS = getMaxCreeps(room, COLOR_PURPLE, 't');

  var results = OK;

  if(typeof room.memory.workerCounter === 'undefined') {
    room.memory.workerCounter = 0;
    room.memory.builderCounter = 0;
    room.memory.guardCounter = 0;
    room.memory.warriorCounter = 0;
    room.memory.healerCounter = 0;
    room.memory.explorerCounter = 0;
    room.memory.hoarderCounter = 0;
    room.memory.sweeperCounter = 0;
    room.memory.transporterCounter = 0;
  }

  // count creeps
  var totalCreeps = 0;

  for(var name in Game.creeps) {
    var creep = Game.creeps[name];
    if(creep.spawning){
      log(creep.name +  ' is still spawning.','spawn');
      continue;
    }
    //log('name ' + creep.name + ' creep.name.charAt 0 is ' + creep.name.charAt(0) + '.')
    switch(creep.name.charAt(0)){
    case 'B':
      creep.memory.role = 'builder';
      break;
    case 'G':
      if(creep.memory.role != 'guard'){
        lca(creep,'WTF? my role was ' + creep.memory.role + '.');
        creep.memory.role = 'guard';
      }
      break;
    case 'W':
      if(creep.memory.role != 'harvester' && creep.memory.role != 'upgrade'){
        lca(creep, 'WTF? my role was ' + creep.memory.role + '.');
        creep.memory.role = 'upgrade';
      }
      break;
    case 'S':
      creep.memory.role = 'sweeper';
      break;
    case 'H':
      creep.memory.role = 'hoarder';
      break;
    case 'T':
      creep.memory.role = 'transporter';
      break;
    default:
      log('WTF - fix ' + creep.memory.role + ' for ' + creep.name + '.');
    }

    switch(creep.name){
    case 'W2_83':
      creep.memory.role = 'transporter';
      break;
    }

    if(creep.room.name == room.name){
      totalCreeps ++;
      switch(creep.memory.role){
      case 'harvester':
        harvesters ++;
        workers ++;
        break;
      case 'upgrade':
        upgraders ++;
        workers ++;
        break;
      case 'guard':
        guards ++;
        break;
      case 'builder':
        builders ++;
        break;
      case 'explorer':
        explorers ++;
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
      default:
        unknowns ++;
        break;
      }
    }
  }

  // report stats
  console.log('CREEPS ' + room.name + ': ' +
              workers + ' of ' + MAX_WORKERS +  ' workers h:' + harvesters + '/ u:' + upgraders + ', ' +
              guards + ' of ' + MAX_GUARDS + ' guards, ' +
              builders + ' of ' + MAX_BUILDERS + ' builders, ' +
              explorers + ' of ' + MAX_EXPLORERS + ' explorers, ' +
              hoarders + ' of ' + MAX_HOARDERS + ' hoarders, ' +
              sweepers + ' of ' + MAX_SWEEPERS + ' sweepers, ' +
              transporters + ' of ' + MAX_TRANSPORTERS + ' transporters, and ' +
              unknowns + ' unknown creeps.');

  // spawn guards
  if(guards < MAX_GUARDS){
    spawnGuard(spawn, room, guards, MAX_GUARDS);
  }


  // spawn workers
  if(guards >= MAX_GUARDS || workers < 5) {
    spawnWorker(spawn, room, workers, MAX_WORKERS);
  }

  // spawn hoarders and transporters
  if(workers >= MAX_WORKERS) {
    spawnHoarder(spawn, room, hoarders, MAX_HOARDERS);
    spawnTransporter(spawn, room, transporters, MAX_TRANSPORTERS);
  }

  // spawn builders
  spawnBuilder(spawn, room, builders, MAX_BUILDERS);

  // spawn sweepers
  spawnSweeper(spawn, room, sweepers, MAX_SWEEPERS);

  // spawn explorers
  if(workers >= MAX_WORKERS && guards >= MAX_GUARDS && builders >= MAX_BUILDERS) {
    spawnExplorer(spawn, room, explorers, MAX_EXPLORERS);
  }
}

function getMaxCreeps(room, color, character){
  var maxCreeps = 0;
  var flags = null;

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
                                '_' + room.memory.workerCounter,
                                { role: 'upgrade', locked: false});
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