Structure.prototype.needsRepair = function(name) {
  return this.hits < this.hitsMax / 2;
};


var stayalive = require('stayalive');

var numberWithCommas = require('numberWithCommas');
var totalEnergy = require('totalEnergy');
var lca = require('logCreepAction');
var setupPrototypes = require('setupPrototypes');

var processExplorers = require('processExplorers');
var processBuilders = require('processBuilders');
var processGuards = require('processGuards');
var processWorkers = require('processWorkers');
var processHoarders = require('processHoarders');

var p_room = Game.rooms['W11S25'];

//setupPrototypes();


module.exports.loop = function () {

  console.log('===== Tick =====');

    stayalive(p_room);

    var explorers = [];
    var builders = [];
    var workers = [];
    var guards = [];
    var hoarders = [];

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];

        if(creep.age < 25) {
          lca(creep, 'is about to die in ' + creep.age + ' ticks.');
        }

      switch(creep.memory.role) {
        case 'guard':
          guards.push(creep.id);
          break;
        case 'harvester':
          workers.push(creep.id);
          break;
        case 'upgrade':
          workers.push(creep.id);
          break;
        case 'builder':
          builders.push(creep.id);
        break;
        case 'explorer':
          explorers.push(creep.id);
          break;
        case 'hoarder':
          hoarders.push(creep.id);
          break;
        default:
          lca(creep, 'does not have a programmed role.');
          break;
      }
    }


    processGuards(guards, p_room);
    processWorkers(workers, p_room);
    processBuilders(builders, p_room);
    processHoarders(hoarders, p_room);
    processExplorers(explorers);

  console.log('Global Control Report - Level: ' + Game.gcl.level + ' - ' + numberWithCommas(Game.gcl.progress) + ' of ' + numberWithCommas(Game.gcl.progressTotal) + '.');
  console.log(' Energy: ' + numberWithCommas(p_room.energyAvailable) + ' of ' + numberWithCommas(p_room.energyCapacityAvailable));
  console.log('totalEnergy: ' + numberWithCommas(totalEnergy(p_room)));
  console.log('all scripts completed ' + Game.time);

}
