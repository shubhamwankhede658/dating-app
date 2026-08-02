import prisma from "../src/lib/prisma.js";

async function main() {
  const allUsers = await prisma.user.findMany({
    select: { name: true, gender: true, genderPreference: true },
  });

  console.log(`Total users: ${allUsers.length}`);
  console.log("---");
  allUsers.forEach((u) => {
    console.log(`${u.name} | gender: ${u.gender} | wants: ${u.genderPreference}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());