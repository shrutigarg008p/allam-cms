const nodemailer = require('nodemailer');
//let transport = nodemailer.createTransport(options[, defaults])

const transport = nodemailer.createTransport({
    host: 'email-smtp.ap-south-1.amazonaws.com',
    port: 587,
    auth: {
       user: 'AKIAURUVEUHW4IW7CRVW',
       pass: 'BHcqKJUdrf/cHtBVOI86cQjMOTpzT7oO2/9V81OD8zW7'
    }
});

module.exports = transport;