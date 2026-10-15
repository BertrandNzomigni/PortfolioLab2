import PriceHistory from "./price_history";

export default async function PriceHistoryTable({companyId} : {companyId : number}){
    return(
    <table style={{borderCollapse: 'separate',borderSpacing: '10px 0'}}>
      <thead>
        <tr>
          <th>Date</th><th>Close price</th><th>High price</th><th>Low price</th><th>Open price</th>
        </tr>
      </thead>
      <PriceHistory companyId={companyId} />
    </table>
    )
}