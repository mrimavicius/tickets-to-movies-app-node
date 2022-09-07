const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const watchersSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    money: {
        type: Number,
        required: false,
        default: 100
    }
  },
  { timestamps: true }
);

const Watcher = mongoose.model("Watcher", watchersSchema);

module.exports = Watcher;
