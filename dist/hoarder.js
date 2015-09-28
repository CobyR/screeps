/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('hoarder'); // -> 'a thing'
 */

 module.exports = function(creep) {
     if(creep.energy == 0) {
        var sources = creep.room.find(FIND_SOURCES);
        lca(creep, 'is gathering energy.');
        creep.moveTo(sources[0]);
        creep.harvest(sources[0]);
     } else {
        var target = creep.room.storage;
        lca(creep, 'is taking energy to storage (' + target.energy + ' of ' + target.energyCapacity + ').');
        creep.moveTo(creep.room.storage);
        creep.transferEnergy(creep.room.storage);
     }
 }