import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';
import UserInterface from "../../../src/interfaces/UserInterface";


export const getUsersSpec = (selectedRole: string) => {
    it('Test getUsers: token incorrect', (done: DoneFn) => { 
        request(app)
            .get('/user/all/toto')
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(498, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    /*it('Test getUsers: données manquantes', (done: DoneFn) => {
        request(app)
            .get('/user/all/')
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(400, {
                error: true,
                message: 'Le role de l\'utilisateur est manquant'
            }, done);
    }, getTimeout());*/

    it('Test getUsers: données non-conformes', (done: DoneFn) => {
        request(app)
            .get('/user/all/President')
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: 'Le role de l\'utilisateur n\'est pas conforme'
            }, done);
    }, getTimeout());

    it('Test getUsers: success', (done: DoneFn) => {
        request(app)
            .get('/user/all/'+ selectedRole)
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response: any) => {
                let roleMessage = selectedRole.trim().toLowerCase() === 'commercial' ? "commerciaux" : selectedRole.trim().toLowerCase().concat('s');
                expect(response.status).toEqual(200)
                expect(response.body).toEqual({
                    error: false,
                    message: "Les " + roleMessage + " ont bien été récupéré",
                    users: response.body.users
                })
                const userSelected: Array<UserInterface> = response.body.users.filter((user: UserInterface) => user.email === globalThis.emailInfos.toLowerCase());//email unique
                globalThis.idUser = userSelected[0]._id;//forcément que un element
                return done();
            })
            .catch(err => {
                throw err;
            })
    }, getTimeout());
}