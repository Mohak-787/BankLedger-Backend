const mongoose = require("mongoose");

function connectDB() {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to DB successfully");
    })
    .catch(error => {
      console.log("Error connecting to the server: ", error);
      process.exit(1);
    })
}

module.exports = connectDB;