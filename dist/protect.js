var displayErr = require('displayError');

 module.exports = function (creep, p_room) {
    if(creep.spawning == true) {
        console.log(creep.name + ' is still spawning.')
        return 0
    }

    var targets = creep.room.find(FIND_HOSTILE_CREEPS);
    if(targets.length) {
        lca(creep, ' has found ' + targets.length + ' hostiles.');
        creep.moveTo(targets[0]);
        creep.attack(targets[0]);
    }
    else {
        if(typeof creep.memory.destination === 'undefined') {
            targets = p_room.find(FIND_STRUCTURES);
            for(var index in targets) {
                var target = targets[index];
                //console.log( creep.name + ' evaluating ' + target.structureType + ' mine?:' + target.my)
                if(target.structureType == STRUCTURE_RAMPART){
                    if(creep.memory.action != 'onway' &&
                        creep.memory.action != 'guarding') {
                        creep.memory.destination = target
                        creep.memory.action = 'onway';
                    }
                }
            }
        }
        else {
            if(creep.memory.action != 'guarding') {
                //console.log(creep.name + ' is moving to ' + creep.memory.destination.structureType + ' at ' + creep.memory.destination.pos.x + ',' + creep.memory.destination.pos.y);
                //var results = creep.moveTo(creep.memory.destination.pos.x,creep.memory.destination.y);
                //console.log(creep.name + ' returned ' + displayErr(results) + ' when asked to move.')
                if(creep.pos.x == creep.memory.destination.pos.x && creep.pos.y == creep.memory.destination.pos.y) {
                    console.log(creep.name + ' has arrived at ' + creep.memory.destination.structureType);
                    creep.memory.action = 'guarding';
                }
            }
        }
    }
}