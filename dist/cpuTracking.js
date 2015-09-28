/* globals isSimulation, debug */

'use strict';

var cpuAtScriptStart;
var metricsInterval = 20
var metricsWindow = 60

function getGameTimestamp() {
    return isSimulation ? performance.now()  : Game.getUsedCpu();
}

function updateCpuAverage() {
    Memory.cpuAverage.unshift(getGameTimestamp() - cpuAtScriptStart);

    while(Memory.cpuAverage.length > metricsWindow) {
        Memory.cpuAverage.pop()
    }
}

function gameLoopCpuReport() {
    cpuAtScriptStart = getGameTimestamp();

    if (Game.cpuLimit < 500){
        Game.notify('CPU Limit: '+Game.cpuLimit+" last tick: "+Memory.cpuAverage[0], 0)
    }

    if(!Memory.cpuAverage) {
        Memory.cpuAverage = []
    }


    var average = 0
    var list = Memory.cpuAverage
    var len = list.length

    if (len > 0 && (Game.time % metricsInterval) === 0) {
        for (var i = 0; i < len; ++i) {
            average += list[i]
        }

        average = average/len
        var min=Math.min.apply(null, list);
        var max=Math.max.apply(null, list);

        debug('cpu avg='+average.toFixed(2),
              'max='+max.toFixed(2),
              'min='+min.toFixed(2))
    }
}