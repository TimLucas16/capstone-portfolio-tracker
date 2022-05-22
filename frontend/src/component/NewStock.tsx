import {Stock} from "../model/Stock";
import {FormEvent, useState} from "react";

type NewStockProps = {
    addStock : (newStock : Stock) => void
}

export default function NewStock({addStock} : NewStockProps) {

    const [name, setName] = useState<string>("")
    const [symbol, setSymbol] = useState<string>("")
    const [amount, setAmount] = useState<number>(0)
    const [price, setPrice] = useState<number>(0)

    const submit = (event : FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if(!name || !symbol) {
            alert("Bitte bei Name oder Symbol etwas eingeben!")
        }
        if(amount <= 0 || price <= 0) {
            alert("Bitte bei Amount oder Course eine Zahl größer 0 eingeben!")
        }
        const newStock : Stock = {
            symbol : symbol,
            name : name,
            shares : amount,
            price : price
        }
        addStock(newStock)
    }

    return (
        <form onSubmit={submit}>
            <input type="text" placeholder={"Name"} value={name} onChange={event => setName(event.target.value)}/>
            <input type="text" placeholder={"symbol"} value={symbol} onChange={event => setSymbol(event.target.value)}/>
            <input type="number" placeholder={"amount"} value={amount} onChange={event => setAmount(Number(event.target.value))}/>
            <input type="number" placeholder={"price"} value={price} onChange={event => setPrice(Number(event.target.value))}/>
            <button type={"submit"}>submit</button>
        </form>
    )
}