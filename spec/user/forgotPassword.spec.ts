import request from "supertest"
import app from "../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomFileName } from "../helpers";

export const forgotPasswordUserSpec = () => {
    it('Test forgot password: données manquantes', (done: DoneFn) => {
        const data = {}
        request(app)
            .put('/forgot')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400, {
                error: true,
                message: "Une ou plusieurs données obligatoire sont manquantes"
            }, done);
    }, getTimeout());

    it('Test forgot password: données non-conformes', (done: DoneFn) => {
        request(app)
            .put('/forgot')
            .send(convertToFormBody({ email: randomChars(randNumber(5,10)).concat('$&+') }))
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "Une ou plusieurs données sont erronées"
            }, done);
    }, getTimeout());

    it('Test forgot password: not exist in base', (done: DoneFn) => {
        request(app)
            .put('/forgot')
            .send(convertToFormBody({ email: randomChars(4) + randomFileName() +'@gmail.com' }))
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "Votre email n'existe pas"
            }, done);
    }, getTimeout());

    it('Test forgot password: success', (done: DoneFn) => {
        request(app)
            .put('/forgot')
            .send(convertToFormBody({ email: globalThis.emailInfos }))
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, {
                error: false,
                message: "Votre mot de passe a bien été réinitialisé, veuillez consulter votre boîte mail"
            }, done);
    }, getTimeout());
};