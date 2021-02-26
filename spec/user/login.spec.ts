import request from "supertest"
import app from "../../app";
import { convertToFormBody } from "../helpers";

describe('Login test by rest API', () => {
    // test permettant de tester si les variables sont bien rempli ou non
    it('Login fail email/password undefined', (done) => {
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
            .set('Accept', 'application/json')
            .expect(403, {
                error: true,
                message: "L'email/password est manquant"
            }, done);
    }, 60000);
})