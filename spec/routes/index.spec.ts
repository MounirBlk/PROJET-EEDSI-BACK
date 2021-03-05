import { roleTypes } from "../../src/types/roleTypes";
import { deleteEntrepriseSpec } from "./entreprise/deleteEntreprise.spec";
import { getEntrepriseSpec } from "./entreprise/getEntreprise.spec";
import { getEntreprisesSpec } from "./entreprise/getEntreprises.spec";
import { newEntrepriseSpec } from "./entreprise/newEntreprise.spec";
import { newEntrepriseAutoSpec } from "./entreprise/newEntrepriseAuto.spec";
import { updateEntrepriseSpec } from "./entreprise/updateEntreprise.spec";
import { checkUserSpec } from "./user/checkUser.spec";
import { deleteUserSpec } from "./user/deleteUser.spec"
import { disableUserSpec } from "./user/disableUser.spec";
import { forgotPasswordUserSpec } from "./user/forgotPassword.spec";
import { getUserSpec } from "./user/getUser.spec";
import { getUsersSpec } from "./user/getUsers.spec";
import { htmlSpec } from "./user/html.spec";
import { loginUserSpec } from "./user/login.spec"
import { registerUserSpec } from "./user/register.spec"
import { updateUserSpec } from "./user/updateUser.spec";

//ATTENTION: l'ordre des functions est très important !!!
export const userSpec = (role: Array<roleTypes>) => {
    htmlSpec();//1
    deleteUserSpec();//2
    registerUserSpec(role);//3
    loginUserSpec();//4
    getUserSpec();//5
    getUsersSpec(role);//6
    updateUserSpec();//7
    disableUserSpec();//8
    forgotPasswordUserSpec();//9
    checkUserSpec();//10
}

//ATTENTION: l'ordre des functions est très important !!!
export const entrepriseSpec = () => {
    newEntrepriseSpec()//1
    newEntrepriseAutoSpec()//2
    getEntreprisesSpec()//3
    updateEntrepriseSpec()//4
    getEntrepriseSpec()//5 
    deleteEntrepriseSpec()//6
}

//ATTENTION: l'ordre des functions est très important !!!
export const productSpec = () => {

}
