import db from '../models/index';
require('dotenv').config();
import _ from 'lodash';


const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let getTopDoctorHome = (limit) => {
    return new Promise ( async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                limit: limit,
                where: { roleId: 'R2' },
                order:  [['createdAt', 'DESC']],
                attributes: {
                    exclude: ['password']
                },
                include: [
                    { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] },
                ],
                raw: true,
                nest: true
            })

            resolve({
                errCode: 0,
                data: users
            })
        }
        catch(e) {
            reject(e);
        }
    });
}

let getAllDoctors = () => {
    return new Promise ( async (resolve, reject)  => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId: 'R2'} ,
                attributes: {
                    exclude: ['password', 'image']
                },
            });

            resolve({
                errCode: 0,
                data: doctors
            })
        } catch (e) {
            reject(e);
        }
    })
}

let saveDetailInforDoctor = (data) => {
    return new Promise( async (resolve, reject) => {
        try {
            if( 
                !data.doctorId 
                || !data.contentHTML 
                || !data.contentMarkdown 
                || !data.action 
                || !data.selectedPrice 
                || !data.selectedPayment 
                || !data.selectedProvince 
                || !data.nameClinic 
                || !data.addressClinic 
                || !data.note
            ) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {

                // Insert to Markdown
                if (data.action === 'CREATE') {
                    await db.Markdown.create({
                        contentHTML: data.contentHTML,
                        contentMarkdown: data.contentMarkdown,
                        description	: data.description,
                        doctorId: data.doctorId
                    })
                
                } else if (data.action === 'EDIT') {
                    let doctorMarkdown = await db.Markdown.findOne({
                        where: { doctorId: data.doctorId },
                        raw: false 
                    })
                    
                    if(doctorMarkdown) {
                        doctorMarkdown.contentHTML = data.contentHTML;
                        doctorMarkdown.contentMarkdown = data.contentMarkdown;
                        doctorMarkdown.description = data.description;
                        await doctorMarkdown.save();
                    }
                }


                // Insert to Doctor_Infor
                let doctorInfor = await db.Doctor_Infor.findOne({
                    where: {
                        doctorId: data.doctorId
                    },
                    raw: false
                })

                if(doctorInfor) {
                    // update
                    doctorInfor.doctorId = data.doctorId;
                    doctorInfor.priceId = data.selectedPrice;
                    doctorInfor.paymentId = data.selectedPayment;
                    doctorInfor.provinceId = data.selectedProvince;
                    doctorInfor.addressClinic = data.addressClinic;
                    doctorInfor.nameClinic = data.nameClinic;
                    doctorInfor.note = data.note;
                    await doctorInfor.save();
                } else {
                    // create
                    await db.Doctor_Infor.create({
                        doctorId: data.doctorId,
                        priceId: data.selectedPrice,
                        paymentId: data.selectedPayment,
                        provinceId: data.selectedProvince,
                        addressClinic: data.addressClinic,
                        nameClinic: data.nameClinic,
                        note: data.note
                    })
                } 

                resolve({
                    errCode: 0,
                    errMessage: 'Save infor doctor success !'
                })
            }
        } catch(e) {
            reject(e);
        }
    })
}

let getDetailDoctor = (inputId) => {
    return new Promise ( async (resolve, reject) => {
        try {
            if(!inputId){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !',
                })
            } else {
                let data = await db.User.findOne({
                    where: {
                        id: inputId
                    },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [
                        { 
                            model: db.Markdown,
                            attributes: ['description', 'contentHTML', 'contentMarkdown'],

                        },
                        {
                            model: db.Allcode, 
                            as: 'positionData', attributes: ['valueEn', 'valueVi']
                        }
                    ],
                    raw: false,
                    nest: true
                })

                if(data && data.image) {
                    data.image = new Buffer(data.image, 'base64').toString('binary');
                }

                if(!data) data = {};

                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch(e) {
            reject(e);
        }
    })
}

let  bulkCreateSchedule = (data) => {
    return new Promise ( async (resolve, reject) => {
        try {
            if(!data.arrSchedule || !data.doctorId || !data.formatedDate) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
            } else {
                let schedule = data.arrSchedule;
                if(schedule && schedule.length > 0) {
                    schedule = schedule.map(item => {
                        item.maxNumber = MAX_NUMBER_SCHEDULE;
                        return item;
                     })
                }

                let existing = await db.Schedule.findAll({
                    where: { doctorId: data.doctorId, date: data.formatedDate },
                    attributes: ['timeType', 'date', 'doctorId', 'maxNumber'],
                    raw: true
                });

                // compare different
                let toCreate = _.differenceWith(schedule, existing, (a, b) => {
                    return a.timeType === b.timeType && +a.date === +b.date;
                });

                //  create data
                if(toCreate && toCreate.length > 0) {
                    await db.Schedule.bulkCreate(toCreate);
                }
                
                resolve({
                    errCode: 0,
                    errMessage: 'OK'
                });
            }

        } catch (e) {
            reject(e);
        }
    });
}

let getScheduleByDate = (doctorId, date) => {
    return new Promise (async (resolve, reject) =>{
        try {
            if(!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                let data = await db.Schedule.findAll({
                    where: {
                        doctorId: doctorId,
                        date: date,
                    },
                    include: [
                        {
                            model: db.Allcode, 
                            as: 'timeTypeData', attributes: ['valueEn', 'valueVi']
                        }
                    ],
                    raw: false,
                    nest: true
                })
                if(!data)
                    data = [];
                resolve({
                    errCode: 0,
                    data: data
                })
                
            }
        } catch(e) {
            reject(e);
        }
    })
}

module.exports = {
    getTopDoctorHome: getTopDoctorHome,
    getAllDoctors: getAllDoctors,
    saveDetailInforDoctor: saveDetailInforDoctor,
    getDetailDoctor: getDetailDoctor,
    bulkCreateSchedule: bulkCreateSchedule,
    getScheduleByDate: getScheduleByDate,
}