const mongoose = require('mongoose');

const DetailSchema = mongoose.Schema({
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
    components: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Components'
        }
    ]
})

module.exports = mongoose.model('Details', DetailSchema)