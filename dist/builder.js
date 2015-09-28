module.exports = function (creep, p_room) {
    var fixPrioritizedStructure = require('buildergetPrioritizedStructure')

    var WALL_HEALTH = 20000;

    if(creep.spawning == true) {
        lca(creep, 'is still spawning.')
        return 0;
    }

    if(creep.carry.energy == 0  && Game.spawns.Harbor.energy >= (Game.spawns.Harbor.energyCapacity - 50)) {
        console.log( creep.name + '|' + creep.memory.role + ' is getting energy from spawn.');
        creep.moveTo(Game.spawns.Harbor);
        Game.spawns.Harbor.transferEnergy(creep);
    }
    else {
        if(creep.carry.energy == 0) {
            console.log( creep.name + '|' + creep.memory.role + ' is traveling to spawn for energy.')
            creep.moveTo(Game.spawns.Harbor);
        }
        else {
            var targets = p_room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length == 0) {
                fixPrioritizedStructure(creep);
            }
            else {
                // console.log('[DEBUG] Construction sites: ' + targets.length);
                if(targets.length > 0) {
                    console.log(creep.name + '|' + creep.memory.role + ' found a construction site.');
                    creep.moveTo(targets[0]);
                    creep.build(targets[0]);
                    creep.memory.currentTarget = null; // this causes them to forget what they were working on before
                }
                else {
                    console.log(creep.name + '|' + creep.memory.role + ' needs a construction site.')
                }
            }
        }
    }
}
