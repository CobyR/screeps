function structureReport(room, structureType){
  var structures = room.find(FIND_STRUCTURES, {
                             filter: { structureType: structureType}
                             });

  var strongest = null;
  var weakest = null;
  var totalHits = 0;
  var averageHits = 0;
  var hitsArray = [];
  var s = null;

  for(var id in structures) {
    s = structures[id];
    if(strongest === null || s.hits > strongest.hits){
      strongest = s;
    }
    if(weakest === null || s.hits < weakest.hits){
      weakest = s;
    }
    totalHits += s.hits;
    hitsArray.push(s.hits);
  }

  averageHits = totalHits / structures.length;

  var above = 0;
  var below = 0;
  for(id in structures){
    s = structures[id];
    if(s.hits > averageHits){
      above ++;
    } else {
      below ++;
    }
  }

  console.log(structures.length + ' ' + structureType + 's in this room.');
  console.log('Strongest: ' + nwc(strongest.hits) + ' and is located at ' + strongest.pos.x + ',' + strongest.pos.y + ' with a ratio of: ' + pct(calcRatio(strongest)) + '.');
  console.log('  Weakest: ' + nwc(weakest.hits) + ' and is located at ' + weakest.pos.x + ',' + weakest.pos.y + ' with a ratio of: ' + pct(calcRatio(weakest)) + '.');
  console.log('Average Hits per ' + structureType + ' is ' + nwc(averageHits) + '.');
  console.log('There are ' + above + ' above the average, and '+ below + ' below.');
  console.log('Median hits per ' + structureType + ' is ' + nwc(median(hitsArray)));
}
