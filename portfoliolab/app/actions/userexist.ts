import { prisma } from "@/lib/prisma";


export default async function userExist(email: string | null |undefined){
    if (email == null){
        return false;
    }
    const user = await prisma.user.findUnique({
        where: { email: email },
    });
    if (user){
        return true;
    }
    else{
        return false;
    }
}