const mongoose = require('mongoose')

const DashboardSchema = mongoose.Schema({

    list: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lists'
    },
    information: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Information'
    }

})

module.exports = mongoose.model('Dashboards', DashboardSchema)