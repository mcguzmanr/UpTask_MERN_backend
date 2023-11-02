import nodemailer from 'nodemailer';

export const emailRegistro = async (datos) => {
    const {email, nombre, token} = datos;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    // Informacion del mail

    const info = await transport.sendMail({
        from: ' "UpTask - Administrador de proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Confirma tu cuenta",
        text: "Confirma tu cuenta en UpTask",
        html: `<p>Hola: ${nombre} confirma tu cuenta en UpTask</p>
        <p>Tu cuenta está casi lista, solo debes confirmarla en el siguiente enlace:
            <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Confirmar cuenta</a>
        </p>

        <p>Si tú no creaste esta cuenta puedes ignorar este mensaje</p>

        `
    });
};

export const emailOlvidePassword = async (datos) => {
    const {email, nombre, token} = datos;

    // TODO: Mover hacia variables de entorno
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    // Informacion del mail

    const info = await transport.sendMail({
        from: ' "UpTask - Administrador de proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Reestablece tu password",
        text: "Reestablece tu password",
        html: `<p>Hola: ${nombre} has solicitado reestablecer tu password</p>
        <p>Haz click en el siguiente en lace para generar un nuevo password:
            <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer password</a>
        </p>

        <p>Si tú no solicitaste este email puedes ignorar este mensaje</p>

        `
    });
};