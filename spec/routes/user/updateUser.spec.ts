import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomDateEn } from "../../helpers";

export const updateUserSpec = () => {
    it('Test update: token incorrect', (done: DoneFn) => {
        request(app)
            .put('/user/update/' + globalThis.idUser)
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(401, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test update: id invalide', (done: DoneFn) => {
        request(app)
            .put('/user/update/' + randomChars(100))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "L'id n'est pas valide !"
            }, done);
    }, getTimeout());

    it('Test update: données à jour', (done: DoneFn) => {
        const data = {}
        request(app)
            .put('/user/update/' + globalThis.idUser)
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200, {
                error: false,
                message: "Vos données sont déjà à jour"
            }, done);
    }, getTimeout());

    it('Test update: données non-conformes', (done: DoneFn) => {
        const data = {
            firstname: randomChars(randNumber(5,10)).concat('$&+'),//non-conforme
            lastname: randomChars(randNumber(5,10)).concat('$&+'),//non-conforme
            civilite: randNumber(0,1) === 0 ? "Homme" : "Femme",
            dateNaissance: randomDateEn(),
            portable: "$".repeat(randNumber(35,50)),//non-conforme taille entre 1-30
        }        
        request(app)
            .put('/user/update/' + globalThis.idUser)
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
            dateNaissance: randomDateEn(),
            //portable: '0651637929',
        }        
        request(app)
            .put('/user/update/' + globalThis.idUser)
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response: any) => {
                expect(response.status).toEqual(200)
                expect(response.body).toEqual({
                    error: false,
                    message: "L'utilisateur a bien été mis à jour",
                    user: response.body.user
                })
                return done();
            })
            .catch(err => {
                throw err;
            })
    }, getTimeout());
}
