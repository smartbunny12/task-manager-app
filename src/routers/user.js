const express = require('express')
const User = require('../models/user')
const sharp = require('sharp')
const auth = require('../middleware/auth')
const router = new express.Router()
const multer = require('multer')
const { sendWelcomeEmail } = require('../email/account')

// await can only be used in async
// for sign up
router.post('/user', async (req, res) => {
    const user = new User(req.body)
    
    try {
        await user.save() // only run when success
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
    
    // user.save().then(() => {
    //     res.status(201).send(user)
    // }).catch((e) => {
    //     res.status(400).send(e)
    // })
})


// use email and password to login
router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        // generate a token for a specific user
        const token = await user.generateAuthToken()

        // call JSON.stringify() in res.send()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})


router.post('/user/logout', auth, async (req, res) => {
    try {
        // filter out the valid tokens that is not equals to req.token
        // dif devices may have dif tokens
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })

        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// log out all the sessions
router.post('/user/logoutAll', auth, async (req, res) => {
    try {
        // filter out the valid tokens that is not equals to req.token
        // dif devices may have dif tokens
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// get the user with auth
router.get('/user/me', auth, async (req, res) => {
  res.send(req.user)
})

//get one user by id
router.get('/user/:id', async (req, res) => {
    const _id = req.params.id 

    try {
        const user = await User.findById(_id)

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(500).send()
    }

    // User.findById(_id).then((user) => {
    //     if (!user) {
    //         return res.status(404).send()
    //     }

    //     res.send(user)
    // }).catch((e) => {
    //     res.status(500).send()
    // })

    // console.log(req.params)
})

// update user that logged in
router.patch('/user/me', auth, async (req, res) => {
    //cannot update invalid feature
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if (!isValidOperation){
        return res.status(404).send({ error: 'Invalid update!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
 
        res.send(req.user)
    } catch (e) {
        // connection issue and validation issue
        res.status(400).send(e)
    }
})

// delete your account, and will delete all the tasks accordingly(in models/user )
router.delete('/user/me', auth, async (req, res) => {
    try {
        // remove method on mongoose document
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})  

const upload = multer({
    //dest: 'avatars', //save to avatar folder
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb ){
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }
        cb(undefined, true)
    }
})

// const errorMiddleware = (req, res, next) => {
//     throw new Error('From my middleware')
//}
router.post('/user/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    // handle when do have dest set up
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})


router.delete('/user/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/user/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error('')
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)

    } catch (e) {
        res.status(404).send()
    }
})


module.exports = router