import { prisma } from "@/lib/prisma";

export default async function ownershipQuantity(userId : number,companyId : number){
    const ownership = await prisma.stockOwnership.findUnique({
        where: {
            userId_companyId: {
                userId: userId,
                companyId: companyId
            }
        }
    });
    return ownership ? ownership.quantity : 0;
}