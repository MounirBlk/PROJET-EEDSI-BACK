import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomDate, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';


export const getUsersSpec = () => {
    it('Test get getUsers: token incorrect', (done: DoneFn) => { 
        request(app)
            .get('/users')
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(498, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test get getUsers: success', (done: DoneFn) => {
        request(app)
            .get('/users')
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response: any) => {
                expect(response.status).toEqual(200)
                expect(response.body).toEqual({
                    error: false,
                    message: "Les utilisateurs ont bien été récupéré",
                    users: response.body.users
                })
                return done();
            })
            .catch(err => {
                throw err;
            })
    }, getTimeout());
}