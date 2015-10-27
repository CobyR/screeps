function sweep(creep, room){
  if(typeof creep.memory.state === 'undefined'){
    creep.memory.state = creep.memory.mode;
  }

  switch(creep.memory.state){
  case 'cleanup':
    var drops = creep.room.find(FIND_DROPPED_ENERGY);

    var closestDrop = null;
    var distance = 0;
    var shortestDistance = 50;

    for(var index in drops){
      var drop = drops[index];

      distance = creep.pos.getRangeTo(drop);

      if(distance < shortestDistance) {
        shortestDistance = distance;
        closestDrop = drop;
      }
    }

    if(closestDrop === null){
      lca(creep, 'no drops switching to fillGet.');
      creep.memory.state = 'fillGet';
    } else{
      if(creep.carry.energy == creep.carryCapacity) {
        creep.memory.state = 'fillGet';
      } else {
        lca(creep, 'moving to ' + closestDrop.pos.x + ',' + closestDrop.pos.y + ' to pickup ' + closestDrop.energy + ' energy.');
        creep.moveTo(closestDrop);
        creep.pickup(closestDrop);
      }
    }
    break;
  case 'fillGet':
    if(creep.carry.energy < creep.carryCapacity){
      lca(creep, 'moving to Storage to get energy, currently at: ' + creep.carry.energy + '.');
      creep.moveTo(room.storage);
      room.storage.transferEnergy(creep);
    } else {
      // figure out which extension to move to
      creep.memory.state = 'fillPut';
      sweep(creep, room);
    }
    break;
  case 'fillPut':
    fillPut(creep, room);
    break;
  default:
    creep.memory.state = 'cleanup';
  }

}

function processSweepers(sweepers, room){
  if(sweepers.length > 0) {
    log('[Sweepers] -----------------','creep');

    for(var id in sweepers) {
      var creep = Game.getObjectById(sweepers[id]);
      sweep(creep, room);
    }
  }

}

function spawnSweepers(spawn, room, sweepers, MAX) {
  if(sweepers < MAX) {
    var results = spawn.createCreep([MOVE, CARRY,
                                     MOVE, CARRY,
                                     MOVE, CARRY,
                                     MOVE, CARRY,
                                     MOVE, CARRY,
                                     MOVE, CARRY,
                                     MOVE, CARRY,
                                     MOVE, CARRY,
                                     MOVE, CARRY,
                                     MOVE, CARRY],
                                    'S' + room.memory.sweeperCounter,
                                    {role: 'sweeper', state: 'cleanup'});
    switch(results){
    case OK:
      room.memory.sweeperCounter ++;
      log('Spawning a new sweeper succeeded.');
      break;
    case ERR_NAME_EXISTS:
      room.memory.sweeperCounter ++;
      break;
    default:
      log('Spawning a new sweeper failed: ' + displayErr(results) + '.');
    }
  }
}

function fillPut(creep,room){
  var results =  fillStructure(creep,room, STRUCTURE_SPAWN);

  if(results != OK  && results != ERR_NOT_ENOUGH_ENERGY) {
    results = fillStructure(creep,room, STRUCTURE_EXTENSION);
  }

  if(results != OK && results != ERR_NOT_ENOUGH_ENERGY){
    results = fillStructure(creep,room, STRUCTURE_LINK);
  }

  if(results != OK) {
    creep.memory.state = 'cleanup';
    lca(creep, 'nothing needs energy (' + displayErr(results) + '), going to cleanup.');
  }
}

function fillStructure(creep, room, structure){
  if(creep.carry.energy > 0){
    var structures = room.find(FIND_MY_STRUCTURES,
    { filter: { structureType: structure}});

    var usefulStructures = [];
    structure = null;

    for(var id in structures){
      structure = structures[id];

      if(structure.energy < structure.energyCapacity){
        usefulStructures.push(structure);
      }
    }

    var distance = 0;
    var closestStructure = null;
    var shortestDistance = 50;

    for(id in usefulStructures){
      structure = usefulStructures[id];

      distance = creep.pos.getRangeTo(structure);

      if(distance < shortestDistance){
        shortestDistance = distance;
        closestStructure = structure;
      }
    }

    if(closestStructure === null){
      return -7; // ERR_INVALID_TARGET;
    } else {
      lca(creep, 'moving to Extension at ' +
          closestStructure.pos.x + ',' +
          closestStructure.pos.y + ' with ' +
          closestStructure.energy + '.');
      creep.moveTo(closestStructure);
      creep.transferEnergy(closestStructure);
      return OK;
      }
  } else {
    return ERR_NOT_ENOUGH_ENERGY;
  }
}