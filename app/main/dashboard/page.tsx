import totalPortfolioValue from "../../actions/total_portfolio_value";
import currentUserMoney from "@/app/actions/currentUserMoney";
import { OwnedStocksData } from "../../components/ownedstocksdata";
import SearchBar from "../../components/searchBar";
import SliceButtons from "../../components/slice_buttons";

export default async function Home({searchParams}: {searchParams: {search1?: string,sliceIndice1?: string}}) {
  const { search1,sliceIndice1 } = await searchParams;
  return (
    <main>
      <h1>Dashboard</h1>
      <p>Total portfolio value : {(await totalPortfolioValue()).toString()}$</p>
      <p> Available money : {(await currentUserMoney()).toString()}$</p>
      <p> Owned stocks </p>
      <SearchBar placeholder="Search a owned stock..." id={1}/>
      <SliceButtons id={1}></SliceButtons>
      <table style={{borderCollapse: 'separate',borderSpacing: '10px 0'}}>
        <thead>
          <tr>
            <th>Company</th><th>Quantity</th><th>Latest price</th><th>Total value</th>
          </tr>
        </thead>
        <OwnedStocksData searchText={search1} sliceIndice={Number(sliceIndice1)}></OwnedStocksData>
      </table>
    </main>
  );
}