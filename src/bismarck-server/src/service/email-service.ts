import { AwsClient } from 'aws4fetch';
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

const emailPayload = (name: string, loginId: string, email: string) => {
  return {
    FromEmailAddress: '"Bismarck-korttipeli" <info@bismarck.monster>',
    Destination: {
      ToAddresses: [email],
    },
    Content: {
      Simple: {
        Subject: {
          Data: 'Kutsu Bismarck-kierrokselle',
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: textMailMessage(name, loginId),
            Charset: 'UTF-8',
          },
          Html: {
            Data: htmlMailMessage(name, loginId),
            Charset: 'UTF-8',
          },
        },
      },
    },
  };
};

export const sendLoginId = async (
  sendRequest: {
    email: string;
    name: string;
    loginId: string;
  },
  env: Env
): Promise<void> => {
  const { email, name, loginId } = sendRequest;

  if (env.DISABLE_EMAIL_SENDING.toLowerCase() === 'true') {
    logger.info(
      `Email sending is disabled, name: ${name}, loginId: ${loginId}`
    );
    return;
  }

  const aws = new AwsClient({
    accessKeyId: env.SMTP_USERNAME,
    secretAccessKey: env.SMTP_PASSWORD,
    region: env.SES_REGION,
  });

  try {
    const response = await aws.fetch(env.SES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload(name, loginId, email)),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SES API error: ${response.status} - ${errorText}`);
    }

    logger.info(`Sent email to ${email} via AWS SES`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(`Failed to send email to ${email}: ${err.message}`);
    } else {
      logger.error(`Failed to send email to ${email}: ${String(err)}`);
    }
  }
};
