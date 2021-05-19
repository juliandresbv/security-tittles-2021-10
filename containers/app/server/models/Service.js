const mongoose = require('mongoose');

const ServiceSchema = mongoose.Schema({

    name: {
        type: String,
        require: true
    },
    serviceCost: {
        type: Number,
        require: true
    },
    numberUsers: {
        type: Number,
        require: true
    },
    atributes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Atributes'
        }
    ],
    states: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'States'
        }
    ],
    resume:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resumes'

    },
    dashboard:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dashboards'

    },
    details: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Details'
        }

    ],
    creates:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Creates'
        }
    ],
    endorses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Endorses'
        }
    ]


})

module.exports = mongoose.model('Services', ServiceSchema);