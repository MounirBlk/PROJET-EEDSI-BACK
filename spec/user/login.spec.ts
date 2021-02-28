import request from "supertest"
import app from "../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomFileName } from "../helpers";
import fs from 'fs';
const async = require("async");

describe('Test login user by rest API', () => {
    it('Test login: données manquantes', (done: DoneFn) => {
        const data = {}
        request(app)
            .post('/login')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400, {
                error: true,
                message: "Une ou plusieurs données obligatoire sont manquantes"
            }, done);
    }, getTimeout());

    it('Test login: données non-conformes', (done: DoneFn) => {
        const data = {
            email: randomChars(randNumber(5,10)),//Manque le @ et le .
            password: '123',// Format incorrecte
        }
        request(app)
            .post('/login')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: 'Email/password incorrect'
            }, done);
    }, getTimeout());

    it('Test login: email not exist in base', (done: DoneFn) => {
        const data = {
            email: randomChars(4) + randomFileName() +'@gmail.com',
            password: randomChars(randNumber(5,10)).concat('*') + randNumber(1,100),
        }
        request(app)
            .post('/login')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: 'Email/password incorrect'
            }, done);
    }, getTimeout());

    const emailTest = fs.readFileSync(process.cwd() + '/logs/emailTest.txt', "utf-8");
    for (let i = 0; i < 10; i++) {
        it('Test login: mot de passe incorrect && trop de tentative sur l\'email', (done: DoneFn) => {
            const data = {
                email: emailTest,
                password: randomChars(randNumber(5,10)).concat('!') + randNumber(1,100),
            }
            request(app)
                .post('/login')
                .send(convertToFormBody(data))
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(i < 5 ? 409 : 429, {
                    error: true,
                    message: i < 5 ? 'Email/password incorrect' : "Trop de tentative sur l'email " + emailTest + " (5 max) - Veuillez patienter (2mins)"
                }, done);
        }, getTimeout());
    }
});