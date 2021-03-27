import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';

export const getOneUserSpec = () => {
    it('Test recuperation one: token incorrect', (done: DoneFn) => {
        request(app)
            .get('/user/one/'+ globalThis.idUser)
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(498, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test recuperation one: id invalide', (done: DoneFn) => {
        request(app)
            .get('/user/one/' + randomChars(100))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "L'id n'est pas valide !"
            }, done);
    }, getTimeout());

    it('Test recuperation one: successfull', (done: DoneFn) => {
        request(app)
            .get('/user/one/'+ globalThis.idUser)
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response: any) => {
                expect(response.status).toEqual(200)
                expect(response.body).toEqual({
                    error: false,
                    message: "Les informations ont bien été récupéré",
                    user: response.body.user
                })
                return done();
            })
            .catch(err => {
                throw err;
            })
    }, getTimeout());
}