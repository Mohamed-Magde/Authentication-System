const express = require("express");
const app = express();
const connectDB = require("./config/db");
const path = require("path");

connectDB();

app.use(express.json({ extended: false }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/auth"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/profiles", require("./routes/profiles"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
