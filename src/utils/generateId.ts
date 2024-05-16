import { customAlphabet } from 'nanoid'

const generate = customAlphabet('QWERTYUIOPASDFGHJKLZXCVBNM1234567890');

export default function generateId(size: number) {
  return generate(size);
}