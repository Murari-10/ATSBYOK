import CryptoJS from "crypto-js";

const SECRET = process.env.BYOK_ENCRYPTION_SECRET!;

export function encryptKey(apiKey: string): string {
  return CryptoJS.AES.encrypt(apiKey, SECRET).toString();
}

export function decryptKey(encrypted: string): string {
  return CryptoJS.AES.decrypt(encrypted, SECRET).toString(CryptoJS.enc.Utf8);
}
