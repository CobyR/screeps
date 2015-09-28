module.exports = function() {
  var totalEnergy = 0;

  for(id in Game.rooms) {
    var room = Game.rooms[id];
    // console.log('[DEBUG] ' + id + ' - ' + room.energyAvailable);
    totalEnergy += room.energyAvailable;
  }

  return totalEnergy;
}