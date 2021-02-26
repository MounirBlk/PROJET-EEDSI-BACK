require('dotenv').config()
import express, { Application, Request, Response, NextFunction, Errback } from 'express';
import bodyParser, { json } from 'body-parser';
import cors from 'cors';
import path from 'path';
import { route } from './src/routes';

const app: Application = express();
//app.use(json)

// parse application/x-www-form-urlencoded
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  //res.setHeader('Content-Type', 'application/json');
  next();
});

app.use(express.json());
app.use(express.static('public'));

app.use(cors());

app.use(bodyParser.urlencoded({
    extended: false
}))

app.use((err: Errback , req: Request, res: Response, next: NextFunction) => {
    if (err.name === 'UnauthorizedError')
        res.status(401).send('Missing authentication credentials.');
});

app.set("port", process.env.PORT || 3000);

route(app);

app.get('*', (req: Request, res: Response) => {
  res.status(404).sendFile(path.join(__dirname + '/../public/error.html'))
});

app.listen(app.get("port"), () => {
    console.log("App is running on http://localhost:%d", app.get("port"));
});

export default app; //export to call app to test spec