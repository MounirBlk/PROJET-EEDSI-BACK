import request from "supertest"
import app from "../../../app";
import { getTimeout, randomChars } from "../../helpers";

export const disableUserSpec = () => {
    it('Test disable: token incorrect', (done: DoneFn) => {
        request(app)
            .put('/user/disable/' + globalThis.idUser)
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(498, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test disable: id invalide', (done: DoneFn) => {
        request(app)
            .put('/user/disable/' + randomChars(100))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "L'id n'est pas valide !"
            }, done);
    }, getTimeout());

    it('Test disable: success', (done: DoneFn) => {
        request(app)
            .put('/user/disable/' + globalThis.idUser)
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200, {
                error: false,
                message: "L'utilisateur a bien été désactivé",
                disabled: true
            }, done);
    }, getTimeout());
};