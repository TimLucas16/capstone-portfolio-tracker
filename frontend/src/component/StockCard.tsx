import {Stock} from "../model/Stock";
import "../styles/StockCard.css";
import {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

type StockProp = {
    stock: Stock
    pfValue : number
}

export default function StockCard({stock, pfValue}: StockProp) {
    const navigate = useNavigate()

    const [allocation, setAllocation] = useState<number>(0)

    const allocationChanged = useCallback (() =>
        setAllocation((stock.value / pfValue)*100),[stock.value, pfValue]);

  useEffect(() => {
      allocationChanged()
  },[allocationChanged])

    return (
        <div className={"card-container"}>
            <div className={"card-details"}>
                <a className={"anker"} href={stock.website}>
                    <img className={"logo"} src={stock.image} alt={stock.companyName}/>
                </a>
                <div className={"name"}> {stock.companyName} </div>
                <div className={"shares"}> {stock.shares} </div>
                <div className={"price"}> {stock.price} $</div>
                <div className={"value"}> {(stock.value / 100).toFixed(2)} $</div>
                <div className={"total-return"}> {(stock.totalReturn / 100).toFixed(2)} $</div>
                <div className={"allocation"}> {allocation.toFixed(2)} %</div>
            </div>
            <button onClick={() => navigate(`/updateStock/${stock.id}`)} >add</button>
        </div>
    )
}