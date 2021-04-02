

module.exports = () => {
  const logs = []

  function init(){

  }

  function close(){

  }

  function log(log){
    logs.push(log)
  }

  function lastLog(){
    if(logs.length == 0){
      return null;
    }
    return logs[logs.length - 1];
  }  

  return {init, close, log, lastLog, _logs: logs}
}