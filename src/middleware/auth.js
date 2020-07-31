const jwt = require('jsonwebtoken')
const User = require('../models/user')

//middleware function: new request -> do something (call next) -> run router handler
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '') // if no token provided, go into catch
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) {
            throw new Error() // trigger catch block
        }

        req.token = token
        req.user = user
        next()
        
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.'})
    }
}

module.exports = auth