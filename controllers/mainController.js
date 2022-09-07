const Watcher = require("../models/watchers");
const bcrypt = require("bcrypt");

module.exports = {
  create_user: async (req, res) => {
    const { email, password, age } = req.body

    const userPass = password
    const hash = await bcrypt.hash(userPass, 10)

    const newUser = new Watcher({
      email,
      password: hash,
      age,
    });

    await newUser.save()

    res.send({error: false, message: "user created", data: null})
    
  },
  log_user: async (req, res) => {
    const { email, password } = req.body;
    const user = await Watcher.findOne({ email });

    if (user) {
        const compare = await bcrypt.compare(password, user.password);

        if (compare) {
          const newUser = {
            email: user.email,
            money: user.money,
            age: user.age
          }
        return res.send({ error: false, message: "logging you in", data: newUser });
        }

        return res.send({ error: true, message: "wrong password" });
    }

    return res.send({ error: true, message: "user not found" });

  },
};
