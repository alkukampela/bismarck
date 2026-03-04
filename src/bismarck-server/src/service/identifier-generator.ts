const idChars: string[] = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'J',
  'K',
  'L',
  'M',
  'N',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

const randomInt = (max: number): number => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
};

const generateIdentifier = (length: number): string => {
  const randomChar = () => {
    return idChars[randomInt(idChars.length)];
  };

  return [...Array(length).keys()].reduce(
    (previous) => previous + randomChar(),
    ''
  );
};

export const generateLoginId = (loginIdLength: number = 5): string => {
  return generateIdentifier(loginIdLength);
};

export const generateGameId = (gameIdLength: number = 6): string => {
  return generateIdentifier(gameIdLength).toLowerCase();
};
