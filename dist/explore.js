/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('explore'); // -> 'a thing'
 */

 module.exports = function(creep) {
    var displayError = require('displayError')
    var results = null;

    console.log( creep.name + ' is in ' + creep.memory.mode + ' mode in room: ' + creep.pos.roomName + '.')
    switch(creep.memory.mode) {
        case 'room':
            if(typeof creep.memory.roomDestination === 'undefined') {
                console.log(creep.name + ' is in room mode, but has no roomDestination');
            }
            break;
        case 'pos':
            if(typeof creep.memory.posDestination === 'undefined' || creep.memory.posDestination == null) {
                console.log(creep.name + ' is in pos mode, but has no posDestination');
            } else {
                // position is defined - handle movement of creep
                if(creep.pos.roomName == creep.memory.posDestination.roomName) {
                    // we are in the correct room
                    // 1. check to see if we have reached destination
                    //    yes - stop
                    //    no  - move
                    if(creep.pos.x == creep.memory.posDestination.x &&
                       creep.pos.y == creep.memory.posDestination.y &&
                       creep.pos.roomName == creep.memory.posDestination.roomName) {
                        console.log(creep.name + ' has reached the destination.');
                        //creep.memory.posDestination = null;
                    } else {
                        creep.moveTo(creep.memory.posDestination.x, creep.memory.posDestination.y);
                    }
                } else {
                    console.log( creep.name + ' is not in the room matching his posDestination');
                    if(creep.pos.x == 49) {
                        creep.move(LEFT);
                    }
                    if(creep.pos.x == 0) {
                        creep.move(RIGHT);
                    }
                    if(creep.pos.y == 49) {
                        creep.move(TOP);
                    }
                    if(creep.pos.y == 0) {
                        creep.move(BOTTOM);
                    }
                    creep.memory.posDestination = null;
                }

            }
            break;
        case 'target':
            // Check for appropriate destination
            if(typeof creep.memory.targetDestination === 'undefined' || creep.memory.targetDestination == null) {
                console.log(creep.name + 'is in target mode, but has no targetDestination');
            } else {
                // targetDestination is defined
                var target = creep.memory.targetDestination
                results = creep.moveTo(Game.structures[target.id]);
                if(results != OK) { console.log(creep.name + ' call to moveTo returned: ' + displayError(results)) }
            }
            break;
        case 'controller':
            creep.moveTo(creep.room.controller);
            results = creep.claimController(creep.room.controller);
            if(results != OK) { console.log(creep.name + ' call to claimController returned: ' + displayError(results)) }
            break;
        default:
            //console.log(creep.name + ' is in ' + creep.memory.mode + ' mode (default?).');
    }

    /*
    if(typeof creep.memory.roomDestination === undefined) {
         if(Game.time % 1 == 0){
             console.log( creep.name + ' is awaiting a roomDestination to be set.');
         }
     }
     else {
        if(creep.room.name != creep.memory.roomDestination) {
            var route = creep.room.findExitTo(creep.memory.roomDestination);
            if(route != ERR_NO_PATH) {
                console.log(creep.name + '\'s route is ' + route);
                creep.moveTo(creep.pos.findClosestByPath(route));
            } else {
                console.log(creep.name + ' is standing by... console please')
            }
        }
     }
     */
 }