const mongoose = require('mongoose')

const StateSchema = mongoose.Schema({
    
    name: {
        type: String,
        require: true
    },
    color: {
        type: String,
        require: true
    }
})

module.exports = mongoose.model('States', StateSchema)