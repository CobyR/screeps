var harvester = require('harvester');
var upgrade = require('upgrade');
var stayalive = require('stayalive');
var protect = require('protect');
var buildThings = require('builder');
var explore = require('explore');
var numberWithCommas = require('numberWithCommas');
var totalEnergy = require('totalEnergy');
var lca = require('logCreepAction');

var p_room = Game.rooms['W11S25'];

module.exports.loop = function () {

  console.log('===== Tick =====');

    stayalive(p_room);

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];

        if(creep.age < 25) {
          lca(creep, 'is about to die in ' + creep.age + ' ticks.');
        }

        if(creep.memory.role == 'guard') {
            protect(creep, p_room);
        }

        if(creep.memory.role == 'harvester') {
            harvester(creep, p_room);
        }

        if(creep.memory.role == 'upgrade') {
            upgrade(creep, p_room);
        }

        if(creep.memory.role == 'builder') {
            buildThings(creep, p_room);
        }

        if(creep.memory.role == 'explorer') {
            explore(creep);
        }

    }

  console.log('Global Control Report - Level: ' + Game.gcl.level + ' - ' + numberWithCommas(Game.gcl.progress) + ' of ' + numberWithCommas(Game.gcl.progressTotal) + '.');
  console.log(' Energy: ' + numberWithCommas(p_room.energyAvailable) + ' of ' + numberWithCommas(p_room.energyCapacityAvailable));
  console.log('all scripts completed ' + Game.time);

}
