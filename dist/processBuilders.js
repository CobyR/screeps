module.exports = function(builders, p_room) {
  var buildThings = require('builder');

  for(var id in builders) {
    var creep = Game.getObjectById(builders[id]);
    buildThings(creep, p_room);
  }
}