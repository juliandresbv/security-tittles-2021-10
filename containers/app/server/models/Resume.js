const mongoose = require('mongoose')

const ResumeSchema = mongoose.Schema({

    lists: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lists'
        }
    ],
    information: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Information'
        }
    ]

})

module.exports = mongoose.model('Resumes', ResumeSchema)