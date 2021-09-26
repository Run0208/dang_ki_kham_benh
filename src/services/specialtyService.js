const db = require('../models');

require('dotenv').config();

let createNewSpecialty = (data) => {
    return new Promise ( async (resolve, reject) => {
        try {
            if(
                !data.name || 
                !data.imageBase64 ||
                !data.descriptionHTML ||
                !data.descriptionMarkdown
            ) { 
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !',
                })
            } else {
                await db.Specialty.create({
                    name: data.name,
                    image: data.imageBase64,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown
                })

                resolve({
                    errCode: 0,
                    errMessage: 'OK',
                })
            }
        } catch(e) {
            reject(e)
        }
    })
}

let getAllSpecialty = () => {
    return new Promise ( async (resolve, reject) => {
        try {
            let data = await db.Specialty.findAll({

            });
            if(data && data.length > 0) {
                data.map((item)  => {
                    item.image = new Buffer(item.image, 'base64').toString('binary');
                    return item;
                })
            }
            resolve({
                errCode: 0,
                errMessage: 'OK',
                data
            })
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    createNewSpecialty: createNewSpecialty,
    getAllSpecialty: getAllSpecialty,
}