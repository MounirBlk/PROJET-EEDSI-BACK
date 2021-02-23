import request from "supertest"
//const request = require('supertest');

describe('Login test by rest API', () => {
    // test permettant de tester si les variables sont bien rempli ou non
    it('Login fail email/password undefined', (done) => {
        request('https://dashboardmou.herokuapp.com')
            .post('/login')
            .send('email=&password=')
            .set('Accept', 'application/json')
            .expect(403, {
                error: true,
                message: "L'email/password est manquant"
            }, done);
    }, 60000);
})