import express from 'express'
import { DankBot } from './src/bot'
import dotenv from 'dotenv'

dotenv.config();

const PORT = process.env.PORT || 5000;

let app = express();

app.listen(PORT, () => {
    console.log("Listening on " + PORT);

    new DankBot();
});