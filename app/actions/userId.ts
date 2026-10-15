import { prisma } from "@/lib/prisma";

export default async function userId(email: string | null | undefined) {
    if (email == null) {
        return null;
    }
    const user = await prisma.user.findUnique({
        where: { email: email },
        select: { id: true },
    });
    return user ? user.id : null;
}