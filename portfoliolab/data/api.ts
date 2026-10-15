import { prisma } from "../lib/prisma";

const API_URL = "https://api.twelvedata.com/time_series";

const OUTPUT_SIZE = 300;

// Une seule requête Twelve Data à la fois.
// Augmente cette valeur uniquement si ton plan Twelve Data
// autorise suffisamment de requêtes.
const REQUEST_INTERVAL = 1500;

const MAX_RETRIES = 3;

// Si Twelve Data retourne un 429 sans Retry-After,
// on attend au minimum cette durée.
const RATE_LIMIT_DELAY = 60_000;

const apiKey: string = process.env.TWELVE_KEY ?? "";

if (!apiKey) {
    throw new Error("TWELVE_KEY is not defined");
}

type TwelveDataValue = {
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
};

type TwelveDataResponse = {
    status?: string;
    code?: number;
    message?: string;
    values?: TwelveDataValue[];
};

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Garantit un délai minimum entre deux requêtes Twelve Data.
 */
let lastRequestTime = 0;

async function waitForRateLimit(): Promise<void> {
    const now = Date.now();

    const elapsed = now - lastRequestTime;

    if (elapsed < REQUEST_INTERVAL) {
        await sleep(REQUEST_INTERVAL - elapsed);
    }

    lastRequestTime = Date.now();
}

/**
 * Récupère les 300 dernières bougies d'un symbole.
 */
async function fetchStockPrices(
    symbol: string
): Promise<TwelveDataValue[]> {

    const url = new URL(API_URL);

    url.searchParams.set("symbol", symbol);
    url.searchParams.set("interval", "1day");
    url.searchParams.set("outputsize", OUTPUT_SIZE.toString());
    url.searchParams.set("apikey", apiKey);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {

        try {

            await waitForRateLimit();

            const response = await fetch(url);

            /**
             * Rate limit Twelve Data.
             */
            if (response.status === 429) {

                const retryAfter =
                    response.headers.get("retry-after");

                const delay = retryAfter
                    ? Number(retryAfter) * 1000
                    : RATE_LIMIT_DELAY;

                console.warn(
                    `[${symbol}] Rate limit (429). ` +
                    `Waiting ${delay / 1000}s...`
                );

                await sleep(delay);

                continue;
            }

            /**
             * Autres erreurs HTTP.
             */
            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status} ${response.statusText}`
                );
            }

            const data: TwelveDataResponse =
                await response.json();

            /**
             * Twelve Data peut retourner HTTP 200
             * mais indiquer une erreur dans le JSON.
             */
            if (data.status === "error") {
                throw new Error(
                    `Twelve Data error ${data.code ?? ""}: ${
                        data.message ?? "Unknown error"
                    }`
                );
            }

            /**
             * Vérification de la présence des données.
             */
            if (!data.values) {
                throw new Error(
                    `No values returned for ${symbol}`
                );
            }

            return data.values;

        } catch (error) {

            console.error(
                `[${symbol}] Attempt ${attempt}/${MAX_RETRIES} failed:`,
                error
            );

            if (attempt === MAX_RETRIES) {
                throw error;
            }

            /**
             * Backoff :
             *
             * tentative 1 → 5 s
             * tentative 2 → 10 s
             */
            const delay = 5_000 * attempt;

            console.log(
                `[${symbol}] Retrying in ${delay / 1000}s...`
            );

            await sleep(delay);
        }
    }

    throw new Error(
        `[${symbol}] Maximum retries reached`
    );
}

/**
 * Transforme les données Twelve Data
 * en objets compatibles avec Prisma.
 */
function mapStockPrices(
    companyId: number,
    values: TwelveDataValue[]
) {

    return values.map((stockPrice) => {

        const datetime = new Date(
            `${stockPrice.datetime}T00:00:00Z`
        );

        if (Number.isNaN(datetime.getTime())) {
            throw new Error(
                `Invalid datetime: ${stockPrice.datetime}`
            );
        }

        return {
            companyId,

            datetime,

            openPrice: Number(stockPrice.open),

            highPrice: Number(stockPrice.high),

            lowPrice: Number(stockPrice.low),

            closePrice: Number(stockPrice.close),

            volume: Number.parseInt(
                stockPrice.volume,
                10
            ),
        };
    });
}

/**
 * Récupère une entreprise et insère ses prix.
 */
export async function processCompany(
    company: {
        id: number;
        symbol: string;
    },
    index: number,
    total: number
): Promise<number> {

    console.log(
        `\n[${index}/${total}] ` +
        `[${company.symbol}] Fetching data...`
    );

    const values = await fetchStockPrices(
        company.symbol
    );

    const stockPrices = mapStockPrices(
        company.id,
        values
    );

    if (stockPrices.length === 0) {

        console.log(
            `[${company.symbol}] No stock prices found`
        );

        return 0;
    }

    /**
     * skipDuplicates nécessite une contrainte
     * unique sur :
     *
     * companyId + datetime
     *
     * dans schema.prisma :
     *
     * @@unique([companyId, datetime])
     */
    const result = await prisma.stockPrice.createMany({
        data: stockPrices,
        skipDuplicates: true,
    });

    console.log(
        `[${index}/${total}] ` +
        `[${company.symbol}] ` +
        `${result.count}/${stockPrices.length} prices inserted`
    );

    return result.count;
}

/**
 * Programme principal.
 */
async function main() {

    const companies = await prisma.company.findMany({
        select: {
            id: true,
            symbol: true,
        },
        orderBy: {
            id: "asc",
        },
    });

    const total = companies.length;

    console.log(
        `\n${total} companies found`
    );

    console.log(
        `Importing ${OUTPUT_SIZE} daily prices per company`
    );

    console.log(
        `Request interval: ${REQUEST_INTERVAL} ms`
    );

    let totalInserted = 0;
    let successCount = 0;
    let failedCount = 0;

    const failedCompanies: string[] = [];

    for (let i = 0; i < companies.length; i++) {

        const company = companies[i];

        try {

            const inserted = await processCompany(
                company,
                i + 1,
                total
            );

            totalInserted += inserted;
            successCount++;

        } catch (error) {

            failedCount++;

            failedCompanies.push(
                company.symbol
            );

            console.error(
                `\n[${company.symbol}] FAILED`
            );

            console.error(error);
        }
    }

    console.log("\n==============================");
    console.log("IMPORT FINISHED");
    console.log("==============================");

    console.log(
        `Companies: ${total}`
    );

    console.log(
        `Successful: ${successCount}`
    );

    console.log(
        `Failed: ${failedCount}`
    );

    console.log(
        `Prices inserted: ${totalInserted}`
    );

    if (failedCompanies.length > 0) {

        console.log(
            "\nFailed companies:"
        );

        console.log(
            failedCompanies.join(", ")
        );
    }
}


async function run(){
    try {

        await main();

    } catch (error) {

        console.error(
            "\nFatal error:",
            error
        );

        process.exitCode = 1;

    } finally {

        await prisma.$disconnect();
    }
}

await run();
