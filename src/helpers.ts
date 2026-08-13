import argon2 from 'argon2';

export async function hashPassword(password: string) {
  try {
    const hash = await argon2.hash(password);
    return hash;
  } catch (err) {
    console.error(err);
  }
}

export async function verifyPassword(password: string, password_hash: string) {
  try {
    return await argon2.verify(password_hash, password);
  } catch (err) {
    console.error(err);
  }
}
