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

  var MAX_WORKERS = room.find(FIND_FLAGS, { filter: {color: COLOR_YELLOW}}).length;
  var MAX_GUARDS = room.find(FIND_FLAGS, { filter: {color: COLOR_RED}}).length;
  var MAX_BUILDERS = room.find(FIND_FLAGS, { filter: { color: COLOR_BROWN}}).length;
  var MAX_WARRIORS = 0;
  var MAX_HEALERS = 0;
  var MAX_EXPLORERS = 0;
  var MAX_HOARDERS = room.find(FIND_FLAGS, { filter: {color: COLOR_PURPLE}}).length;

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
      if(creep.memory.role == 'harvester') {
        harvesters +=1;
        workers += 1;
      } else if(creep.memory.role == 'upgrade') {
        upgraders += 1;
        workers += 1 ;
      } else if(creep.memory.role == 'guard') {
        guards += 1;
      } else if(creep.memory.role == 'builder') {
        builders += 1;
      } else if(creep.memory.role == 'explorer') {
        explorers += 1;
      } else if(creep.memory.role == 'hoarder') {
        hoarders += 1;
      }
    }
  }

  // calculate MAX #'s
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

  // report stats
  console.log('CREEPS: ' +
              workers + ' of ' + MAX_WORKERS +  ' workers h:' + harvesters + '/ u:' + upgraders + ', ' +
              guards + ' of ' + MAX_GUARDS + ' guards, ' +
              builders + ' of ' + MAX_BUILDERS + ' builders, ' +
              explorers + ' of ' + MAX_EXPLORERS + ' explorers, and ' +
              hoarders + ' of ' + MAX_HOARDERS + ' hoarders.');

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
  if(workers < MAX_WORKERS && (guards >= MAX_GUARDS || workers < 5)) {
    if(room.energyAvailable >= 250) {
      results = OK;
      console.log('Spawning a new mega worker.');
      results = spawn.createCreep( [MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,WORK,WORK], 'W' + room.memory.worker_counter, { role: 'harvester', locked: false});
      console.log('system says: ' + displayErr(results));
      if(results == ERR_NOT_ENOUGH_ENERGY){
        console.log('Spawning a new worker - mega worker said: ' + displayErr(results) +'.');
        results = spawn.createCreep( [MOVE, CARRY, CARRY,WORK], 'w' + room.memory.worker_counter, { role: 'harvester', locked: false});
      }
      if(results == OK || results == ERR_NAME_EXISTS) {
        room.memory.worker_counter +=1;
      }
    } else {
      console.log('I wanted to spawn a worker - energy levels at ' + spawn.energy + ' of required 250.');
    }
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