/* globals isSimulation, debug */

'use strict';

var cpuAtScriptStart;

function getGameTimestamp() {
  return isSimulation ? performance.now()  : Game.getUsedCpu();
}

function updateCpuAverage() {
  Memory.cpuAverage.unshift(getGameTimestamp() - cpuAtScriptStart);

  while(Memory.cpuAverage.length > 360) {
    Memory.cpuAverage.pop();
  }
}

function gameLoopCpuReport() {
  cpuAtScriptStart = getGameTimestamp();

  if (Game.cpuLimit < 500){
    Game.notify('CPU Limit: '+Game.cpuLimit+" last tick: "+Memory.cpuAverage[0], 0);
  }

  if(!Memory.cpuAverage) {
      Memory.cpuAverage = [];
    }


  var average = 0;
  var list = Memory.cpuAverage;
  var len = list.length;

  if (len > 0) {
    for (var i = 0; i < len; ++i) {
      average += list[i];
    }

    average = average/len;

    debug('cpu avg='+average.toFixed(2), 'last='+Memory.cpuAverage[0].toFixed(2));
  }
}