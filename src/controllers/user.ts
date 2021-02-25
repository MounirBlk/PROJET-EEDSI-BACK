import { Application, Request, Response, NextFunction, Errback } from 'express';
import { dataResponse } from '../middlewares';

/**
 *  Route login user
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const login = async (req: Request, res: Response): Promise<void> => {
    const data = req.body;
    //TO DO
    return dataResponse(res, 200, { error: false, message: 'ok'});
}