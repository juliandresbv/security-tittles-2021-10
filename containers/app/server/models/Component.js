const mongoose = require('mongoose')

const ComponentSchema = mongoose.Schema({

    type: {
        type: String,
        enum: ['ATRIBUTES', 'LIST', 'INPUT', 'BUTTON'],
        default: 'ATRIBUTES',
        require: true
    },
    name: {
        type: String,
        require: true
    },
    message: {
        type: String
    },
    buttons: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Buttons'
        }
    ],
    atributes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Atributes'
        }
    ],
    inputs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Inputs'
        }
    ],
    list: {
        type: mongoose.Schema.Types.ObjectId,
        require: false,
        ref: 'Lists'
    }

})

module.exports = mongoose.model('Components', ComponentSchema)