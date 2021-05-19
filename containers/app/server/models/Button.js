const mongoose = require('mongoose')

const ButtonSchema = mongoose.Schema({

    value:{
        type: String,
        require: true
    },
    type:{
        type: String,
        enum: ['ORANGE', 'BLUE', 'GREY'],
        default: 'ORANGE',
        require: true
    },
    action:{
        type: String,
        require: true
    },
    service: {
        type: String
    }

})

module.exports = mongoose.model('Buttons', ButtonSchema)