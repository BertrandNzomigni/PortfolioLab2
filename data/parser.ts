import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Papa from "papaparse";

import { prisma } from "../lib/prisma";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "companies.csv");

try {
    const data = await fs.readFile(filePath, "utf-8");

    const results = Papa.parse<string[]>(data, {
        skipEmptyLines: true,
    });

    const companies = results.data.slice(1);

    for (const selectedCompany of companies) {
        // upsert keeps the seed idempotent: re-running it (e.g. on every
        // `docker compose up`) does not fail on the unique symbol constraint.
        const company = await prisma.company.upsert({
            where: { symbol: selectedCompany[0] },
            update: {},
            create: {
                symbol: selectedCompany[0],
                name: selectedCompany[1],
                sector: selectedCompany[2],
                subindustry: selectedCompany[3],
                headquarters: selectedCompany[4],
                founded_year: parseInt(selectedCompany[7]),
            },
        });

        console.log(`Company ready: ${company.symbol}`);
    }
} catch (error) {
    console.error("Error:", error);
} finally {
    await prisma.$disconnect();
}