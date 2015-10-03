module.exports = function(explorers) {
  var explore = require('explore');

  for(var id in explorers) {
    var creep = Game.getObjectById(explorers[id]);
    explore(creep);
  }
}