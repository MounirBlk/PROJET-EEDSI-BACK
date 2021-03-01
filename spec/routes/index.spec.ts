import { deleteUserSpec } from "../user/deleteUser.spec"
import { getUserSpec } from "../user/getUser.spec";
import { htmlSpec } from "../user/html.spec";
import { loginUserSpec } from "../user/login.spec"
import { registerUserSpec } from "../user/register.spec"

export const userSpec = (role: Array<string>) => {
    htmlSpec();
    deleteUserSpec();
    registerUserSpec(role);
    loginUserSpec();
    getUserSpec();
}

export const productSpec = () => {

}