import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';

export const getCommandesStatutSpec = () => {
    it('Test get commandes statut: token incorrect', (done: DoneFn) => {       
        request(app)
            .get('/commande/all/' + randomChars(randNumber(1,5)))
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(401, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());


    it('Test get commandes statut: statut unknown', (done: DoneFn) => {
        let statut = "unknown"
        request(app)
            .get('/commande/all/' + statut)
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "Le statut n'est pas valide !"
            }, done);
    }, getTimeout());

    it('Test get commandes statut: success', (done: DoneFn) => {
        let statut = "attente"
        request(app)
            .get('/commande/all/' + statut)
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response: any) => {
                expect(response.status).toEqual(200)
                expect(response.body).toEqual({
                    error: false,
                    message: `Les commandes liées en mode ${statut.trim().toLowerCase()} ont bien été récupéré`,
                    commandes: response.body.commandes
                })
                return done();
            })
            .catch(err => {
                throw err;
            })
    }, getTimeout());
}