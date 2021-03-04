import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomDate, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';


export const getEntreprisesSpec = () => {
    it('Test get Entreprises: token incorrect', (done: DoneFn) => {       
        request(app)
            .get('/entreprises')
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(498, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    /*it('Test get Entreprises: successfull', (done: DoneFn) => {
        request(app)
            .get('/entreprises')
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response: any) => {
                expect(response.status).toEqual(200)
                expect(response.body).toEqual({
                    error: false,
                    message: "Les entreprises ont bien été récupéré",
                    entreprises: response.body.entreprises
                })
                return done();
            })
            .catch(err => {
                throw err;
            })
    }, getTimeout());*/
}