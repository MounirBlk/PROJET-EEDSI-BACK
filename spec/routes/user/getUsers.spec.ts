import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomDate, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';
import { roleTypes } from "../../../src/types/roleTypes";


export const getUsersSpec = (role: Array<roleTypes>) => {
    it('Test getUsers: token incorrect', (done: DoneFn) => { 
        const data = {}
        request(app)
            .get('/users')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(498, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test getUsers: données manquantes', (done: DoneFn) => {
        const data = {}
        request(app)
            .get('/users')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(400, {
                error: true,
                message: 'Le role de l\'utilisateur est manquant'
            }, done);
    }, getTimeout());

    it('Test getUsers: données non-conformes', (done: DoneFn) => {
        const data = {
            role: "President"// n'existe pas
        }
        request(app)
            .get('/users')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: 'Le role de l\'utilisateur n\'est pas conforme'
            }, done);
    }, getTimeout());

    it('Test getUsers: success', (done: DoneFn) => {
        let selectedRole = role[randNumber(0, (role.length - 1))];
        request(app)
            .get('/users')
            .send(convertToFormBody({
                role: selectedRole
            }))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response: any) => {
                expect(response.status).toEqual(200)
                expect(response.body).toEqual({
                    error: false,
                    message: "Les " + selectedRole.trim().toLowerCase().concat('s') + " ont bien été récupéré",
                    users: response.body.users
                })
                return done();
            })
            .catch(err => {
                throw err;
            })
    }, getTimeout());
}