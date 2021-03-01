import request from "supertest"
import app from "../../app";
import { getTimeout, randomChars } from "../helpers";

export const disableUserSpec = () => {
    it('Test disable: token incorrect', (done: DoneFn) => {
        request(app)
            .put('/disable')
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(498, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test disable: success', (done: DoneFn) => {
        request(app)
            .put('/disable')
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200, {
                error: false,
                message: "L'utilisateur a bien été désactivé",
                actif: false
            }, done);
    }, getTimeout());
};