import request from "supertest"
import app from "../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomFileName } from "../helpers";
import fs from 'fs';

describe('Test Register by rest API', () => {
    const role = ["Administrateur", "Commercial", "Livreur", "Client"]
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
            dateNaissance: '17/05/1998',
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
            email: 'mou95500@gmail.com',
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
            .expect(409, {
                error: true,
                message: "Un compte utilisant cette adresse mail est déjà enregistré"
            }, done);
    }, getTimeout());

    it('Test Register: register succesfull', (done: DoneFn) => {
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
            }, done);
    }, getTimeout());
})