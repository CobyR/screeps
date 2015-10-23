/*
 * Stayalive - code to keep breeding creeps
 */
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
  var unknowns = 0;

  var MAX_WORKERS =   getMaxCreeps(room, COLOR_YELLOW, 'w');
  var MAX_GUARDS =    getMaxCreeps(room, COLOR_RED,    'g');
  var MAX_WARRIORS =  getMaxCreeps(room, COLOR_RED,    'w');
  var MAX_BUILDERS =  getMaxCreeps(room, COLOR_BROWN,  'b');
  var MAX_HEALERS =   getMaxCreeps(room, COLOR_BLUE,   'h');
  var MAX_EXPLORERS = getMaxCreeps(room, COLOR_ORANGE, 'e');
  var MAX_HOARDERS =  getMaxCreeps(room, COLOR_PURPLE, 'h');
  var MAX_SWEEPERS =  getMaxCreeps(room, COLOR_GREEN,  's');

  var explorerDestination = 'W18S29';
  var results = OK;

  if(typeof room.memory.worker_counter === 'undefined') {
    room.memory.worker_counter = 0;
    room.memory.builder_counter = 0;
    room.memory.guard_counter = 0;
    room.memory.warrior_counter = 0;
    room.memory.healer_counter = 0;
    room.memory.explorer_counter = 0;
    room.memory.hoarder_counter = 0;
    room.memory.sweeper_counter = 0;
  }

  // count creeps
  for(var name in Game.creeps) {
    var creep = Game.creeps[name];
    if(creep.room.name == room.name){
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
      default:
        unknowns ++;
        break;
      }
    }
  }

  // Tweak MAX Numbers based on circumstance
  if(workers < 4 ) {
    MAX_WORKERS = 4;
    MAX_BUILDERS = 0;
  } else if (workers == 4 ) {
    MAX_WORKERS = 6;
    MAX_BUILDERS = 1;
  }

  if (workers >=8 && guards >= 4 && builders >= 2) {
    MAX_EXPLORERS=room.find(FIND_FLAGS, { filter: {color: COLOR_ORANGE}}).length;
  }

  if(typeof room.storage !== 'undefined'){
    var storedEnergy = room.storage.store.energy;

    if(MAX_SWEEPERS === 0){
      switch(true) {
      case ( storedEnergy < 250000):
        MAX_SWEEPERS = 0;
        break;
      case( storedEnergy < 500000):
        MAX_SWEEPERS = 1;
        break;
      case (storedEnergy < 750000):
        MAX_SWEEPERS = 2;
        break;
      case( storedEnergy < 1000000):
        MAX_SWEEPERS = 3;
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
              sweepers + ' of ' + MAX_SWEEPERS + ' sweepers, and ' +
              unknowns + ' unknown creeps.');

  // spawn guards
  if(guards < MAX_GUARDS && workers >= MAX_WORKERS / 2 ) {
    if(room.energyAvailable >= 270){
      results = OK;
      // spawn standard guard

      console.log('Spawning a new tough guard.');
      results = spawn.createCreep([TOUGH,MOVE,
                                                TOUGH,MOVE,
                                                ATTACK,MOVE,
                                                ATTACK,MOVE,
                                                ATTACK,MOVE,
                                                ATTACK,MOVE,
                                                ATTACK,MOVE], 'G' + room.memory.guard_counter, { role: 'guard'});
      if(results != OK ){
        console.log('Spawning a new guard, tough guard said ' + displayErr(results) + '.');
        results = spawn.createCreep([TOUGH,ATTACK,ATTACK,MOVE,MOVE], 'g' + room.memory.guard_counter, { role: 'guard'});
      }

      if(results == OK || results == ERR_NAME_EXISTS) {
        room.memory.guard_counter +=1;
      }
    } else {
      console.log('I wanted to spawn a guard - energy levels at ' + room.energyAvailable + ' of required 270.');
    }
  }


  // spawn workers
  if(guards >= MAX_GUARDS || workers < 5) {
    spawnWorker(spawn, room, workers, MAX_WORKERS);
  }

  // spawn hoarders
  if( hoarders < MAX_HOARDERS && workers >= MAX_WORKERS  && room.controller.level >= 4) {
    if(room.energyAvailable >= 550) {
      results = spawn.createCreep( [MOVE,MOVE,
                                                 CARRY,CARRY,
                                                 CARRY,CARRY,
                                                 CARRY,WORK,
                                                 WORK,WORK,
                                                 WORK], 'H' + room.memory.hoarder_counter, { role: 'hoarder', locked: true});
      console.log('Spawning a new hoarder - ' + displayErr(results) +'.');
      if(results == OK || results == ERR_NAME_EXISTS) {
        room.memory.hoarder_counter +=1;
      }
    } else {
      console.log('I wanted to spawn a hoarder - energy levels at ' + spawn.energy + ' of required 550.');
    }
  }


  // spawn builders
  if(builders < MAX_BUILDERS && workers >= MAX_WORKERS && guards >= MAX_GUARDS) {
    if(room.energyAvailable >= 300){
      results = OK;
      console.log('Spawning a new mega builder.');
      results = spawn.createCreep([WORK, WORK,
                                                CARRY, CARRY,
                                                CARRY, CARRY,
                                                CARRY, CARRY,
                                                MOVE, MOVE,
                                                MOVE, MOVE,
                                                MOVE, MOVE], 'B' + room.memory.builder_counter, { role: 'builder', state: 'constructing'});
      if(results == ERR_NOT_ENOUGH_ENERGY) {
        log('Spawning a new builder, mega builder said: ' + displayErr(results), 'spawn');
          results = spawn.createCreep([WORK,CARRY,CARRY,MOVE,MOVE], 'b' + room.memory.builder_counter, {role: 'builder', state: 'constructing'});
      }
      if(results == OK || results == ERR_NAME_EXISTS) {
        room.memory.builder_counter += 1;
      }
    } else {
      console.log('I wanted to spawn a builder - energy levels at ' + room.energyAvailable + ' of required 300.');
    }
  }

  // spawn sweepers
  spawnSweepers(spawn, room, sweepers, MAX_SWEEPERS);

  // spawn explorers
  if(typeof spawn.memory.explorersEnabled === 'undefined' || spawn.memory.explorersEnabled === false ) {
    // not launching any explorers
  } else {
    if(explorers < MAX_EXPLORERS  && workers >= MAX_WORKERS && guards >= MAX_GUARDS && builders >= MAX_BUILDERS) {
      if(room.energyAvailable >= 550) {
        var explorerName = 'E' + room.memory.explorer_counter;
        console.log('Spawning a new explorer - ' + explorerName + '.');

        results = spawn.createCreep([TOUGH,MOVE,
                                                  TOUGH,MOVE,
                                                  MOVE,CARRY,
                                                  MOVE,WORK,
                                                  MOVE,CARRY,
                                                  MOVE,WORK,
                                                  MOVE,CARRY,
                                                  MOVE,WORK,
                                                  MOVE,CARRY,
                                                  MOVE,WORK],
                explorerName, { role: 'explorer', mode: 'room', roomDestination: explorerDestination});
        if(results == OK || results == ERR_NAME_EXISTS) {
          room.memory.explorer_counter += 1;
        } else {
          console.log('trying to create an explorer resulted in ' + displayErr(results));
        }
      } else {
        console.log('I wanted to spawn an explorer - energy levels at ' + spawn.energy + ' of required 550');
      }
    }
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