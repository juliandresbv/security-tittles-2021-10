const mongoose = require('mongoose');

const ListSchema = mongoose.Schema({

    name:{
        type: String,
        require: true
    },
    value: {
        type: String,
        require: true
    },
    maxCapacity: {
        type: Number
    },
    columns: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Columns'
        }
    ],
    button: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Buttons'
    }

})

module.exports = mongoose.model('Lists' , ListSchema)