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
  spawnCreep(spawn, room, current, max,
             TRANSPORTER, 'transporter', 'transporterCounter');
}

function transport(creep){
  var pileFlag = creep.room.find(FIND_FLAGS,
                              {filter: { color: COLOR_PURPLE,
                                         name: 'PILE'}});
  var pile = pileFlag[0];

  switch(creep.memory.state){
  case 'cleanup':
        var drops = creep.room.find(FIND_DROPPED_ENERGY);

    var closestDrop = null;
    var distance = 0;
    var shortestDistance = 50;

    for(var index in drops){
      var drop = drops[index];
      if(pile && drop.pos.x == pile.pos.x && drop.pos.y == pile.pos.y){
        lca(creep, 'skipping the storage PILE, moving on.',true);
        continue;
      }

      distance = creep.pos.getRangeTo(drop);

      if(distance < shortestDistance) {
        shortestDistance = distance;
        closestDrop = drop;
      }
    }

    if(closestDrop === null  || creep.carry.energy == creep.carryCapacity){
      if(creep.carry.energy > 0){
        lca(creep, 'dropping off the energy I have ' + creep.carry.energy + '.');
        creep.memory.state = 'transferring';
      } else {
        lca(creep, 'no valid drops, no energy, waiting.');
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

    } else {
      var altTarget = findNearestEnergyNeed(creep);

      log('altTarget is a ' + altTarget.structureType)

      if(altTarget !== null){
          lca(creep, 'is taking energy to a (' + altTarget.structureType + ' - ' + altTarget.pos.x +',' + altTarget.pos.y + ' it is at ' + altTarget.energy + ' of ' + altTarget.energyCapacity + ').');
          creep.moveTo(altTarget);
          creep.transferEnergy(altTarget);
        } else {
          lca(creep, 'all extensions and spawn are full.');
        }
      }

      /*lca(creep, 'no storage exists, moving to pile flag to make a pile at ' + pile.pos.x + ',' + pile.pos.y + '.');

      creep.moveTo(pile);
      if(creep.pos.x == pile.pos.x && creep.pos.y == pile.pos.y){
        lca(creep, 'reached pile, dropping energy');
        creep.dropEnergy();
        creep.memory.state = 'cleanup';
      }*/
    break;
  default:
    lca(creep, 'my state ' + creep.memory.state + ' has no functionality...');
    creep.memory.state = 'cleanup';
  }

  if(creep.carry.energy === 0){
    creep.memory.state = 'cleanup';
  }
}