import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomDate } from "../../helpers";

export const updateUserSpec = () => {
    it('Test update: token incorrect', (done: DoneFn) => {
        request(app)
            .put('/user')
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(498, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test update: données manquantes', (done: DoneFn) => {
        const data = {}
        request(app)
            .put('/user')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(400, {
                error: true,
                message: "Une ou plusieurs données obligatoire sont manquantes"
            }, done);
    }, getTimeout());

    it('Test update: données non-conformes', (done: DoneFn) => {
        const data = {
            firstname: randomChars(randNumber(5,10)).concat('$&+'),//non-conforme
            lastname: randomChars(randNumber(5,10)).concat('$&+'),//non-conforme
            civilite: randNumber(0,1) === 0 ? "Homme" : "Femme",
            dateNaissance: randomDate(),
            portable: "$".repeat(randNumber(35,50)),//non-conforme taille entre 1-30
        }        
        request(app)
            .put('/user')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "Une ou plusieurs données sont erronées"
            }, done);
    }, getTimeout());

    it('Test update: success', (done: DoneFn) => {
        const data = {
            firstname: randomChars(randNumber(5,10)),
            lastname: randomChars(randNumber(5,10)),
            civilite: randNumber(0,1) === 0 ? "Homme" : "Femme",
            dateNaissance: randomDate(),
            //portable: '0651637929',
        }        
        request(app)
            .put('/user')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200, {
                error: false,
                message: "L'utilisateur a bien été mise à jour"
            }, done);
    }, getTimeout());
}
