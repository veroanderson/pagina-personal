#!/usr/bin/env node
// Genera el valor de ADMIN_PASSWORD_HASH para el .env.
//
// Uso:
//   node scripts/hash-password.mjs
//
// Pide la contraseña de forma interactiva y con el eco apagado. Deliberadamente
// NO acepta la contraseña como argumento (`node hash-password.mjs miclave`):
// eso la dejaría en el historial de bash y visible en `ps` para otros usuarios
// mientras corre.
//
// Los parámetros de scrypt tienen que coincidir con los de src/lib/password.ts.
// Este script es .mjs a propósito: corre con node pelado, sin build ni deps, así
// que se puede usar antes de levantar la aplicación.

import crypto from 'node:crypto';
import readline from 'node:readline';
import { stdin, stdout, exit } from 'node:process';

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
const MIN_LENGTH = 12;

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: stdin, output: stdout, terminal: true });
    rl.question(question, (answer) => {
      rl.close();
      stdout.write('\n');
      resolve(answer);
    });
    // Se apaga el eco recién después de `question`, para que el prompt sí se
    // imprima pero no lo que se tipea.
    rl._writeToOutput = () => {};
  });
}

function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  return ['scrypt', SCRYPT_N, SCRYPT_R, SCRYPT_P, salt.toString('hex'), hash.toString('hex')].join('$');
}

const password = await askHidden('Contraseña del admin: ');
if (password.length < MIN_LENGTH) {
  console.error(`\nLa contraseña debe tener al menos ${MIN_LENGTH} caracteres.`);
  console.error('Es la única credencial del panel: conviene una frase larga o algo generado con un gestor.');
  exit(1);
}

const confirmation = await askHidden('Repetir contraseña: ');
if (password !== confirmation) {
  console.error('\nLas contraseñas no coinciden.');
  exit(1);
}

const hash = hashPassword(password);
const envHash = hash.replaceAll('$', '\\$');

console.log('\nPegar esta línea en el .env (y después: chmod 600 .env)\n');
console.log(`ADMIN_PASSWORD_HASH=${envHash}\n`);
console.log('Recordá: rotar este valor invalida todas las sesiones de admin abiertas.');
