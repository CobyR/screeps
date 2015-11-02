function findEnergy(creep,source){
  var spawn = creep.room.find(FIND_MY_SPAWNS)[0];

  if(!source){
    source = findNearestSource(creep);
  }

  if(creep.room.storage){
    var nearestDrop = findNearestDroppedEnergy(creep);
    var dropDistance = creep.pos.getRangeTo(nearestDrop);
    var storageDistance = creep.pos.getRangeTo(creep.room.storage);
    lca(creep, 'storageDistance is: ' + storageDistance +
        ' and dropDistance is: ' + dropDistance);
    if(storageDistance <= dropDistance){
      // storage is closer use it.
      lca(creep, 'is moving to storage to get energy.');
      creep.moveTo(creep.room.storage);
      creep.room.storage.transferEnergy(creep);
    } else if(storageDistance > dropDistance && nearestDrop.energy < creep.carryCapacity){
      lca(creep, 'storage is further than an energy drop, but the drop is not worth it.');
      creep.moveTo(creep.room.storage);
      creep.room.storage.transferEnergy(creep);
    } else {
      lca(creep, 'is moving to dropped energy to pick it up.');
      creep.moveTo(nearestDrop);
      creep.pickup(nearestDrop);
    }
  } else if(spawn) {
    var nearestEnergy = findNearestEnergy(creep);
    if(nearestEnergy){
      lca(creep, 'is getting energy from a ' + nearestEnergy.structureType + '.');
      creep.moveTo(nearestEnergy);
      nearestEnergy.transferEnergy(creep);
    } else if(source) {
      lca(creep, 'is gathering energy from a source.');
      creep.moveTo(source);
      creep.harvest(source);
      pickupEnergy(creep);
    } else {
      lca(creep, 'there is no available energy, and no viable source.');
    }
  }
}

function findNearestEmergencyRepair(creep){
  var MIN_HITS = 1000;
  var shortestDistance = 50;
  var distance = 0;
  var nearestEmergency = null;

  var structures = creep.room.find(FIND_STRUCTURES);
  var candidates = [];

  _.forEach(structures, function (structure){
    if(structure.hits < MIN_HITS){
      candidates.push(structure);
    }
  });

  _.forEach(candidates, function(candidate){
    distance = creep.pos.getRangeTo(candidate);
             if(distance < shortestDistance){
               shortestDistance = distance;
               nearestEmergency = candidate;
             }
  });

  return nearestEmergency;
}

function findNearestEnemy(creep, enemies){
  var shortestDistance = 50;
  var distance = 0;
  var closestHostile = null;

  for(var i in enemies){
    var hostile = enemies[i];

    distance = creep.pos.getRangeTo(hostile);

    if(distance < shortestDistance){
      shortestDistance = distance;
      closestHostile = hostile;
    }
  }
  return closestHostile;
}

function findNearestDroppedEnergy(creep, maxRange) {
  var shortestDistance = 50;
  var distance = 0;
  var nearestDrop = null;

  if(!maxRange){
    maxRange = 50;
  }

  var drops = creep.room.find(FIND_DROPPED_ENERGY);

  for(var i in drops){
    var drop = drops[i];

    distance = creep.pos.getRangeTo(drop);
    if(distance < maxRange){
      if(distance < shortestDistance){
        shortestDistance = distance;
        nearestDrop = drop;
      }
    }
  }
  return nearestDrop;
}

function findNearestSource(creep) {
  var shortestDistance = 50;
  var distance = 0;
  var closestSource = null;

  var sources = creep.room.find(FIND_SOURCES);

  for(var i in sources){
    var source = sources[i];

    distance = creep.pos.getRangeTo(source);

    if(distance < shortestDistance){
      shortestDistance = distance;
      closestSource = source;
    }
  }
  return closestSource;
}


function findNearestConstructionSite(creep) {
  var shortestDistance = 50;
  var distance = 0;
  var closestSite = null;

  var sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);

  for(var i in sites){
    var site = sites[i];

    distance = creep.pos.getRangeTo(site);

    if(distance < shortestDistance){
      lca(creep, 'fNCS:' + distance + ' away from construction site at ' + site.pos.x + ',' + site.pos.y, true);
      shortestDistance = distance;
      closestSite = site;
    }
  }
  return closestSite;
}

function findNearestEnergy(creep){
  var shortestDistance = 50;
  var distance = 0;
  var closestEnergy = null;

  var extensions = getExtensionsWithEnergy(creep);

  var storage = null;
  if(typeof creep.room.storage !== 'undefined'){
    storage = creep.room.storage;
  }

  for(var i in extensions){
    var extension = extensions[i];

    distance = creep.pos.getRangeTo(extension);

    if(distance < shortestDistance){
      shortestDistance = distance;
      closestEnergy = extension;
    }
  }

  if(storage){
    if(storage.store.energy > USE_STORAGE_THRESHOLD){
       distance = creep.pos.getRangeTo(storage);
      if(distance < shortestDistance){
        closestEnergy = storage;
      }
    }
  }

  return closestEnergy;
}

function findNearestEnergyNeed(creep){
  var shortestDistance = 50;
  var distance = 0;
  var closestEnergy = null;

  var extensions = getExtensionsWithEnergyNeeds(creep);

  var storage = null;
  if(typeof creep.room.storage !== 'undefined'){
    storage = creep.room.storage;
  }

  var spawn = null;
  var spawns = creep.room.find(FIND_MY_SPAWNS);
  for(var i in spawns){
    spawn = spawns[i];
    if(spawn.energy == spawn.energyCapacity){
      continue;
    }
    distance = creep.pos.getRangeTo(spawn);

    if(distance < shortestDistance){
      shortestDistance = distance;
      closestEnergy = spawn;
    }
  }

  for(var e in extensions){
    var extension = extensions[e];

    distance = creep.pos.getRangeTo(extension);

    if(distance < shortestDistance){
      shortestDistance = distance;
      closestEnergy = extension;
    }
  }

  if(storage){
    if(storage.store.energy > USE_STORAGE_THRESHOLD){
       distance = creep.pos.getRangeTo(storage);
      if(distance < shortestDistance){
        closestEnergy = storage;
      }
    }
  }

  return closestEnergy;
}

function getExtensionsWithEnergy(creep) {
  var extensions = creep.room.find(FIND_MY_STRUCTURES, {filter: {
                                  structureType: STRUCTURE_EXTENSION
                                                            } });
  var usefulExtensions = [];
  var extension = null;

  for(var id in extensions){
    extension = extensions[id];
    if(extension.energy == extension.energyCapacity){
      usefulExtensions.push(extension);
    }
  }
  return usefulExtensions;
}

function getExtensionsWithEnergyNeeds(creep){
  var extensions = creep.room.find(FIND_MY_STRUCTURES, {filter: {
                                  structureType: STRUCTURE_EXTENSION
                                                            } });
  var withNeeds = [];
  var extension = null;

  for(var id in extensions){
    extension = extensions[id];
    if(extension.energy < extension.energyCapacity){
      withNeeds.push(extension);
    }
  }
  return withNeeds;
}

function getDNRStructures(room){
  var dnrFlags = room.find(FIND_FLAGS, { filter: { color: COLOR_CYAN}});
  var dnrStructures = [];

  for(var i in dnrFlags){
    var dnr = dnrFlags[i];
    var structures = dnr.pos.findInRange(FIND_STRUCTURES,1);

    dnrStructures.push(structures);

  }
  return _.flatten(dnrStructures);

}

function flagBoolean(name){
  var flag = p_room.find(FIND_FLAGS, { filter: { name: name, color: COLOR_WHITE}});
  //console.log (flag.length)
  if(flag.length > 0){
    return true;
  } else {
    return false;
  }
}

function flagReports(name){
  var rptFlags = p_room.find(FIND_FLAGS, { filter: { name: name}});
  var reports = [];
  // console.log('flagReports: ' + name + ' - ' + rptFlags + ' -  ' + rptFlags.length + '.');

  for(var i in rptFlags){
    var check = rptFlags[i];
    // console.log('  ' + check.color);

    switch(check.color){
    case COLOR_WHITE:
      reports.push('global');
      break;
    case COLOR_YELLOW:
      reports.push('harvester');
      reports.push('upgrader');
      break;
    case COLOR_PURPLE:
      reports.push('hoarder');
      reports.push('transporter');
      break;
    case COLOR_RED:
      reports.push('guard');
      break;
    case COLOR_BROWN:
      reports.push('builder');
      break;
    case COLOR_ORANGE:
      reports.push('explorer');
      break;
    case COLOR_GREEN:
      reports.push('sweeper');
      break;
    }
  }
  // console.log('     ' + reports.length + ' first ' + reports[0]);
  return reports;
}

function structureReports(){
    return p_room.find(FIND_FLAGS, { filter: {name: 'SR'}}).length;
}

function cleanupMemory() {
  if(Game.time % 100 === 1){
    if (_.isObject(Memory.creeps) && _.isObject(Game.creeps)) {
      var dead = _.difference(Object.keys(Memory.creeps), Object.keys(Game.creeps));
      _.forEach(dead, function(name) {
      delete Memory.creeps[name]
      });
    }
  }
}

function pct(value) {
  return (value * 100).toFixed(2) + '%';
}

function calcRatio(target){
  var RAMPART_HITS = 2000000;
  var WALL_HITS = 2000000;
  var ratio = 0;

  if(target === null){
    return 1;
  }

  switch(target.structureType) {
  case 'rampart':
    ratio = target.hits / RAMPART_HITS;
    break;
  case 'constructedWall':
    ratio = target.hits / WALL_HITS;
    break;
  default:
    ratio = target.hits / target.hitsMax;
    break;
  }

  return ratio;
}

function nwc(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function median(values) {

    values.sort( function(a,b) {return a - b;} );

    var half = Math.floor(values.length/2);

    if(values.length % 2)
        return values[half];
    else
        return (values[half-1] + values[half]) / 2.0;
}

function sum(values){
  var sumation = 0;
  _.forEach(values, function(value){
              sumation += value;
            });
  return sumation;
}

function average(values){
  return sum(values) / values.length;
}

function displayErr(results) {
  switch(results) {
  case 7:
    return 'LEFT';
  case 3:
    return 'RIGHT';
  case 4:
    return 'BOTTOM_RIGHT';
  case 5:
    return 'BOTTOM';
  case 6:
    return 'BOTTOM_LEFT';
  case 8:
    return 'TOP_LEFT';
  case 2:
    return 'TOP_RIGHT';
  case 1:
    return 'TOP';
  case 0:
    return 'OK';
  case -1:
    return 'ERR_NOT_OWNER';
  case -2:
    return 'ERR_NO_PATH';
  case -3:
    return 'ERR_NAME_EXISTS';
  case -4:
    return 'ERR_BUSY';
  case -6:
    return 'ERR_NOT_ENOUGH_ENERGY';
  case -7:
    return 'ERR_INVALID_TARGET';
  case -8:
    return 'ERR_FULL';
  case -9:
    return 'ERR_NOT_IN_RANGE';
  case -10:
    return 'ERR_INVALID_ARGS';
  case -11:
    return 'ERR_TIRED';
  case -12:
    return 'ERR_NO_BODYPART';
  case -15:
    return 'ERR_GCL_NOT_ENOUGH';
  default:
    return results;
  }
}