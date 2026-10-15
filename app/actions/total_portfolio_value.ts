import { prisma } from "@/lib/prisma";
import userId from "./userId";
import { auth } from "@/auth";
import { companyLastestPrice } from "./companyPrice";
import { Decimal } from "@prisma/client/runtime/client";

export default async function totalPortfolioValue(){
    const session = await auth()
    const user_id = await userId(session?.user?.email)

    if (user_id == null){
        throw "Didn't found the user."
    }

    const ownerships = await prisma.stockOwnership.findMany({
        where: {userId : user_id}
    });
    
    let sum = Decimal(0);
    let i = 0;

    while (i < ownerships.length){
        let owner = ownerships[i];
        let price = await companyLastestPrice(owner.companyId);
        if (price != null){
            sum = Decimal(owner.quantity).mul(price).add(sum);
        }
        i += 1
    }
    return sum;
}