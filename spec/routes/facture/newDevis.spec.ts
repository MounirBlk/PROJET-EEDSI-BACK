import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';


export const newDevisSpec = () => {
    it('Test new devis: token incorrect', (done: DoneFn) => {     
        const data = {}             
        request(app)
            .post('/devis/add')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(401, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test new devis: id non valide', (done: DoneFn) => { 
        const data = {}             
        request(app)
            .post('/devis/add')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(400, {
                error: true,
                message: 'Aucun devis n\'est sélectionné'
            }, done);
    }, getTimeout());
}