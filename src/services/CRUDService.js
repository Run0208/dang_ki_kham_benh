import db from '../models/index';
import bcrypt from 'bcryptjs';


const salt = bcrypt.genSaltSync(10);


let createNewUser = async (data) => {
    return new Promise( async (resolve, reject) => {
        try{
            let hashPasswordFromBcrypt = await hashUserPassword(data.password);
            await db.User.create({
                email: data.email,
                password: hashPasswordFromBcrypt,
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address,
                phoneNumber: data.phoneNumber,
                gender: data.gender === '1' ? true : false,
                roleId: data.roleId
            });

            resolve('ok! create a new user succeed!');
        }catch(e){
            reject(e);
        }
    });
    
    console.log('data from service');
    console.log(data);
    console.log(hashPasswordFromBcrypt);
}

let hashUserPassword = (password) => {
    return new Promise( async(resolve, reject) => {
        try{
            var hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        }catch(e){
            reject(e);
        }
    });
}

let getAllUser = () => {
    return new Promise( async (resolve, reject) => {
        try{ 
            let users = db.User.findAll({
                raw: true
            });
            resolve(users);
        }catch(e){
            reject(e);
        }
    });
}

module.exports = {
    createNewUser: createNewUser,
    getAllUser: getAllUser,
}