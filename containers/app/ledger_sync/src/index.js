const _ = require('underscore');
const todo = require('./todo');
const auth = require('./auth');

const handlers = [todo, auth];


const {
  EventFilter,  
} = require('sawtooth-sdk/protobuf');

const events = _.map(handlers, (h => {
  return {
    eventType: 'sawtooth/state-delta',
    filters: [{
      key: 'address',
      matchString: `^${h.SAWTOOTH_PREFIX}.*`,
      filterType: EventFilter.FilterType.REGEX_ANY
    }]
  }
}));

module.exports = {events, handlers};