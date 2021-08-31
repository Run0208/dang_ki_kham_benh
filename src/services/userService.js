import db from '../models/index';
import bcrypt from 'bcryptjs';

let handleUserLogin = (email, password) => {
    return new Promise ( async (resolve, reject) => {
        try {
            let userData = {};
            let isExist = await checkUserEmail(email);
            if(isExist) {
                //user already exist
                
                let user = await db.User.findOne({
                    attributes: ['email', 'roleId', 'password'],
                    where: { email: email },
                    raw: true
                    // attributes: {
                    //     include: ['email', 'roleId'],
                    //     // exclude: ['password']
                    // }
                });

                if(user) {
                    //compare password
                    let check = await bcrypt.compareSync(password, user.password);

                    if(check) {
                        userData.errCode = 0;
                        userData.errMessage = 'OK';
                        delete user.password;
                        userData.user = user;
                    }
                    else {
                        userData.errCode = 3;
                        userData.errMessage = 'Wrong not password';
                    }
                }
                else {
                    userData.errCode = 2;
                    userData.errMessage = `User's not found ~ `
                }
            }
            else {
                userData.errCode = 1;
                userData.errMessage = `Your's email inn't exist in your system. Please try other email !!! `;
            }
            resolve(userData);
        }
        catch(e) {
            reject(e);
        }
    });
} 

let checkUserEmail = (userEmail) => {
    return new Promise( async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
               where: { email: userEmail } 
            });
            if(user) {
                resolve(true);
            }
            else {
                resolve(false);
            }
        }
        catch(e) {
            reject(e);
        }
    })
}

let getAllUsers = (userId) => {
    return new Promise( async (resolve, reject) => {
        try {
            let users = '';
            if(userId === 'All') {
                users = await db.User.findAll({
                    attributes: {
                        exclude: ['password']
                    }
                });
            }
            else if(userId && userId !== 'All') {
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: {
                        exclude: ['password']
                    } 
                });
            }
            resolve(users);
        }
        catch (e) {
            reject(e);
        }
    })
}


module.exports = {
    handleUserLogin: handleUserLogin,
    getAllUsers: getAllUsers,
}