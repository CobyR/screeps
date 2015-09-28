module.exports = function (creep, p_room) {
    var lca = require('logCreepAction');
    var busy = 0;
    var STORAGE_LIMIT = 1000;

    if(creep.spawning == true) {
        lca(creep, 'is still spawning.');
        return 0
    }
    //lca(creep, creep.carry.energy + ' - ' + creep.memory.state + ' - ' + creep.carryCapacity + '.', true)
    if(creep.carry.energy == 0 || (creep.memory.state == 'gathering' && creep.carry.energy < creep.carryCapacity)) {
        var sources = creep.room.find(FIND_SOURCES);
        lca(creep, 'is gathering energy: ' + creep.carry.energy + ' of ' + creep.carryCapacity + '.');
        creep.moveTo(sources[0]);
        creep.harvest(sources[0]);
        creep.memory.state = 'gathering'
    }
    else {
        creep.memory.state = 'transferring';
        if(Game.spawns.Harbor.energy == Game.spawns.Harbor.energyCapacity) {
            // lca(creep, 'observed that the spawn energy level is at capacity.', true);
            // lca(creep, 'has ' + creep.carry.energy + ' energy.',true);
            if(creep.carry.energy > 0) {
                targets = p_room.find(FIND_MY_STRUCTURES);
                //console.log(creep.name + ' says there are ' + targets.length + ' structures, looking for STRUCTURE_EXTENSION');
                for(var index in targets) {
                    var target = targets[index];
                    //console.log(creep.name + ' is evaluating ' + index + ' - structure type is: ' + target.structureType);
                    if(target.structureType == 'extension' && busy == 0) {
                        if(target.energy < target.energyCapacity) {
                            lca(creep, 'is taking energy to a (' + target.structureType + ' - ' + target.id + ' it is at ' + target.energy + ' of ' + target.energyCapacity + ').')
                            creep.moveTo(target);
                            creep.transferEnergy(target);
                            busy = 1;
                        }
                    } else if(target.structureType == 'storage' && busy == 0) {
                        if(target.energy < STORAGE_LIMIT) {
                            lca(creep, 'is taking energy to storage (' + target.energy + ' of ' + STORAGE_LIMIT + ' max: ' + target.energyCapacity + ').');
                            creep.moveTo(creep.room.storage);
                            creep.transferEnergy(creep.room.storage);
                            busy = 1;
                        }
                    }
                }
            }
            if(busy == 0 && (typeof creep.memory.locked === 'undefined' || creep.memory.locked == false)) {
                creep.memory.role = 'upgrade';
                console.log(creep.name + ' is now in \'upgrade\' mode.');
            }
        }
        else {
            console.log( creep.name + '|' + creep.memory.role + ' is taking energy to spawn: ' + creep.carry.energy + ' of ' + creep.carryCapacity + '.');
            creep.moveTo(Game.spawns.Harbor);
            creep.transferEnergy(Game.spawns.Harbor);
        }
    }
}