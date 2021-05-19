const mongoose = require('mongoose')

const EndorseSchema = mongoose.Schema({
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'States',
        //require: true
    },
    rol: {
        type: String,
        enum: ['LIBRADOR', 'BENEFICIARIO'],
        default: 'LIBRADOR',
        require: true
    },
    name: {
        type: String,
        require: true
    },
    components: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Components'
        }
    ]
})

module.exports = mongoose.model('Endorses' , EndorseSchema)