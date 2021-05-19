const mongoose = require('mongoose')

const InformationSchema = mongoose.Schema({

    type: {
        type: String,
        enum: ['INFORMATION', 'BUTTON', 'SIMPLE', 'COMPLEX'],
        default: 'INFORMATION',
        require: true
    },
    name: {
        type: String,
        require: true
    },
    value: {
        type: String,
        require: true
    },
    valueType: {
        type: String,
        enum: ['STRING', 'LONG_STRING', 'DATE', 'CURRENCY', 'NUMBER', 'STATE', 'SELECT'],
        default: 'STRING',
        require: true
    },
    icon: {
        type: String,
        enum: ['WALLET', 'COIN', 'BILL', 'BANCK'],
        default: 'WALLET',
        require: true
    },
    size: {
        type: Number,
        require: true
    },
    secondaryName: {
        type: String,
        default: ""
    },
    secondaryValue: {
        type: String,
        default: ""
    },
    secondaryValueType: {
        type: String,
        enum: ['STRING', 'LONG_STRING', 'DATE', 'CURRENCY', 'NUMBER', 'STATE', 'SELECT']
    },
    buttons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Buttons'
    }]


})

module.exports = mongoose.model('Information', InformationSchema)