import readline from "node:readline/promises";
import process from "node:process";
import { writeFileSync } from "node:fs";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client_id = await rl.question("Enter your client_id: ");
const client_secret = await rl.question("Enter your client_secret: ");
const audience = await rl.question("Enter your audience: ");

rl.close();

writeFileSync(
  "credentials.json",
  JSON.stringify({ client_id, client_secret, audience }, undefined, 2),
);
