declare global {
    var bearerToken: string;
}
import request from "supertest"
import app from "../app";
import { convertToFormBody, getTimeout, randomChars } from "./helpers";
import fs from 'fs';
//const request = require('supertest');

const loginUser = (email: string = "testing@gmail.com", password: string ="testing") => {
    return (done: DoneFn) => {
        //console.log('START')
        request('https://dashboardmou.herokuapp.com')//app
            .post('/login')
            .send(convertToFormBody({
                email: email,
                password: password
            }))
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(201, {
                error: false,
                message: "L'utilisateur a été authentifié succès"
            })
            .end((err: Error, res: any) => {
                !fs.existsSync('./logs') ? fs.mkdirSync('./logs') : null;
                const token: string = res.body.token;
                globalThis.bearerToken = token;
                return done();
            });
    };
};

const endTests = () => {
    return (done: DoneFn) => {
        fs.rmdirSync('./logs/', { recursive: true });
        //console.log("END")
        return done();
    };
};

describe('init beforeAll and afterAll / test index.html and error.html', () => {
    beforeAll(loginUser(), getTimeout(120));// Before all tests of specs

    it('Test index.html', (done: DoneFn) => {
        request(app)
            .get('/')
            .expect(200, done);
    }, getTimeout());

    it('Test index.html', (done: DoneFn) => {
        request(app)
            .get('')
            .expect(200, done);
    }, getTimeout());

    it('Test error.html', (done: DoneFn) => {
        request(app)
            .get(`/${randomChars()}`)
            .expect(404, done);
    }, getTimeout());

    afterAll(endTests(), getTimeout(60));// After all tests of specs
})
