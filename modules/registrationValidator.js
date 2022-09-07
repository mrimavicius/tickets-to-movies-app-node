const validator = require("email-validator")
const Watcher = require("../models/watchers");

module.exports = {
    validateRegistration: async (req, res, next) => {
        const { email, password, password2, age } = req.body
        console.log(req.body)

        if(!validator.validate(email)) return res.send({error: true, message: "wrong email"})
        if(password !== password2) return res.send({error: true, message: "passwords do not match"})
        if (await Watcher.findOne({ email }))
          return res.send({
            error: true,
            message: "this email already exists",
          });
        if(age < 0 || age > 99) return res.send({error: true, message: "wrong age"}) 

        next()
    }
} 