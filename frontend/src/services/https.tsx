// import { AddressInterface } from "../../interfaces/Address";
// import { CodeInterface } from "../../interfaces/Code";
import { SignInInterface } from "../interfaces/SignIn";
import { UserInterface } from "../interfaces/User";
// import { Payment } from "../../interfaces/Payment";

import axios from "axios";

const apiUrl = "http://localhost:8000";

const Authorization = localStorage.getItem("token");

const Bearer = localStorage.getItem("token_type");


const requestOptions = {

  headers: {

    "Content-Type": "application/json",

    Authorization: `${Bearer} ${Authorization}`,

  },

};

async function SignIn(data: SignInInterface) {

  return await axios

    .post(`${apiUrl}/signin`, data, requestOptions)

    .then((res) => res)

    .catch((e) => e.response);

}

// async function CreateCode(data: CodeInterface) {

// return await axios
  
//     .post(`${apiUrl}/codes`, data, requestOptions)
  
//     .then((res) => res)
  
//     .catch((e) => e.response);
  
// }

// async function GetCodes() {

//   return await axios

//     .get(`${apiUrl}/codes`, requestOptions)

//     .then((res) => res)

//     .catch((e) => e.response);

// }

// async function GetCodesById(id: Number | undefined) {

//   return await axios

//     .get(`${apiUrl}/codes/${id}`, requestOptions)

//     .then((res) => res)

//     .catch((e) => e.response);

// }


// async function UpdateCode(data: CodeInterface) {

//   return await axios

//     .put(`${apiUrl}/codes/${data.ID}`, data, requestOptions)  // เพิ่ม ${data.ID} ใน URL

//     .then((res) => res)
    
//     .catch((e) => e.response);
// }



// async function DeleteCodeById(id: Number | undefined) {

//   return await axios

//     .delete(`${apiUrl}/codes/${id}`, requestOptions)

//     .then((res) => res)

//     .catch((e) => e.response);

// }

async function CreateUser(data: UserInterface) {

  return await axios

    .post(`${apiUrl}/signup`, data, requestOptions)

    .then((res) => res)

    .catch((e) => e.response);

}

async function CreateAdmin(data: UserInterface) {

  return await axios

    .post(`${apiUrl}/signupadmin`, data, requestOptions)

    .then((res) => res)

    .catch((e) => e.response);

}

async function GetUsers() {

  return await axios

    .get(`${apiUrl}/users`, requestOptions)

    .then((res) => res)

    .catch((e) => e.response);

}

async function GetAdmin() {

  return await axios

    .get(`${apiUrl}/admins`, requestOptions)

    .then((res) => res)

    .catch((e) => e.response);

}

// async function GetPaymentMethod() {

//   return await axios

//     .get(`${apiUrl}/paymentMethod`, requestOptions)

//     .then((res) => res)

//     .catch((e) => e.response);

// }


async function GetUsersById(id: string) {

  return await axios

    .get(`${apiUrl}/user/${id}`, requestOptions)

    .then((res) => res)

    .catch((e) => e.response);

}


async function UpdateUsersById(id: string, data: UserInterface) {

  return await axios

    .put(`${apiUrl}/user/${id}`, data, requestOptions)

    .then((res) => res)

    .catch((e) => e.response);

}


async function DeleteUsersById(id: string) {

  return await axios

    .delete(`${apiUrl}/user/${id}`, requestOptions)

    .then((res) => res)

    .catch((e) => e.response);

}

// async function UpdateCodeAfterCollect(codeId: string) {

//   return await axios

//     .put(`${apiUrl}/code-collect/${codeId}`, {}, requestOptions)

//     .then((res) => res)

//     .catch((e) => e.response);
// }

// async function AddCodeToCollect(userId: string, codeId: string) {

//   return await axios

//     .post(`${apiUrl}/code-collect/${userId}/${codeId}`, {}, requestOptions)

//     .then((res) => res)

//     .catch((e) => e.response);
// }

// async function GetCollectedCodes(userId: string) {

//   return await axios

//     .get(`${apiUrl}/code-collect/${userId}`, requestOptions)

//     .then((res) => res)
    
//     .catch((e) => e.response);
// }

// async function GetCollectedCodesToShow(Id: string) {

//   return await axios

//     .get(`${apiUrl}/show-collect/${Id}`, requestOptions)

//     .then((res) => res)
    
//     .catch((e) => e.response);
    
// }

// async function CreateAddress(data: AddressInterface) {

//   return await axios

//     .post(`${apiUrl}/address`, data, requestOptions)

//     .then((res) => res)

//     .catch((e) => e.response);

// }

// async function GetAddressesByUserId (id: string) {

//   return await axios

//     .get(`${apiUrl}/address/${id}`, requestOptions)

//     .then((res) => res)

//     .catch((e) => e.response);

// }

//------------------------------------------------------------------

// async function GetPayments() {
//   return await axios
//     .get(`${apiUrl}/payments`, requestOptions)
//     .then((res) => res)
//     .catch((e) => e.response);
// }

// async function GetPaymentByID(id: string){
//   return await axios
//     .get(`${apiUrl}/payments/${id}`, requestOptions)
//     .then((res) => res)
//     .catch((e) => e.response);
// }

// async function CreatePayment(id: string, data: Payment) {
//   return await axios
//     .post(`${apiUrl}/payments/${id}`, data, requestOptions)
//     .then((res) => res)
//     .catch((e) => e.response);
// }

// async function UpdatePaymentByUserID(id: string, data: Payment) {
//   return await axios
//     .put(`${apiUrl}/payments/${id}`, data, requestOptions)
//     .then((res) => res)
//     .catch((e) => e.response);
// }

// async function DeletePayment(id: string) {
//   return await axios
//     .delete(`${apiUrl}/payments/${id}`, requestOptions)
//     .then((res) => res)
//     .catch((e) => e.response);
// }


export {

    // CreateCode,
    // GetCodes,
    // GetCodesById,
    // UpdateCode,
    // DeleteCodeById,
    SignIn,
    CreateUser,
    CreateAdmin,
    GetUsers,
    GetAdmin,
    GetUsersById,
    UpdateUsersById,
    DeleteUsersById,
    // UpdateCodeAfterCollect,
    // AddCodeToCollect,
    // GetCollectedCodes,
    // CreateAddress,
    // GetAddressesByUserId,
    // GetPayments,
    // GetPaymentByID,
    // CreatePayment,
    // UpdatePaymentByUserID,
    // DeletePayment,
    // GetPaymentMethod,
    // GetCollectedCodesToShow,

};