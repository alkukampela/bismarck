import { RegisterPlayer } from '../types/register-player';
import nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';

const htmlMailMessage = (
  registerPlayer: RegisterPlayer,
  loginId: string
): string => {
  return `Hei <b>${registerPlayer.player.name}</b>,<br/>

  Sy&ouml;t&auml; alla oleva koodi pelin etusivulle, niin p&auml;&auml;set nauttimaan
  j&auml;nnitt&auml;vist&auml; hetkist&auml; hienon korttipelin parissa:<br/>

  Kirjautumiskoodisi on <b>${loginId}</b><br/><br/>

  <b>Onnea peliin!</b>`;
};

const textMailMessage = (
  registerPlayer: RegisterPlayer,
  loginId: string
): string => {
  return `Hei ${registerPlayer.player.name},
Syötä alla olevaa koodi pelin etusivulle, niin pääset nauttimaan jännittävistä hetkistä hienon korttipelin parissa:
${loginId}
Onnea peliin!`;
};

const subject = `Kutsu Bismarck-kierrokselle`;

const from = '"Bismarck-korttipeli" <info@bismarck.monster>';

export const mailOptions = (
  loginId: string,
  registerPlayer: RegisterPlayer
): MailOptions => {
  return {
    from,
    subject,
    to: registerPlayer.email,
    text: textMailMessage(registerPlayer, loginId),
    html: htmlMailMessage(registerPlayer, loginId),
  };
};

export const sendLoginId = (
  registerPlayer: RegisterPlayer,
  loginId: string
): void => {
  const options = mailOptions(loginId, registerPlayer);
  console.log(options.text);

  if (process.env.DISABLE_EMAIL_SENDING) {
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
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
    .catch((err: Error) => {
      // TODO throw error and inform about failed game creation
      console.error(err, err.stack);
    });
};
