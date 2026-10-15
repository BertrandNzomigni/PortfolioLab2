import { prisma } from "./lib/prisma";

async function main() {
  // Create a new user with a post
  const company = await prisma.company.create({
    data: {
      symbol: "ADBE",
      name: "Adobe Inc.",
      sector: "Information Technology",
      subindustry: "Application Software",
      headquarters: "San Jose, California",
      founded_year: 1982
    }
  });
  console.log("Created company:", company);

  // Fetch all users with their posts
  const allCompanies = await prisma.company.findMany();
  console.log("All companies:", JSON.stringify(allCompanies, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });