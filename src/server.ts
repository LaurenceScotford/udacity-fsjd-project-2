import dotenv from 'dotenv';
import express, { Request, Response } from 'express'

dotenv.config();

const {
    API_HOST,
    API_PORT,
} = process.env;

const app: express.Application = express()

const address = `${API_HOST}:${API_PORT}`;

app.get('/', function (req: Request, res: Response) {
    res.send('Hello World!')
})

app.listen(API_PORT, function () {
    console.log(`starting app on: ${address}`)
})
