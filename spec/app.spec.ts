declare global {
    var tokenInfos: string;
    var emailInfos: string;
    var passwordInfos: string;
    var idUser: any;
    var siret: number;
    var idEntreprise: string;
}
import request from "supertest"
import app from "../app";
import { roleTypes } from "../src/types/roleTypes";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomDateEn, randomFileName } from "./helpers";
import * as index from "./routes/index.spec";
import { checkUserTest } from "./routes/user/checkUser.spec";
import { deleteUserTest } from "./routes/user/deleteUser.spec";
import { loginUserTest } from "./routes/user/login.spec";
import { registerUserTest } from "./routes/user/register.spec";

const role: Array<roleTypes> = ["Administrateur", "Commercial", "Livreur", "Client", "Prospect"]
const selectedRole: roleTypes = "Administrateur";/*role[randNumber(0, (role.length - 1))]*/

const iteratorTest: number = randNumber(1, 1); // random number btw min and max pour le nbre d'iteration des tests (ATTENTION AU LIMITER 200 REQUESTS)

//ATTENTION: l'ordre des functions est très important !!!
for(let i = 0; i < iteratorTest; i++){
    describe('TEST API E-COMMERCE', () => {
        beforeAll(registerUserTest(selectedRole), getTimeout(120));// Before all tests of specs (register)
        beforeAll(loginUserTest(), getTimeout(120));// Before all tests of specs (login)
        beforeAll(checkUserTest(), getTimeout(120));// Before all tests of specs (check)

        //beforeEach(() => console.log(__dirname));
        //afterEach(() => console.log('Test passed'))

        /*for(let i = 0; i < 200; i++){
            it('REGISTER PROSPECTS', (done: DoneFn) => {
                const data = {
                    email: 'test.' + randomChars(5) + '.' + randomChars(randNumber(5,10)) + String(randNumber(1,100)) +'@gmail.com',
                    password: randomChars(randNumber(5,10)) + String(randNumber(1,100)) + '*',
                    firstname: randomChars(randNumber(5,10)),
                    lastname: randomChars(randNumber(5,10)),
                    civilite: randNumber(0, 1) === 0 ? "Homme" : "Femme",
                    dateNaissance: randomDateEn(),
                    portable: randNumber(0, 1) === 0 ? '06' + String(randNumber(10000000,99999999)) : '07' + String(randNumber(10000000,99999999)),
                    role: 'Prospect', // i > 150 ? 'Client' : 'Livreur'
                    idEntreprise: ''
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
        }*/
        index.userSpec(selectedRole); // All tests user
        index.entrepriseSpec(); // All tests entreprise
        index.productSpec(); // All tests produit
        index.composantSpec(); // All tests composant
        index.articleSpec();// All tests article du panier
        index.commandeSpec(selectedRole);// All tests commande
        index.factureSpec();// All tests facture

        afterAll(deleteUserTest(), getTimeout(60));// After all tests of specs
    })
}

