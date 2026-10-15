import { prisma } from "../lib/prisma";

const stock = await prisma.stockPrice.findFirst()
const month = Date()

console.log(stock?.datetime instanceof Number)