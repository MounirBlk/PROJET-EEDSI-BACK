//const request = require('supertest');
import request from "supertest"
import { convertToFormBody, exist, getTimeout, randNumber, randomChars, randomDate, randomFileName } from "../helpers";
import app from "../../app";

export const htmlSpec = () => {
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
            .get(`/${randomChars()}${randNumber(1, 100)}`)
            .expect(404, done);
    }, getTimeout());
}
