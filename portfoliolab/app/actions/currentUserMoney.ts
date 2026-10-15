import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export default async function currentUserMoney(){
    const session = await auth();
    if (session == null || session.user == undefined){
        throw "No user is logged in."
    }
    if (session.user.email == null){
        throw "User has no email."
    }
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });
    if (user){
        return user.money;
    }
    else{
        throw "User not found."
    }
}