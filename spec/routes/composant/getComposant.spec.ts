import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';

export const getComposantSpec = () => {
    /*it('Test get Composant: token incorrect', (done: DoneFn) => {       
        request(app)
            .get('/composant/one/' + randomChars(randNumber(1,5)))
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(401, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout()); */

    it('Test get Composant: id non valide', (done: DoneFn) => { 
        request(app)
            .get('/composant/one/' + randomChars(randNumber(1,5)))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "L'id n'est pas valide !"
            }, done);
    }, getTimeout());

    /*it('Test get Composant: success', (done: DoneFn) => {
        request(app)
            .get('/composant/one/' + globalThis.idComposant)
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response: any) => {
                expect(response.status).toEqual(200)
                expect(response.body).toEqual({
                    error: false,
                    message: "Les informations du composant ont bien été récupéré",
                    composant: response.body.composant
                })
                return done();
            })
            .catch(err => {
                throw err;
            })
    }, getTimeout());*/
}