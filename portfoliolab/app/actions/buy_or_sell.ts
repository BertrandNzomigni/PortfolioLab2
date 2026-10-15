"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

type TransactionType = "buy" | "sell";

type TransactionResult =
    | {
        success: true;
    }
    | {
        success: false;
        error: string;
    };



/** 
 * Achète ou vend des actions d'une entreprise au dernier prix de fermeture.
 * @param {number} companyId Identifiant de l'entreprise
 * @param {TransactionType} transactionType Type de transaction
 * @param {number} quantity Quantité d'actions transmises
*/
export default async function buyOrSell(
    companyId: number,
    transactionType: TransactionType,
    quantity: number
): Promise<TransactionResult> {

    // Validate input before touching the database
    if (!Number.isInteger(quantity) || quantity <= 0) {
        return {
            success: false,
            error: "Quantity must be a positive integer",
        };
    }

    if (transactionType !== "buy" && transactionType !== "sell") {
        return {
            success: false,
            error: "Invalid transaction type",
        };
    }

    // Authenticate first
    const session = await auth();

    const email = session?.user?.email;

    if (!email) {
        return {
            success: false,
            error: "User not authenticated",
        };
    }

    try {
        await prisma.$transaction(async (tx) => {

            // Get the user once, including everything we need
            const user = await tx.user.findUnique({
                where: {
                    email,
                },
                select: {
                    id: true,
                    money: true,
                },
            });

            if (!user) {
                throw new Error("User not found");
            }

            // Get company and latest stock price
            const company = await tx.company.findUnique({
                where: {
                    id: companyId,
                },
                select: {
                    name: true,
                    stockPrices: {
                        orderBy: {
                            datetime: "desc",
                        },
                        take: 1,
                        select: {
                            closePrice: true,
                        },
                    },
                },
            });

            if (!company) {
                throw new Error("Company not found");
            }

            const price = company.stockPrices[0]?.closePrice;

            if (price == null) {
                throw new Error("Company stock price not available");
            }

            // Keep the calculation as Prisma Decimal
            const totalCost = price.mul(quantity);

            // Get current ownership
            const ownership = await tx.stockOwnership.findUnique({
                where: {
                    userId_companyId: {
                        userId: user.id,
                        companyId,
                    },
                },
                select: {
                    quantity: true,
                },
            });

            if (transactionType === "buy") {

                // Check that the user can afford the purchase
                if (user.money.lt(totalCost)) {
                    throw new Error(
                        "Insufficient funds to complete the purchase"
                    );
                }

                // Deduct money
                await tx.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        money: {
                            decrement: totalCost,
                        },
                    },
                });

                // Create ownership if necessary, otherwise increment it
                await tx.stockOwnership.upsert({
                    where: {
                        userId_companyId: {
                            userId: user.id,
                            companyId,
                        },
                    },
                    create: {
                        userId: user.id,
                        companyId,
                        quantity,
                    },
                    update: {
                        quantity: {
                            increment: quantity,
                        },
                    },
                });

            } else {

                // SELL

                if (!ownership || ownership.quantity < quantity) {
                    throw new Error(
                        "Insufficient stock to complete the sale"
                    );
                }

                // Remove shares
                await tx.stockOwnership.update({
                    where: {
                        userId_companyId: {
                            userId: user.id,
                            companyId,
                        },
                    },
                    data: {
                        quantity: {
                            decrement: quantity,
                        },
                    },
                });

                // Add money
                await tx.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        money: {
                            increment: totalCost,
                        },
                    },
                });
            }

            await tx.transaction.create({
                data: {
                    userId: user.id,
                    companyId,
                    quantity,
                    price,
                    datetime: new Date(),
                    type: transactionType,
                },
            });
        });

        return {
            success: true,
        };

    } catch (error) {

        if (error instanceof Error) {
            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: false,
            error: "An unexpected error occurred",
        };
    }
}