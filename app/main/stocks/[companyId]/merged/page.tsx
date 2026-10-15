type PageProps = {
  params: Promise<{
    companyId: string
  }>
}

import { prisma } from "@/lib/prisma";
import currentUserMoney from "@/app/actions/currentUserMoney";
import Transaction from "@/app/components/transaction";
import ownershipQuantity from "@/app/actions/ownership";
import userId from "@/app/actions/userId";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import GoBackButton from "@/app/components/goBackButton";
import { companyLastestPrice } from "@/app/actions/companyPrice";
import { companyName, companySector, companySubindustry, companyHeadquarter, companyFoundationYear } from "@/app/actions/companyField";
import PriceHistoryTable from "@/app/components/price_history_table";

export default async function Page({ params }: PageProps) {
  const companyId = Number(await (await params).companyId);
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true, stockPrices: true },
  });

  if (!company) {
    return <h1>Company not found</h1>;
  }

  const money = (await currentUserMoney());
  const currentUserId = await userId(session.user.email);
  const ownedQuantity = currentUserId == null ? 0 : await ownershipQuantity(currentUserId, companyId);
  const stock_price = await companyLastestPrice(companyId);

  return(<div>
            <div>
                <p>Company : {companyName(companyId)}</p>
                <p>Sector : {await companySector(companyId)}</p>
                <p>Subindustry : {await companySubindustry(companyId)}</p>
                <p>Headquarters : {await companyHeadquarter(companyId)}</p>
                <p>Foundation Year : {await companyFoundationYear(companyId)}</p>

                <PriceHistoryTable companyId={companyId}/>
            </div>
            <div>
                <div>You have {money.toString()}$ available to invest.</div>
                <p> You own {ownedQuantity} stocks of {company.name}. </p>
                <p> {stock_price != null ? `The price of each stock is ${stock_price.toString()}$.` : "No price is available for this stock yet."} </p>
                <Transaction companyid={companyId} companyName={company.name} />
                <GoBackButton></GoBackButton>
            </div>
        </div>
    )
}