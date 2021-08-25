const express = require('express')
let router = express.Router()
const mode = 'API'

const FileSystemOperator = require('../functions/FsOperator')
let fsOperator = new FileSystemOperator('public/content')

router.get('/*', function (req, res) {
    try {
        fsOperator.NewRequest(req.params[0])
        if (mode === 'API') {
            res.send(fsOperator.data)
        } else if (mode === 'site') {
            res.render('folder', fsOperator.data)
        }
    } catch (e) {
        res.send(e)
    }
})

module.exports = router