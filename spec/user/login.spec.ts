import request from "supertest"
import app from "../../app";
import { convertToFormBody, getTimeout } from "../helpers";
import fs from 'fs';

//TODELETE

/*describe('Login test by rest API', () => {
    // test permettant de tester si les variables sont bien rempli ou non
    it('Login fail email/password undefined', (done: DoneFn) => {
        const data = {
            email: '',
            password: ''
        }
        request('https://dashboardmou.herokuapp.com')
            .post('/login')
            .send(convertToFormBody(data))
            //.send('email=fdfdf&password=dfd')
            //.field("email", "dfdf@ffd")
            //.field("password", "dfdfdf")
            //.set('Authorization', `Bearer ${token}`) 
            //.auth(auth.token, { type: 'bearer' })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(403, {
                error: true,
                message: "L'email/password est manquant"
            }, done);
    }, getTimeout());

    it('get users', (done: DoneFn) => {
        request('https://dashboardmou.herokuapp.com')
            .get('/users')
            //.set('Authorization', `Bearer ${token}`) 
            .auth(bearerToken, { type: 'bearer' })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err: Error, res: any) => {
                console.log(res.body)
                return done();
            })
    }, getTimeout());
})*/