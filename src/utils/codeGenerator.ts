import { customAlphabet } from 'nanoid';

const RESTAURANT_CODE_LENGTH = 6;
const RESTAURANT_CODE_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const generateRestaurantCode = async (): Promise<string> => {
  const nanoid = customAlphabet(RESTAURANT_CODE_ALPHABET, RESTAURANT_CODE_LENGTH);
  return nanoid();
}; 