export const extractGameId = (doc: Document): string => {
  const params = new URLSearchParams(doc.location.search);
  return params.get('game') || '';
};
