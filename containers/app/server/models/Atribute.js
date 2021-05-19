const mongoose = require('mongoose');

const AtributeSchema = mongoose.Schema({

    name: {
        type: String,
        require: true
    },
    value: {
        type: String,
        require: true
    },
    type: {
        type: String,
        enum: ['STRING', 'LONG_STRING', 'DATE', 'CURRENCY', 'NUMBER', 'STATE', 'SELECT'],
        default: 'STRING',
        require: true
    }

})


module.exports = mongoose.model('Atributes', AtributeSchema);