import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomDate, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';
import { roleTypes } from "../../../src/types/roleTypes";

export const registerUserTest = (role: Array<roleTypes>) => {
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
                globalThis.emailInfos = data.email;
                globalThis.passwordInfos = data.password;
                globalThis.idEntreprise = "604131c12364c74c5c5137e2";// TODO soon: automate
                return done();
            });
    };
};

export const registerUserSpec = (role: Array<roleTypes>) => {
    it('Test Register: données manquantes', (done: DoneFn) => {
        const data = {}
        request(app)
            .post('/register')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400, {
                error: true,
                message: "Une ou plusieurs données obligatoire sont manquantes"
            }, done);
    }, getTimeout());

    it('Test Register: données non-conformes', (done: DoneFn) => {
        const data = {
            email: randomChars(randNumber(5,10)),//Manque le @ et le .
            password: '123',// Format incorrecte
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
            .expect(409, {
                error: true,
                message: "Une ou plusieurs données sont erronées"
            }, done);
    }, getTimeout());

    it('Test Register: email existe deja', (done: DoneFn) => {
        const data = {
            email: globalThis.emailInfos,
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
            .expect(409, {
                error: true,
                message: "Un compte utilisant cette adresse mail est déjà enregistré"
            }, done);
    }, getTimeout());
};