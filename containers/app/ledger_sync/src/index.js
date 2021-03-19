const _ = require('underscore');
const mongo = require('./mongodb/mongo');
const todo = require('./todo');
const auth = require('./auth');

const sawtoothHelper = require('./sawtooth/sawtooth-helpers');

const hand = [todo, auth];


const {
  EventFilter,  
} = require('sawtooth-sdk/protobuf');

/*
'sawtooth/state-delta' must be used with 'sawtooth/block-commit'
*/
const events = _.map(hand, (h => {
  return {
    eventType: 'sawtooth/state-delta',
    filters: [{
      key: 'address',
      matchString: `^${h.SAWTOOTH_PREFIX}.*`,
      filterType: EventFilter.FilterType.REGEX_ANY
    }]
  }
}));


module.exports = {events, hand };