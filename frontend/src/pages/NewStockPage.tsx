import {FormEvent, useEffect, useState} from "react";
import {StockDto} from "../model/StockDto";
import {SearchStock} from "../model/SearchStock";
import SearchCard from "../component/SearchCard";
import "../styles/NewStockPage.css";
import {useNavigate} from "react-router-dom";
import {Stock} from "../model/Stock";

type NewStockProps = {
    addStock: (newStock: StockDto) => void
    searchForStock: (companyName: string) => void
    stockList: SearchStock[]
    updateStock: (updateStock: StockDto) => void
    stocks: Stock[]
}

export default function NewStockPage({addStock, searchForStock, stockList, updateStock, stocks}: NewStockProps) {
    const navigate = useNavigate()

    const [symbol, setSymbol] = useState<string>("")
    const [amount, setAmount] = useState<number>(0)
    const [costPrice, setCostPrice] = useState<number>(0)
    const [companyName, setCompanyName] = useState<string>("")

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!symbol) {
            alert("kein Symbol eingeben!")
        }
        if (amount <= 0 || costPrice <= 0) {
            alert("Bitte bei Amount oder Course eine Zahl größer 0 eingeben!")
        }

        if (!stocks.map(item => item.symbol).includes(symbol)) {
            const newStock: StockDto = {
                symbol: symbol,
                shares: amount,
                costPrice: costPrice
            }
            addStock(newStock)
            navigate(-1)
        } else {
            const stockChanges: StockDto = {
                symbol: symbol,
                shares: amount,
                costPrice: costPrice
            }
            updateStock(stockChanges)
            navigate(-1)
        }
    }

    const search = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        searchForStock(companyName)
    }

    useEffect(() => {
        stockList.length = 0
    }, [symbol, stockList])

    return (
        <div>
            <form className={"search-form"} onSubmit={search}>
                <input type="text" placeholder={"company"} value={companyName}
                       onChange={event => setCompanyName(event.target.value)}/>
                <button className={"addPage-button search-button"} type={"submit"}>search</button>
            </form>

            <div> {stockList.map(stock => <SearchCard stock={stock} key={stock.symbol}
                                                      selectStock={() => setSymbol(stock.symbol)}/>)} </div>

            <form className={"add-form"} onSubmit={submit}>
                <div>
                    <input type="text" placeholder={"symbol"} value={symbol}
                           onChange={event => setSymbol(event.target.value.toUpperCase()) }/>
                    <input type="number" placeholder={"amount"}
                           onChange={event => setAmount(Number(event.target.value))}/>
                    <input type="number" step="0.01" placeholder={"costPrice"}
                           onChange={event => setCostPrice(Number(event.target.value))}/>
                </div>
                <button className={"addPage-button"} type={"submit"}>submit</button>
            </form>
        </div>
    )
}
