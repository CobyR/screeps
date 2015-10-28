var TRANSPORTER = {
  4: [MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY,
      MOVE, CARRY, CARRY],
  5: [
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

function processTransporters(transporters){
  var TRANSPORT_REMOTE = false;

  if(transporters.length > 0){
    log('[Transporters] ------------','creep');

    var i = 0;
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
  var results = OK;
  var spawnLevel = room.controller.level;

  if(spawnLevel >= 4  && current < max){
    results = spawn.canCreateCreep(TRANSPORTER[spawnLevel],
                                   'T' + spawnLevel +
                                   '_' + room.memory.transporterCounter,
                                   { role: 'transporter', state: 'cleanup'});
    if(results == ERR_NAME_EXISTS){
      log('Incrementing transporterCounter for ' + room.name + ' from ' + room.memory.transporterCounter + ' by 1 in check.', 'spawn');
      room.memory.transporterCounter ++;
    }

    if(results != ERR_NOT_ENOUGH_ENERGY){
      results = spawn.createCreep(TRANSPORTER[spawnLevel],
                                   'T_' + room.memory.transporterCounter,
                                   { role: 'transporter', state: 'cleanup'});
      if(results != OK){
        log('Spawning a new transporter, but spawn said ' + displayErr(results), 'spawn');
      }
    }
  }
}

function transport(creep){
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
      if(creep.carry.energy > 0){
        lca(creep, 'dropping off the energy I have ' + creep.carry.energy + '.');
        creep.memory.state = 'transferring';
      } else {
        lca(creep, 'no drops, no energy, waiting.');
      }
    } else{
      if(creep.carry.energy == creep.carryCapacity) {
        creep.memory.state = 'transferring';
      } else {
        lca(creep, 'moving to ' + closestDrop.pos.x + ',' + closestDrop.pos.y + ' to pickup ' + closestDrop.energy + ' energy.');
        creep.moveTo(closestDrop);
        creep.pickup(closestDrop);
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

      if(creep.carry.energy === 0){
        creep.memory.state = 'cleanup';
      }
    }
    break;
  default:
    lca(creep, 'my state ' + creep.memory.state + ' has no functionality...');
  }
}