import 'dotenv/config'

import cors from 'cors'
import path from 'path'
import mongoose from 'mongoose'
import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import { rateLimit } from 'express-rate-limit'
import express, { json, urlencoded } from 'express'

import serveStatic from './middlewares/serverStatic'
import errorHandler from './middlewares/error-handler'

import routes from './routes'

import { DB_ADDRESS, ORIGIN_ALLOW } from './config'

const { PORT = 3000 } = process.env
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false
})
const app = express()

app.use(cookieParser())

app.use(limiter)

app.use(cors({ origin: ORIGIN_ALLOW, credentials: true }));
// app.use(express.static(path.join(__dirname, 'public')));

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: true }))
app.use(json({ limit: '200kb' }))

//app.options('*', cors())
app.use(routes)
app.use(errors())
app.use(errorHandler)

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
