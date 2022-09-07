const express = require("express");
const router = express.Router();

const { create_user, log_user } = require("../controllers/mainController");
const { validateRegistration } = require("../modules/registrationValidator")

router.post("/create_user", validateRegistration, create_user);
router.post("/log_user", log_user);

module.exports = router;
