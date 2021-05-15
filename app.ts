//require('dotenv').config()
import { config } from "dotenv"; 
config(); 
import express, { Application, Request, Response, NextFunction, Errback, json } from 'express';
import cors from 'cors';
import path from 'path';
import { route } from './src/routes';
import mongooseConnect from './src/db';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import * as http from 'http'
import * as socketio from "socket.io"
import { CronJob } from "cron"

const app: Application = express();

const httpServer: http.Server = http.createServer(app);
const io = new socketio.Server(httpServer, { cors: { origin: '*' } });
app.set('socketIo', io);

// parse application/x-www-form-urlencoded
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  //res.setHeader('Content-Type', 'application/json');
  next();
});

app.use(cors());
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(express.static('public'));

app.use((err: Errback , req: Request, res: Response, next: NextFunction) => {
    if (err.name === 'UnauthorizedError') res.status(401).send('Missing authentication credentials.');
});

const limiter: rateLimit.RateLimit = rateLimit({
  windowMs: (60 * 1000) * 1, // 1 min
  max: 300 //limit for each IP with 300 requests per windowMs
});

app.use(limiter);

app.set("port", process.env.PORT || 3000);

route(app);

//initUpload();
mongooseConnect(app, httpServer, io);

app.get('*', (req: Request, res: Response) => {
  res.status(404).sendFile(path.join(__dirname + '/public/error.html'))
});

export default app; //export to call app to test spec