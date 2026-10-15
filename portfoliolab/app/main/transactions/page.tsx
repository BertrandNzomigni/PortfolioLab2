import TransactionsData from "../../components/transactionsData";
import SearchBar from "../../components/searchBar";
import SliceButtons from "../../components/slice_buttons";

export default async function Home({searchParams}: {searchParams: {search1?: string,sliceIndice1?: string}}) {
  const { search1, sliceIndice1} = await searchParams;
  return (
    <main>
      <h1>Transactions</h1>
      <SearchBar placeholder="Search a transaction..." id={1}/>
      <SliceButtons id={1}></SliceButtons>
      <table style={{borderCollapse: 'separate',borderSpacing: '10px 0'}}>
        <thead>
          <tr>
            <th>Company</th><th>Type</th><th>Quantity</th><th>Price</th><th>Total value</th><th>Date</th>
          </tr>
        </thead>
        <TransactionsData searchText={search1} sliceIndice={Number(sliceIndice1)}></TransactionsData>
      </table>
    </main>
  );
}