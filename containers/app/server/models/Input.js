const mongoose = require('mongoose');

const InputSchema = mongoose.Schema({

    name: {
        type: String,
        require: true
    },
    placeholder: {
        type: String,
        require: true
    },
    size: {
        type: Number,
        require: true
    },
    default: {
        type: String
    },
    maxLength: {
        type: Number,
        require: true
    },
    inputType: {
        type: String,
        enum: ['STRING', 'LONG_STRING', 'DATE', 'CURRENCY', 'NUMBER', 'STATE', 'SELECT', 'SIGN'],
        default: 'STRING',
        require: true
    },
    atribute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Atributes'
    }

})

module.exports = mongoose.model('Inputs', InputSchema)