import { roleTypes } from "../../src/types/roleTypes";
import { deleteEntrepriseSpec } from "./entreprise/deleteEntreprise.spec";
import { getEntrepriseSpec } from "./entreprise/getEntreprise.spec";
import { getEntreprisesSpec } from "./entreprise/getEntreprises.spec";
import { newEntrepriseSpec } from "./entreprise/newEntreprise.spec";
import { updateEntrepriseSpec } from "./entreprise/updateEntreprise.spec";
import { checkUserSpec } from "./user/checkUser.spec";
import { deleteUserSpec } from "./user/deleteUser.spec"
import { disableUserSpec } from "./user/disableUser.spec";
import { forgotPasswordUserSpec } from "./user/forgotPassword.spec";
import { getUserSpec } from "./user/getUser.spec";
import { htmlSpec } from "./user/html.spec";
import { loginUserSpec } from "./user/login.spec"
import { registerUserSpec } from "./user/register.spec"
import { updateUserSpec } from "./user/updateUser.spec";

export const userSpec = (role: Array<roleTypes>) => {
    htmlSpec();
    deleteUserSpec();
    registerUserSpec(role);
    loginUserSpec();
    getUserSpec();
    updateUserSpec();
    disableUserSpec();
    forgotPasswordUserSpec();
    checkUserSpec();
}

export const entrepriseSpec = () => {
    newEntrepriseSpec()
    updateEntrepriseSpec()
    deleteEntrepriseSpec()
    getEntrepriseSpec()
    getEntreprisesSpec()
}

export const productSpec = () => {

}