module.exports = function(target){
  var RAMPART_HITS = 200000;
  var WALL_HITS = 20000;
  var ratio = 0;

  switch(target.structureType) {
  case 'rampart':
    ratio = target.hits / RAMPART_HITS;
    break;
  case 'constructedWall':
    ratio = target.hits / WALL_HITS;
    break;
  default:
    ratio = target.hits / target.hitsMax;
    break;
  }

  return ratio;
};