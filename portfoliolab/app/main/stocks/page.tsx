import Company_data from "../../components/company_data";
import SearchBar from "../../components/searchBar";
import SliceButtons from "../../components/slice_buttons";

export default async function Home({searchParams}: {searchParams: {search1?: string, sliceIndice1?: string}}) {

    const { search1, sliceIndice1 } = await searchParams;

    return(
        <div>
            <h1>Stocks</h1>
            <SearchBar placeholder={"Search company..."} id={1}/>
            <SliceButtons id={1}/>
            <br/>
            <table style={{borderCollapse: 'separate',borderSpacing: '10px 0'}}>
                <thead>
                    <tr>
                        <th>Company</th><th>Price</th><th>Transactions</th><th>Details</th>
                    </tr>
                </thead>
                <Company_data searchText={search1} sliceIndice={Number(sliceIndice1) || 0}/>
            </table>
        </div>
    )
}

