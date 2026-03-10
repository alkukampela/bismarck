import nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';
import pino from 'pino';

const logger = pino();

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

export const sendLoginId = async (sendRequest: {
  email: string;
  name: string;
  loginId: string;
}): Promise<void> => {
  const { email, name, loginId } = sendRequest;
  const options = mailOptions(loginId, email, name);

  if (process.env.DISABLE_EMAIL_SENDING) {
    logger.info(options.text);
    return;
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  logger.info(`Using SMTP host: ${process.env.SMTP_HOST}:465 to send email`);

  try {
    await transport.sendMail(options);
    logger.info(`Sent email to ${email}`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(`Failed to send email to ${email}: ${err.message}`);
    } else {
      logger.error(`Failed to send email to ${email}: ${String(err)}`);
    }
  }
};
