function assignNextPosition(creep_ids) {

  console.log('assignNextPosition');
  var oldestCreep = Game.getObjectById(creep_ids[0]);

  var positions = null;
  var roomName = oldestCreep.room.name;

  switch(roomName){
    case 'W11S26':
      console.log(roomName + ' has positions to go for');
      positions = [
        new RoomPosition(35,16, roomName),
        new RoomPosition(36,16, roomName),
        new RoomPosition(34,16, roomName)
      ];
  }

  // check to see if any positions have been completed
  var positionToCheck = -1;
  if(typeof oldestCreep.memory.secretMissionStepCompleted == 'undefined' ||
     oldestCreep.memory.secretMissionStepCompleted === null) {
     positionToCheck = 0;
  } else {
    positionToCheck = oldestCreep.memory.secretMissionStepCompleted + 1;
  }
  console.log('positionToCheck ' + positionToCheck);
  lca(oldestCreep, oldestCreep.pos.x + ',' + oldestCreep.pos.y + ' vs ' + positions[positionToCheck].x + ',' + positions[positionToCheck].y);

  if(oldestCreep.pos.x == positions[positionToCheck].x && oldestCreep.pos.y == positions[positionToCheck].y) {
    console.log('the oldest creep has reached the position in question');
    // the specified position has been reached
    // set secretMissionStepCompleted to position index for all creeps passed in
    // if it is not the last position then set their next position to the next
    //   element in the array

    for(var id in creep_ids){
      var creep = Game.getObjectById(creep_ids[id]);

      creep.memory.secretMissionStepCompleted = positionToCheck;
      lca(creep, 'reassigning creeps');
      if(positionToCheck != positions.length - 1){
        creep.memory.posDestination = positions[positionToCheck +1];
      } else {
        creep.memory.posDestination = null;
        creep.memory.secretMissionStepCompleted = null;
        creep.memory.state = 'success';
        creep.memory.mode = 'pillage';
      }
    }
  } else {
    lca(oldestCreep, 'unexpected code branch');
  }
}
