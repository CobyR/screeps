function storageReport(room) {
  var upDown = '';

  if(typeof room.storage !== 'undefined'){

    if(typeof room.memory.lastRoundStoredEnergy === 'undefined'){
      room.memory.lastRoundStoredEnergy = room.storage.store.energy;
      room.memory.lastRoundTicks = Game.time;
    }

    var lastRound = room.memory.lastRoundStoredEnergy;
    var diff = room.storage.store.energy - lastRound;

    if(Game.time % 100 === 0){
      if(diff !== 0){
        room.memory.lastRoundTicks = Game.time;
      }
      room.memory.lastRoundStoredEnergy = room.storage.store.energy;
    }

    if(diff === 0){
      upDown = 'stayed the same';
    } else if(diff > 0) {
      upDown = 'gone up';
    } else {
      upDown = 'gone down';
    }
    if(diff === 0){
      log('Storage Report for ' + room.name + ': ' + nwc(room.storage.store.energy) + ' has ' + upDown + ' for the last ' + (Game.time - room.memory.lastRoundTicks) + ' ticks.');
    } else {
      log('Storage Report for ' + room.name + ': ' + nwc(room.storage.store.energy) + ' has ' + upDown + ' by ' + nwc(Math.abs(diff)) + ' since the benchmark was set ' + (Game.time - room.memory.lastRoundTicks) + ' ticks ago.');
    }
  }
}