const express = require('express')
require('./db/mongoose')
const User = require('./models/user')
const Task = require('./models/task')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT


const multer = require('multer')
const upload = multer({
    dest: 'images',
    limits: {
        fileSize: 1000000 //1 megabytes
    },
    fileFilter(req, file, cb) {
        //!file.originalname.endsWith('.pdf')
        if (!file.originalname.match(/\.(doc|docx)$/)){
            return cb(new Error('File must be a word doc'))
        }
        cb(undefined, true)
        
    }
})
app.post('/upload', upload.single('upload'), (req, res) => {
    res.send()
})


app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(port, () => {
    console.log('Sever is up on port ' + port)
})


