module.exports = function(p_room) {
  var totalEnergy = 0;

  var structures = p_room.find(FIND_MY_STRUCTURES);
  var extensions = [];
  var spawns = [];

  console.log(structures.length);

  for(var name in structures){
    var structure = structures[name];
    var ext = null;

    switch(structure.structureType) {
    case 'extension':
      // console.log('Extension: ' + structure.id + ' - ' + structure.energy);
      totalEnergy += structure.energy;
      break;
    case 'spawn':
      // console.log('Spawn: ' + structure.name + ' - ' + structure.energy);
      totalEnergy += structure.energy;
    default:
    }
  }

  return totalEnergy;
}