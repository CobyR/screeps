module.exports = function(creep, destRoomName) {
  var lca = require('logCreepAction');
  var displayErr = require('displayError');
  var secretMission = require('secretMission');

  var dRoom = null;
  var cRoom = creep.room;
  var evalX = -1;
  var evalY = -1;

  var exitDir = cRoom.findExitTo(destRoomName || creep.memory.roomDestination);

  if(creep.room.name != creep.memory.previousRoom) {
    lca(creep,'I changed rooms ------------------------->',true);
    var results = creep.moveTo(25, 25);
    //lca(creep, 'trying to move in the new room yielded: ' + displayErr(results), true);
    creep.memory.previousRoom = creep.room.name;
    return OK;
  }

  switch(exitDir) {
  case TOP:
    //lca(creep, 'exit is to the top, evaluating the options');
    evalY = 0;
    break;

  case RIGHT:
    //lca(creep, 'exit is to the right, evaluating the options');
    evalX = 49;
    break;

  case BOTTOM:
    //lca(creep, 'exit is to the bottom, evaluating the options');
    evalY = 49;
    break;

  case LEFT:
    //lca(creep,'exit is to the left, evaluating the options');
    evalX = 0;
    break;

  default:
    if(creep.room.name == creep.memory.roomDestination){
      lca(creep, 'destination reached, executing the secret mission!');
      var results = secretMission(creep);
    }
    lca(creep, 'an exit to reach ' + destRoomName + ' doesn\'t exist');
    return OK;
    break;
  }

  // evalute movement
  var x = 0;
  var y = 0;
  var shortestDistance = 50;
  var closestExitPos = null;

  for (i = 0; i < 50; i++) {
    if(evalX == -1){
      x = i;
      y = evalY;
    } else {
      x = evalX;
      y = i;
    }
    var things = creep.room.lookAt(x,y);
    if(things[0].terrain == 'plain'){
      var exitPosition = creep.room.getPositionAt(x, y);
      //console.log(exitPosition);
      var distance = creep.pos.getRangeTo(exitPosition);
      if(distance < shortestDistance){
        shortestDistance = distance;
        closestExitPos = exitPosition;
        // lca(creep, x +  ',' + evalY + ' : ' + things[0].terrain + ' distance = ' + distance,true);
      }
    }
  }
  results = creep.moveTo(exitPosition);
  if(results != OK || results != ERR_TIRED){
    if(results == ERR_NO_PATH){
      lca(creep,'trying the destructible route');
      results = creep.moveTo(exitPosition,{ ignoreDestructibleStructures: true });
      lca(creep, 'destruction path resulted in: ' + displayErr(results) + ' to ' +
         exitPosition.x + ',' + exitPosition.y + ' in room: ' + exitPosition.roomName);
    } else {
      lca(creep, 'movement resulted in: ' + displayErr(results));
    }

  }
  creep.memory.previousRoom = cRoom.name;
};
