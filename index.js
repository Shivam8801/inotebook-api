import connectToMongo from "./db.js";
import express from "express";
import authRouter from "./routes/auth.js"
import notesRouter from "./routes/notes.js"
import dotenv from "dotenv"
import cors from "cors";
dotenv.config();

connectToMongo();

const app = express()


app.use(express.json())
app.use(cors())

const port = process.env.PORT


// available routes
app.use('/api/auth', authRouter)
app.use('/api/notes', notesRouter)


app.get('/', function (req, res) {
  res.send('Hello Shivam')
})

app.listen(port, () => {
  console.log(`Server started at port ${port}!`)
})
