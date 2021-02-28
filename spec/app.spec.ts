import request from "supertest"
import app from "../app";
import { convertToFormBody, exist, getTimeout, randNumber, randomChars, randomDate, randomFileName } from "./helpers";
import fs from 'fs';
import path from 'path';
import { htmlSpec } from "./user/html.spec";
import { deleteUserSpec } from "./user/deleteUser.spec";
import { loginUserSpec } from "./user/login.spec";
import { registerUserSpec } from "./user/register.spec";
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
            dateNaissance: randomDate(),
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
            .end((err: any, res: any) => {
                if (err) throw err;
                !fs.existsSync(process.cwd() + '/logs') ? fs.mkdirSync(process.cwd() + '/logs') : null;
                fs.writeFileSync(process.cwd() + '/logs/emailTest.txt', data.email)
                fs.writeFileSync(process.cwd() + '/logs/passwordTest.txt', data.password)
                return done();
            });
    };
};

const loginUser = () => {
    return (done: DoneFn) => {
        request(app)
            .post('/login')
            .send(convertToFormBody({
                email: fs.readFileSync(process.cwd() + '/logs/emailTest.txt', "utf-8"),
                password: fs.readFileSync(process.cwd() + '/logs/passwordTest.txt', "utf-8")
            }))
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response: any) => {
                expect(response.status).toEqual(200)
                expect(response.body).toEqual({
                    error: false,
                    message: "L'utilisateur a été authentifié avec succès",
                    token: response.body.token
                })
                const token: string = response.body.token;
                fs.writeFileSync(process.cwd() + '/logs/bearerToken.txt', token)
                return done();
            })
            .catch(err => {
                throw err;
            })
    };
};

const deleteUser = () => {
    return (done: DoneFn) => {
        const token = fs.readFileSync(process.cwd() + '/logs/bearerToken.txt', "utf-8");
        request(app)//app
        .delete('/user')
        .set('Accept', 'application/json')
        //.set('Authorization', `Bearer ${token}`) //fonctionne aussi normalement
        .auth(token, { type: 'bearer' })
        .expect('Content-Type', /json/)
        .expect(200, {
            error: false,
            message: 'L\'utilisateur a été supprimé avec succès'
        })
        .end((err: any, res: any) => {
            if (err) throw err;
            fs.existsSync(process.cwd() + '/logs') ? fs.rmdirSync(process.cwd() + '/logs', { recursive: true }) : null;
            return done();
        });
    };
};

describe('TEST API E-COMMERCE', () => {
    beforeAll(registerUser(), getTimeout(120));// Before all tests of specs (register)
    beforeAll(loginUser(), getTimeout(120));// Before all tests of specs (login)
    //beforeEach(() => console.log(__dirname));
    //afterEach(() => console.log('Test passed'))

    htmlSpec()
    deleteUserSpec()
    registerUserSpec()
    loginUserSpec()

    //afterAll(deleteUser(), getTimeout(60));// After all tests of specs
})
