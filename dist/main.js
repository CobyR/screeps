var stayalive = require('stayalive');

var harvester = require('harvester');
var upgrade = require('upgrade');
var protect = require('protect');
var buildThings = require('builder');
var explore = require('explore');
var hoard = require('hoarder');

var numberWithCommas = require('numberWithCommas');
var totalEnergy = require('totalEnergy');
var lca = require('logCreepAction');
var setupPrototypes = require('setupPrototypes');

var p_room = Game.rooms['W11S25'];

//setupPrototypes();

Structure.prototype.needsRepair = function(name) {
  return this.hits < this.hitsMax / 2;
};

module.exports.loop = function () {

  console.log('===== Tick =====');

    stayalive(p_room);

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];

        if(creep.age < 25) {
          lca(creep, 'is about to die in ' + creep.age + ' ticks.');
        }

      switch(creep.memory.role) {
        case 'guard':
          protect(creep, p_room);
          break;
        case 'harvester':
          harvester(creep, p_room);
          break;
        case 'upgrade':
          upgrade(creep, p_room);
          break;
        case 'builder':
          buildThings(creep, p_room);
          break;
        case 'explorer':
          explore(creep);
          break;
        case 'hoarder':
          hoard(creep);
          break;
        default:
          lca(creep, 'does not have a programmed role.');
          break;
      }
    }

  console.log('Global Control Report - Level: ' + Game.gcl.level + ' - ' + numberWithCommas(Game.gcl.progress) + ' of ' + numberWithCommas(Game.gcl.progressTotal) + '.');
  console.log(' Energy: ' + numberWithCommas(p_room.energyAvailable) + ' of ' + numberWithCommas(p_room.energyCapacityAvailable));
  console.log('totalEnergy: ' + numberWithCommas(totalEnergy(p_room)));
  console.log('all scripts completed ' + Game.time);

}
