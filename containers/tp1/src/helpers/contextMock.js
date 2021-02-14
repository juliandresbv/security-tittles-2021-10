module.exports = function(){
  
  let state = {};
  let events = []
  let receipts = []

  return {
    getState: async function(key){
      return state[key];
    },
    putState: async function(key, value){
      state[key] = value;
    },
    deleteState: async function(key){
      delete state[key];
    },
    addEvent: async function(){
      events.push([...arguments])
    },
    addReceiptData: async function(){
      events.push([...arguments])
    },
    _events: events,
    _state: state,
    _receipts: receipts
  }
}