import { RegisterPlayer } from '../types/register-player';
import nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';

const htmlMailMessage = (
  registerPlayer: RegisterPlayer,
  loginUrl: string
): string => {
  return `Hei <b>${registerPlayer.player.name}</b>,<br/>
Klikkaa alla olevaa linkki&auml;, niin p&auml;&auml;set nauttimaan
j&auml;nnitt&auml;vist&auml; hetkist&auml; hienon korttipelin parissa:<br/>

<a href="${loginUrl}">T&auml;st&auml; pelaamaan</a><br/><br/>

<b>Onnea peliin!</b>`;
};

const textMailMessage = (
  registerPlayer: RegisterPlayer,
  loginUrl: string
): string => {
  return `Hei ${registerPlayer.player.name},
Klikkaa alla olevaa linkkiä, niin pääset nauttimaan jännittävistä hetkistä hienon korttipelin parissa:
${loginUrl}
Onnea peliin!`;
};

const subject = `Kutsu Bismarck-kierrokselle`;

const from = 'info@bismarck.monster';

export const mailOptions = (
  loginId: string,
  registerPlayer: RegisterPlayer
): MailOptions => {
  const loginUrl = `${process.env.LOGIN_URL}${loginId}`;
  return {
    from,
    subject,
    to: registerPlayer.email,
    text: textMailMessage(registerPlayer, loginUrl),
    html: htmlMailMessage(registerPlayer, loginUrl),
  };
};

export const sendGameLink = (
  registerPlayer: RegisterPlayer,
  loginId: string
) => {
  const options = mailOptions(loginId, registerPlayer);
  console.log(options.text);

  if (process.env.DISABLE_EMAIL_SENDING) {
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  transporter
    .sendMail(options)
    .then((data) => {
      console.log(`Sent email to ${registerPlayer.email}`);
      console.log(data.messageId);
    })
    .catch((err) => {
      // TODO throw error and inform about failed game creation
      console.error(err, err.stack);
    });
};
