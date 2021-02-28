import request from "supertest"
import app from "../app";
import { convertToFormBody, exist, getTimeout, randNumber, randomChars, randomFileName } from "./helpers";
import fs from 'fs';
import path from 'path';
//const request = require('supertest');

const role = ["Administrateur", "Commercial", "Livreur", "Client"]

const registerUser = () => {
    return (done: DoneFn) => {
        const data = {
            email: randomChars(4) + randomFileName() +'@gmail.com',
            password: randomChars(randNumber(5,10)).concat('*') + randNumber(1,100),
            firstname: randomChars(randNumber(5,10)),
            lastname: randomChars(randNumber(5,10)),
            civilite: randNumber(0,1) === 0 ? "Homme" : "Femme",
            dateNaissance: '17/05/1998',
            portable: '0651637929',
            role: role[randNumber(0,3)] 
        }        
        request(app)
            .post('/register')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(201, {
                error: false,
                message: "L'utilisateur a bien été créé avec succès"
            })
            .end((err: Error, res: any) => {
                !fs.existsSync(process.cwd() + '/logs') ? fs.mkdirSync(process.cwd() + '/logs') : null;
                fs.writeFileSync(process.cwd() + '/logs/emailTest.txt', data.email)
                fs.writeFileSync(process.cwd() + '/logs/passwordTest.txt', data.password)
                return done();
            });
    };
};

const loginUser = () => {
    return (done: DoneFn) => {
        request(app)//app
            .post('/login')
            .send(convertToFormBody({
                email: fs.readFileSync(process.cwd() + '/logs/emailTest.txt', "utf-8"),
                password: fs.readFileSync(process.cwd() + '/logs/passwordTest.txt', "utf-8")
            }))
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(201, {
                error: false,
                message: "L'utilisateur a été authentifié succès"
            })
            .end((err: Error, res: any) => {
                const token: string = res.body.token;
                fs.writeFileSync(process.cwd() + '/logs/bearerToken.txt', token)
                return done();
            });
    };
};

const deleteUser = () => {
    return (done: DoneFn) => {
        const token = fs.readFileSync(process.cwd() + '/logs/bearerToken.txt', "utf-8");
        request(app)//app
        .delete('/user')
        .set('Accept', 'application/json')
        //.set('Authorization', `Bearer ${token}`) 
        .auth(token, { type: 'bearer' })
        .expect('Content-Type', /json/)
        .expect(200, {
            error: false,
            message: 'L\'utilisateur a été supprimé avec succès'
        })
        .end((err: Error, res: any) => {
            return done();
        });
    };
};

describe('init beforeAll and afterAll / test index.html and error.html', () => {
    beforeAll(registerUser(), getTimeout(120));// Before all tests of specs (register)
    beforeAll(loginUser(), getTimeout(120));// Before all tests of specs (login)

    //beforeEach(() => console.log(__dirname));
    //afterEach(() => console.log('Test passed'))

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

    afterAll(deleteUser(), getTimeout(60));// After all tests of specs
})
