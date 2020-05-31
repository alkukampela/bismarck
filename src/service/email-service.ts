import { RegisterPlayer } from '../types/register-player';
import { MailService, MailDataRequired } from '@sendgrid/mail';

const mailMessage = (
  registerPlayer: RegisterPlayer,
  loginUrl: string
): string => {
  return `Hei ${registerPlayer.player.name},
Klikkaa alla olevaa linkkiä, niin pääset nauttimaan jännittävistä hetkistä hienon korttipelin parissa:
${loginUrl}

Onnea peliin!`;
};

const subject = `Kutsu Bismarck-kierrokselle`;

const from = 'Bismarck <no-reply@bismarck.monster>';

const createMailMessage = (
  loginId: string,
  registerPlayer: RegisterPlayer
): MailDataRequired => {
  const loginUrl = `${process.env.LOGIN_URL}${loginId}`;
  return {
    to: registerPlayer.email,
    from,
    subject,
    text: mailMessage(registerPlayer, loginUrl),
  };
};

export const sendGameLink = (
  registerPlayer: RegisterPlayer,
  loginId: string
) => {
  const message: MailDataRequired = createMailMessage(loginId, registerPlayer);

  console.log(message);

  if (process.env.DISABLE_EMAIL_SENDING) {
    return;
  }

  const sgMail = new MailService();
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  sgMail
    .send(message)
    .then(() => {
      console.log(`Sent email to ${message.to}`);
    })
    .catch((err) => {
      // TODO throw error and inform about failed game creation
      console.log(err);
      console.log(err.response.body.errors);
    });
};
