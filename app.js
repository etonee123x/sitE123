let express = require('express')
let path = require('path')
let cookieParser = require('cookie-parser')
let logger = require('morgan')
let c = require('colors')

let indexRouter = require('./routes/index')

let app = express()
app.set('view engine', 'pug')
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
module.exports = app
