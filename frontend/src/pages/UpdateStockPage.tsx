import {StockDto} from "../model/StockDto";
import {useNavigate, useParams} from "react-router-dom";
import {FormEvent, useEffect, useState} from "react";
import {Stock} from "../model/Stock";
import "../styles/UpdateStockPage.css";
import toast from 'react-hot-toast';

type UpdateProps = {
    updateStock: (updateStock: StockDto) => void
    getStockById: (id: string) => void
    stock: Stock
}

export default function UpdateStockPage({updateStock, getStockById, stock}: UpdateProps) {
    const {id} = useParams()
    const navigate = useNavigate()

    const [amount, setAmount] = useState<number>(0)
    const [costPrice, setCostPrice] = useState<number>(0)
    const [radio, setRadio] = useState<string>("")

    useEffect(() => {
        if (id) {
            getStockById(id)
        }// eslint-disable-next-line
    }, [])

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (amount <= 0 || costPrice <= 0 || !radio) {
            toast.error("please correct input!")
        } else
            if (radio === "plus") {
                const stockChanges: StockDto = {
                    symbol: stock.symbol,
                    shares: amount,
                    costPrice: costPrice
                }
                updateStock(stockChanges)
                navigate(-1)
            } else
                if (amount > stock.shares) {
                    toast(`you just have ${stock.shares} shares`)
                } else {
                    const stockChange: StockDto = {
                        symbol: stock.symbol,
                        shares: -amount,
                        costPrice: -costPrice
                    }
                    updateStock(stockChange)
                    navigate(-1)
                }
    }

    return (
        <div className={"container-edit-info"}>
            <div className={"container-layout"}>
                <div className={"stock-details-container"}>
                    <div>
                        <a href={stock.website}>
                            <img className={"editPage-logo"} src={stock.image} alt={stock.companyName}/>
                        </a>
                    </div>
                    <div>
                        <div>{stock.companyName}</div>
                        <div>{stock.shares} shares</div>
                    </div>
                </div>
            </div>

            <div className={"container-edit-input"}>
                <div className={"edit-select"}>
                    <button onClick={() => setAmount(stock.shares)}
                            className={"addPage-button editPage-button"}>select all
                    </button>
                    <div className={"labels"}>
                        <input id={"buy"} type="radio" value={"plus"} name={"action"}
                               onChange={event => setRadio(event.target.value)}/>
                        <label id={"id"} className={"edit-label"} htmlFor={"buy"}>buy</label>

                        <input id={"sell"} type="radio" value={"minus"} name={"action"}
                               onChange={event => setRadio(event.target.value)}/>
                        <label className={"edit-label"} htmlFor={"sell"}>sell</label>
                    </div>
                </div>
                <form className={"update-form"} onSubmit={submit}>
                    <input type="hidden" value={stock.symbol} disabled/>

                    <input type="number" placeholder={"amount"} value={amount}
                           onChange={event => setAmount(Number(event.target.value))}/>

                    <input type="number" step="0.01" placeholder={"costPrice"}
                           onChange={event => setCostPrice(Number(event.target.value))}/>
                    <button type={"submit"} id={"edit-button"} className={"addPage-button editPage-button"}>submit
                    </button>
                </form>
            </div>
        </div>
    )
}
