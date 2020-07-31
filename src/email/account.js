const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'annaxue812@gmail.com',
        subject: 'Thanks for joining in!',
        // use variabel inside `    `
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.` 
    })
}

module.exports = {
    sendWelcomeEmail
}
