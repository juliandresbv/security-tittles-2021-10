require('dotenv').config()

const {subscribeToSawtoothEvents} = require('./src/sawtooth/sawtooth-helpers');

subscribeToSawtoothEvents()