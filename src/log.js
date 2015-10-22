function log(message, classification){
  var reportFor = flagReports('CR');

  var creepReport = (reportFor.indexOf('global') > -1 );

  switch(classification){
  case 'creep':
    if(creepReport){
      console.log('[creep] ' + message);
    }
    break;
  default:
    console.log('[' + classification + '] ' + message);
  }
}
