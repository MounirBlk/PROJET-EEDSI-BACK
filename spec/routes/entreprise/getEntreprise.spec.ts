import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';


export const getEntrepriseSpec = () => {
    it('Test get Entreprise: token incorrect', (done: DoneFn) => {       
        request(app)
            .get('/entreprise/' + globalThis.idEntreprise)
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(498, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test get Entreprise: id non valide', (done: DoneFn) => { 
        request(app)
            .get('/entreprise/' + globalThis.idEntreprise + randomChars(randNumber(1,5)))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "L'id n'est pas valide !"
            }, done);
    }, getTimeout());

    it('Test get Entreprise: success', (done: DoneFn) => {
        request(app)
            .get('/entreprise/' + globalThis.idEntreprise)
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response: any) => {
                expect(response.status).toEqual(200)
                expect(response.body).toEqual({
                    error: false,
                    message: "Les informations de l'entreprise ont bien été récupéré",
                    entreprise: response.body.entreprise
                })
                return done();
            })
            .catch(err => {
                throw err;
            })
    }, getTimeout());
}