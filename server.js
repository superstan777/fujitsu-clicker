require("dotenv").config();

const { runSchedule } = require("./controllers/scheduleController");

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = 2137;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);

  runSchedule();
});
