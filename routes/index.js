const express = require('express')
let router = express.Router()
const mode = 'API'

const FileSystemOperator = require('../functions/FsOperator')
let fsOperator = new FileSystemOperator('public/content')

//resolves any url
router.get('/*', function (req, res) {
    console.log(req.params[0])
    try {
        // gets new data
        fsOperator.newRequest(req.params[0])
        if (mode === 'API') {
            // sends data
            res.send(fsOperator.data)
        } else if (mode === 'site') {
            // renders data
            res.render('folder', fsOperator.data)
        }
    } catch (e) {
        // sends error
        res.send(e)
    }
})

module.exports = router