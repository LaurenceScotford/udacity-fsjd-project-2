import express, { Request, Response } from 'express'

const app: express.Application = express()
const address: string = "127.0.0.1:3000"

app.get('/', function (req: Request, res: Response) {
    res.send('Hello World!')
})

app.listen(3000, function () {
    console.log(`starting app on: ${address}`)
})
