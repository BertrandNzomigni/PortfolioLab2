import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export default async function createUser(){
    const session = await auth();
    if (session == null || session.user == undefined){
        throw "No user is logged in."
    }
    if (session.user.email == null){
        throw "User has no email."
    }
    await prisma.user.create({
        data: {
            email: session.user.email,
            money: 30000
        }
    })
}