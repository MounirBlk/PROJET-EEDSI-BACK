import { Application, Request, Response, NextFunction, Errback } from "express";

export const commun = (app: Application): void => {
    app.route('/test').get((req: Request, res: Response) => {
        console.log(true)
    })
}