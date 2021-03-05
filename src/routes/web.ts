import { Application, Request, Response, NextFunction, Errback } from "express";

export default (app: Application): void => {
    app.route('/web').get((req: Request, res: Response) => {
        console.log(true)
    })
}