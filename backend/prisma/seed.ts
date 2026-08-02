import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import prisma from "../src/lib/prisma.js";
import cloudinary from "../src/lib/cloudinary.js";

const maleNames = ["Arjun", "Rohan", "Vikram", "Aditya", "Karan"];
const femaleNames = ["Priya", "Ananya", "Neha", "Riya", "Kavya"];

const bios = [
  "Coffee addict, dog lover, always up for a trek.",
  "Foodie exploring the city one cafe at a time.",
  "Into books, movies, and long walks.",
  "Gym in the morning, Netflix at night.",
  "Traveler at heart, always planning the next trip.",
];

async function uploadLocalImage(filePath: string): Promise<string> {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "dating-app-profiles",
  });
  return result.secure_url;
}

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);
  const imagesDir = path.join(process.cwd(), "prisma", "seed-images");
  const users = [];

  for (let i = 0; i < maleNames.length; i++) {
    const filePath = path.join(imagesDir, `male${i + 1}.png`);
    console.log(`Uploading ${filePath}...`);
    const photoUrl = await uploadLocalImage(filePath);

    users.push({
      name: maleNames[i],
      email: `${maleNames[i].toLowerCase()}@test.com`,
      password: hashedPassword,
      age: 22 + Math.floor(Math.random() * 13),
      gender: "male",
      genderPreference: Math.random() > 0.3 ? "female" : "everyone",
      bio: bios[Math.floor(Math.random() * bios.length)],
      photoUrl,
    });
  }

  for (let i = 0; i < femaleNames.length; i++) {
    const filePath = path.join(imagesDir, `female${i + 1}.png`);
    console.log(`Uploading ${filePath}...`);
    const photoUrl = await uploadLocalImage(filePath);

    users.push({
      name: femaleNames[i],
      email: `${femaleNames[i].toLowerCase()}@test.com`,
      password: hashedPassword,
      age: 21 + Math.floor(Math.random() * 13),
      gender: "female",
      genderPreference: Math.random() > 0.3 ? "male" : "everyone",
      bio: bios[Math.floor(Math.random() * bios.length)],
      photoUrl,
    });
  }

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
  }

  console.log(`Seeded ${users.length} users (5 male, 5 female). All passwords: password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });