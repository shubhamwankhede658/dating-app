import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
import prisma from "./lib/prisma.js";

async function main() {
  console.log("Testing message.findMany...");
  const messages = await prisma.message.findMany({
    where: { matchId: "138b3c74-247d-4aeb-b17b-00991f9e6988" },
  });
  console.log("Result:", messages);
  process.exit(0);
}

main();