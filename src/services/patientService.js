import db from '../models/index';
require('dotenv').config();
import emailService from './emailService';

let postBookAppointment = (data) => {
    return new Promise ( async (resolve, reject) => {
        try {
            if(
                !data.email || 
                !data.doctorId ||
                !data.date ||
                !data.timeType ||
                !data.fullName
            ) { 
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !',
                })
            } else {
                await emailService.sendSimpleEmail({
                    reciverEmail: data.email,
                    patientName: data.fullName,
                    time: data.timeString,
                    doctorName: data.doctorName,
                    language: data.language,
                    redirectLink: 'https://www.facebook.com/tobi0208/'
                });

                // insert patient
                let user = await db.User.findOrCreate({
                    where: { email: data.email },
                    defaults: {
                        email: data.email,
                        roleId: 'R3'
                    }
                });
                // create a booking 
                if(user && user[0]) {
                    await db.Booking.findOrCreate({
                        where: { patientId: user[0].id },
                        defaults: {
                            statusId: 'S1',
                            doctorId: data.doctorId,
                            patientId: user[0].id,
                            date: data.date,
                            timeType: data.timeType
                        }
                        
                    })
                }

                resolve({
                    errCode: 0,
                    errMessage: 'Save infor patient success !',
                })
            }
            
        } catch(e) {
            reject(e)
        }
    })
}

module.exports = {
    postBookAppointment: postBookAppointment,


}