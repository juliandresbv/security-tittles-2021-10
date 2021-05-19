const mongoose = require('mongoose')

const ColumnSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    maxLength: {
        type: Number,
    },
    atribute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Atributes'
    }
})

module.exports = mongoose.model('Columns', ColumnSchema)