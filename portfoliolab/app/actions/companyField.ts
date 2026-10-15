import { prisma } from "@/lib/prisma";


async function companyName(companyid: number){
    const company = await prisma.company.findUnique({
        where: { id: companyid },
    });
    if (company){
        return company.name;
    }
    else{
        throw "Company not found."
    }
}

async function companyHeadquarter(companyId: number): Promise<string | null> {
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { headquarters: true },
    });

    if (!company) {
        return null;
    }

    return company.headquarters;
}

async function companySector(companyId: number): Promise<string | null> {
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { sector: true },
    });

    if (!company) {
        return null;
    }

    return company.sector;
}

async function companySubindustry(companyId: number): Promise<string | null> {
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { subindustry: true },
    });

    if (!company) {
        return null;
    }

    return company.subindustry;
}

async function companyFoundationYear(companyId: number): Promise<number | null> {
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { founded_year: true },
    });

    if (!company) {
        return null;
    }

    return company.founded_year;
}

export { companyName, companyHeadquarter, companySector, companySubindustry, companyFoundationYear };