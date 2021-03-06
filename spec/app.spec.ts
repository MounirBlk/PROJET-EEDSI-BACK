declare global {
    var tokenInfos: string;
    var emailInfos: string;
    var passwordInfos: string;
    var idUser: any;
    var siret: number;
    var idEntreprise: string;
}
import { roleTypes } from "../src/types/roleTypes";
import { getTimeout, randNumber } from "./helpers";
import * as index from "./routes/index.spec";
import { checkUserTest } from "./routes/user/checkUser.spec";
import { deleteUserTest } from "./routes/user/deleteUser.spec";
import { loginUserTest } from "./routes/user/login.spec";
import { registerUserTest } from "./routes/user/register.spec";

const role: Array<roleTypes> = ["Administrateur", "Commercial", "Livreur", "Client", "Prospect"]
const selectedRole: string = role[randNumber(0, (role.length - 1))];

const iteratorTest: number = randNumber(1, 3); // random number btw min and max pour le nbre d'iteration des tests

//ATTENTION: l'ordre des functions est très important !!!
for(let i = 0; i < iteratorTest; i++){
    describe('TEST API E-COMMERCE', () => {
        beforeAll(registerUserTest(selectedRole), getTimeout(120));// Before all tests of specs (register)
        beforeAll(loginUserTest(), getTimeout(120));// Before all tests of specs (login)
        beforeAll(checkUserTest(), getTimeout(120));// Before all tests of specs (check)

        //beforeEach(() => console.log(__dirname));
        //afterEach(() => console.log('Test passed'))
    
        index.userSpec(selectedRole); // All tests user
        index.entrepriseSpec(); // All tests entreprise
        index.productSpec(); // All tests produit
    
        afterAll(deleteUserTest(), getTimeout(60));// After all tests of specs
    })
}

