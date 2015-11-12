function initializeRoom(room){
  if(!room.memory.counter) {
    room.memory.counter = {
      harvester: 0,
      hoarder: 0,
      sweeper: 0,
      transporter: 0,
      upgrader: 0,
      guard: 0,
      warrior: 0,
      medic: 0,
      builder: 0,
      explorer: 0
    };
  }
  if(!room.memory.max){
    room.memory.max = {
      harvesters: 0,
      hoarders: 0,
      sweepers: 0,
      transporters: 0,
      upgraders: 0,
      guards: 0,
      warriors: 0,
      medics: 0,
      builders: 0,
      explorers: 0
    };
  }

  switch(room.name){
  case 'W14N17':
    if(!room.memory.toLink){
      room.memory.toLink = Game.getObjectById('563dbc2efb693e752eb6058a');
    }
    break;
  case 'W5N12':
    if(!room.memory.toLink){
      room.memory.toLink = Game.getObjectById('563d8f672c04b9ce19c2311a');
    }
    break;
  case 'W5N11':
    if(!room.memory.toLink){
      room.memory.toLink = Game.getObjectById('564384b590aed32f0ec44078');
    }
  }
}

function initializeSettings(){
  if(!Memory.settings){
    Memory.settings = {
      reportFor: ['global','','','','',''],
      reportForRoom: '',
      log: true,
      debug: false,
      explorerDestination: '',
      explorerDestinationMode: '',
      runnerFromRoom: '',
      runnerToRoom: ''
    };
  }
}