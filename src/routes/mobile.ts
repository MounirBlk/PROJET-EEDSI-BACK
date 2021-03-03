import { Application, Request, Response, NextFunction, Errback } from "express";

export default (app: Application): void => {
    app.route('/mobile').get((req: Request, res: Response) => {
        console.log(true)
    })
}