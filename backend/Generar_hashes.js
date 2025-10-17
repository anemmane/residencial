const bcrypt = require("bcrypt");

const usuarios = [
  { username: "ana.garcia", password: "Ana123!" },
  { username: "luis.garcia", password: "Luis123!" },
  { username: "maria.lopez", password: "Maria123!" },
  { username: "admin", password: "Admin123!" }
];

async function generarHashes() {
  for (const u of usuarios) {
    const hash = await bcrypt.hash(u.password, 10);
    console.log(`${u.username} -> ${hash}`);
  }
}

generarHashes();


