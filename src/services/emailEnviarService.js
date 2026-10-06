import nodemailer from "nodemailer";
import { SITE_CONFIG } from "../constants/siteConfig.js";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.resend.com",
    port: process.env.EMAIL_PORT || 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER || "resend",
        pass: process.env.EMAIL_PASS
    }
});

export class EmailEnviarService {
    
    // 1. Notificação enviada para a Redação
    static async notificarRedacao({ nome, email, assunto, mensagem, ipRemetente }) {
        const mailOptions = {
            from: `Portal ${SITE_CONFIG.nome} <notificacoes@suadominio.com>`,
            to: SITE_CONFIG.emailRedacao,
            subject: `[NOVO CONTATO - ${assunto.toUpperCase()}] Mensagem de ${nome}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #003366;">Nova mensagem recebida no ${SITE_CONFIG.nome}</h2>
                    <hr />
                    <p><strong>Nome:</strong> ${nome}</p>
                    <p><strong>E-mail:</strong> ${email}</p>
                    <p><strong>Assunto:</strong> ${assunto}</p>
                    <p><strong>IP do Remetente:</strong> ${ipRemetente}</p>
                    <hr />
                    <h3>Mensagem:</h3>
                    <p style="background: #f4f4f4; padding: 15px; border-left: 4px solid #003366;">
                        ${mensagem}
                    </p>
                </div>
            `
        };

        return await transporter.sendMail(mailOptions);
    }

    // 2. E-mail de confirmação enviado para o leitor
    static async confirmarRecebimentoLeitor({ nome, email }) {
        const mailOptions = {
            from: `${SITE_CONFIG.nome} <nao-responda@suadominio.com>`,
            to: email,
            subject: `Recebemos sua mensagem - ${SITE_CONFIG.nome}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #003366;">Olá, ${nome}!</h2>
                    <p>Obrigado por entrar em contato com o portal <strong>${SITE_CONFIG.nome}</strong>.</p>
                    <p>Sua mensagem foi registrada em nosso sistema e encaminhada para nossa redação.</p>
                    <p>Responderemos o mais breve possível.</p>
                    <br />
                    <p>Atenciosamente,<br /><strong>Equipe ${SITE_CONFIG.nome}</strong></p>
                    <small style="color: #777;">${SITE_CONFIG.slogan}</small>
                </div>
            `
        };

        return await transporter.sendMail(mailOptions);
    }
}

