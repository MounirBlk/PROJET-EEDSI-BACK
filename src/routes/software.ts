import { Application, Request, Response, NextFunction, Errback } from "express";

export const software = (app: Application): void => {
    app.route('/software').get((req: Request, res: Response) => {
        console.log(true)
    })
}