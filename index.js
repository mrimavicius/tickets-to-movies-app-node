const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const mainRouter = require("./routes/mainRouter");
const Watcher = require("./models/watchers");
require("dotenv").config()
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const movies = [
  {
    title: "Prey",
    img: "https://image.tmdb.org/t/p/w1280/ujr5pztc1oitbe7ViMUOilFaJ7s.jpg",
    seatsLeft: 30,
    pg: 18,
    seats: generateSeats(),
  },
  {
    title: "Thor: Love and Thunder",
    img: "https://image.tmdb.org/t/p/w1280/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg",
    pg: 13,
    seatsLeft: 30,
    seats: generateSeats(),
  },
  {
    title: "Top Gun: Maverick",
    img: "https://image.tmdb.org/t/p/w1280/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    pg: 16,
    seatsLeft: 30,
    seats: generateSeats(),
  },
  {
    title: "Samaritan",
    img: "https://image.tmdb.org/t/p/w1280/vwq5iboxYoaSpOmEQrhq9tHicq7.jpg",
    pg: 16,
    seatsLeft: 30,
    seats: generateSeats(),
  },
  {
    title: "DC League of Super-Pets",
    img: "https://image.tmdb.org/t/p/w1280/r7XifzvtezNt31ypvsmb6Oqxw49.jpg",
    pg: 8,
    seatsLeft: 30,
    seats: generateSeats(),
  },
];

function generateSeats(){
  const seats = []
  
  for(let i = 0; i < 30; i++){
    seats.push({
      available: true,
      index: i
    })
  }

  return seats
}

io.on("connection", (socket) => {
  socket.on("request-movies", () => {
    socket.emit("send-movies", movies)
  })

  socket.on("request-seats", title => {
    const findByTitle = movies.find((x) => x.title === title);
    socket.emit("send-seats", findByTitle.seats);
  })

  socket.on("buy-tickets", async data => {
    const findIndexByTitle = movies.findIndex((x) => x.title === data.movie);

    if(movies[findIndexByTitle].pg > data.user.age) {
      error = "you are too young for this movie"
      return socket.emit("error", error)
    }

    if(data.total > data.user.money) {
      error = "not enough money"
      return socket.emit("error", error)
    }

    movies[findIndexByTitle].seatsLeft -= data.seatsSelected.length;

    for(let i = 0; i < data.seatsSelected.length; i++){
      let num = data.seatsSelected[i];

      if(movies[findIndexByTitle].seats[num].index === num) movies[findIndexByTitle].seats[num].available = false
    }

    const newMoney = (data.user.money - data.total).toFixed(2)

    const user = await Watcher.findOneAndUpdate(
      { email: data.user.email },
      { $set: { money: newMoney } },
      { new: true }
    );
    io.emit("update-movies", movies);
    socket.emit("update-user", user)

    let success = "you have successufully bought the tickets"
    socket.emit("success", success)
  })

  socket.on("disconnect", () => {});
});

server.listen(4000, () => {
  console.log("SERVER RUNNING");
});

app.use(express.json());
app.use("/", mainRouter);

// MongoDB connection

const URI = process.env.MONGO_KEY

const connectDB = async () => {
    try {
        await mongoose.connect(URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        })
        console.log("MongoDB connected")
    } catch (err) {
        console.log("Failed to connect to MongoDB", err)
    }
}

connectDB()