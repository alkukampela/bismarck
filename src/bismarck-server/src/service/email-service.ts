import nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';

const htmlMailMessage = (name: string, loginId: string): string => {
  return `Hei <b>${name}</b>,<br/>

  Sy&ouml;t&auml; alla oleva koodi pelin etusivulle, niin p&auml;&auml;set nauttimaan
  j&auml;nnitt&auml;vist&auml; hetkist&auml; hienon korttipelin parissa.<br/>

  Kirjautumiskoodisi on <b>${loginId}</b><br/>

  Pelin l&ouml;yd&auml;t osoitteesta <b>bismarck piste monster</b>.<br/>

  <i>Onnea peliin!</i>`;
};

const textMailMessage = (name: string, loginId: string): string => {
  return `Hei ${name},
Syötä alla olevaa koodi pelin etusivulle, niin pääset nauttimaan jännittävistä hetkistä hienon korttipelin parissa:

${loginId}

Pelin löydät osoitteesta bismarck piste monster.

Onnea peliin!`;
};

const subject = `Kutsu Bismarck-kierrokselle`;

const from = '"Bismarck-korttipeli" <info@bismarck.monster>';

const mailOptions = (
  loginId: string,
  email: string,
  name: string
): MailOptions => {
  return {
    from,
    subject,
    to: email,
    text: textMailMessage(name, loginId),
    html: htmlMailMessage(name, loginId),
  };
};

export const sendLoginId = (sendRequest: {
  email: string;
  name: string;
  loginId: string;
}): void => {
  const { email, name, loginId } = sendRequest;
  const options = mailOptions(loginId, email, name);
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
      console.log(`Sent email to ${email}`);
      console.log(data.messageId);
    })
    .catch((err: Error) => {
      console.error(err, err.stack);
    });
};
