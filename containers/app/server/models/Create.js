const mongoose = require('mongoose')

const CreateSchema = mongoose.Schema({

    name: {
        type: String,
        require: true
    },
    rol: {
        type: String,
        enum: ['LIBRADOR', 'BENEFICIARIO'],
        default: 'LIBRADOR',
        require: true
    },
    information: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Information'
        }
    ],
    components: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Components'
        }
    ]


})

module.exports = mongoose.model('Creates', CreateSchema)