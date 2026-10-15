/**
 * Generates SIMULATED daily stock prices so the app is usable right after
 * startup, without a market data API key.
 *
 * - Only companies that have no price rows yet are filled, so real data
 *   imported with data/api.ts is never mixed with simulated data.
 * - Prices follow a geometric random walk, seeded by the company symbol:
 *   the same symbol always produces the same series shape.
 * - The series covers the last TRADING_DAYS weekdays up to today.
 *
 * These prices are NOT real market data.
 */
import { prisma } from "../lib/prisma";

const TRADING_DAYS = 300;
const BATCH_SIZE = 5000;

/** Small deterministic PRNG (mulberry32). */
function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** 32-bit FNV-1a hash of a string, used as the PRNG seed. */
function hash(text: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}

/** Standard normal sample (Box-Muller). */
function gaussian(random: () => number): number {
    const u = Math.max(random(), Number.EPSILON);
    const v = random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** The last `count` weekdays up to today (UTC), oldest first. */
function lastWeekdays(count: number): Date[] {
    const days: Date[] = [];
    const now = new Date();
    const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    while (days.length < count) {
        const weekday = day.getUTCDay();
        if (weekday !== 0 && weekday !== 6) {
            days.push(new Date(day));
        }
        day.setUTCDate(day.getUTCDate() - 1);
    }
    return days.reverse();
}

const round2 = (value: number) => Math.round(value * 100) / 100;

function simulateCompany(companyId: number, symbol: string, days: Date[]) {
    const random = mulberry32(hash(symbol));

    let close = 20 + random() * 480;              // starting price: 20–500 $
    const volatility = 0.01 + random() * 0.02;    // daily volatility: 1–3 %
    const drift = (random() - 0.4) * 0.002;       // slight upward bias on average
    const baseVolume = 1e6 + random() * 3e7;

    return days.map((datetime) => {
        const open = close * (1 + gaussian(random) * volatility * 0.3);
        close = Math.max(1, open * (1 + drift + gaussian(random) * volatility));
        const high = Math.max(open, close) * (1 + Math.abs(gaussian(random)) * volatility * 0.5);
        const low = Math.min(open, close) * (1 - Math.abs(gaussian(random)) * volatility * 0.5);

        return {
            companyId,
            datetime,
            openPrice: round2(open),
            highPrice: round2(high),
            lowPrice: round2(Math.max(0.01, low)),
            closePrice: round2(close),
            volume: BigInt(Math.round(baseVolume * (0.5 + random()))),
        };
    });
}

async function main() {
    if (process.env.SIMULATED_PRICES === "false") {
        console.log("SIMULATED_PRICES=false, skipping simulated prices.");
        return;
    }

    const companies = await prisma.company.findMany({
        where: { stockPrices: { none: {} } },
        select: { id: true, symbol: true },
        orderBy: { id: "asc" },
    });

    if (companies.length === 0) {
        console.log("Every company already has prices, nothing to simulate.");
        return;
    }

    const days = lastWeekdays(TRADING_DAYS);
    let rows: ReturnType<typeof simulateCompany> = [];
    let inserted = 0;

    for (const company of companies) {
        rows.push(...simulateCompany(company.id, company.symbol, days));

        if (rows.length >= BATCH_SIZE) {
            inserted += (await prisma.stockPrice.createMany({ data: rows, skipDuplicates: true })).count;
            rows = [];
        }
    }
    if (rows.length > 0) {
        inserted += (await prisma.stockPrice.createMany({ data: rows, skipDuplicates: true })).count;
    }

    console.log(
        `Simulated ${TRADING_DAYS} days of prices for ${companies.length} companies (${inserted} rows).`
    );
}

try {
    await main();
} catch (error) {
    console.error("Error:", error);
    process.exitCode = 1;
} finally {
    await prisma.$disconnect();
}
