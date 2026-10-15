
type PageProps = {
  params: Promise<{
    companyId: string
  }>
}
import GoBackButton from "@/app/components/goBackButton";
import { companyName, companySector, companySubindustry, companyHeadquarter, companyFoundationYear } from "@/app/actions/companyField";
import PriceHistory from "@/app/components/price_history";


export default async function Page({ params }: PageProps) {

  const companyId = Number(await (await params).companyId);

  return (
    <div>
      <h1>Details page</h1>
      <p>Company : {companyName(companyId)}</p>
      <p>Sector : {await companySector(companyId)}</p>
      <p>Subindustry : {await companySubindustry(companyId)}</p>
      <p>Headquarters : {await companyHeadquarter(companyId)}</p>
      <p>Foundation Year : {await companyFoundationYear(companyId)}</p>


    <h2>Price history</h2>

    <table style={{borderCollapse: 'separate',borderSpacing: '10px 0'}}>
      <thead>
        <tr>
          <th>Datetime</th><th>Close price</th><th>High price</th><th>Low price</th><th>Open price</th>
        </tr>
      </thead>
      <PriceHistory companyId={companyId} />
    </table>
    <GoBackButton />
    </div>
  );

}