package de.neuefische.backend.service;

import de.neuefische.backend.dto.CreateStockDto;
import de.neuefische.backend.model.DailyUpdate;
import de.neuefische.backend.model.Portfolio;
import de.neuefische.backend.model.SearchStock;
import de.neuefische.backend.model.Stock;
import de.neuefische.backend.repository.DailyUpdateRepo;
import de.neuefische.backend.repository.StockRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class StockService {

    private final StockRepo repo;
    private final DailyUpdateRepo dURepo;
    private final ApiService apiService;

    @Autowired
    public StockService(StockRepo repo, DailyUpdateRepo dURepo, ApiService apiService) {
        this.repo = repo;
        this.dURepo = dURepo;
        this.apiService = apiService;
    }

    public Stock addNewStock(CreateStockDto newStock) {
        if (newStock.getShares().max(new BigDecimal("0")).equals(new BigDecimal("0")) || newStock.getCostPrice().max(new BigDecimal("0")).equals(new BigDecimal("0")) || newStock.getSymbol() == null) {
            throw new IllegalArgumentException("shares or coastPrice was 0 or less");
        }
        Stock apiStock = apiService.getProfileBySymbol(newStock.getSymbol());
        Stock stock = Stock.builder()
                .symbol(newStock.getSymbol())
                .shares(newStock.getShares())
                .costPrice(newStock.getCostPrice())
                .value(calcValue(apiStock.getPrice(), newStock.getShares()))
                .companyName(apiStock.getCompanyName())
                .website(apiStock.getWebsite())
                .image(apiStock.getImage())
                .price(apiStock.getPrice())
                .isin(apiStock.getIsin())
                .totalReturn(calcTotalReturn((calcValue(apiStock.getPrice(), newStock.getShares())), newStock.getCostPrice()))
                .totalReturnPercent(calcTotalReturnPercent
                        (calcTotalReturn(
                        (calcValue(apiStock.getPrice(), newStock.getShares())),
                                newStock.getCostPrice()),
                                newStock.getCostPrice()))
                .build();
        return repo.insert(stock);
    }

    public List<Stock> getAllStocks() {
        checkForDailyUpdate();
        return repo.findAll();
    }

    public List<String> getAllSymbols() {
        return repo.findAll().stream()
                .map(Stock::getSymbol)
                .toList();
    }

    public Stock updateStock(CreateStockDto updatedStock) {
        Stock toUpdateStock = repo.findBySymbol(updatedStock.getSymbol());

        if (toUpdateStock.getShares().add(updatedStock.getShares()).equals(BigDecimal.ZERO)) {
            repo.deleteById(toUpdateStock.getId());
            return null;
        }

        toUpdateStock.setShares(toUpdateStock.getShares().add(updatedStock.getShares()));
        toUpdateStock.setCostPrice(toUpdateStock.getCostPrice().add(updatedStock.getCostPrice()));
        toUpdateStock.setValue(calcValue(toUpdateStock.getPrice(), toUpdateStock.getShares()));
        toUpdateStock.setTotalReturn(calcTotalReturn(calcValue(toUpdateStock.getPrice(), toUpdateStock.getShares()), toUpdateStock.getCostPrice()));
        toUpdateStock.setTotalReturnPercent(calcTotalReturnPercent(toUpdateStock.getTotalReturn(), toUpdateStock.getCostPrice()));
        repo.save(toUpdateStock);

        return toUpdateStock;
    }

    public Stock getStockById(String id) {
        return repo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Stock with id: " + id + " not found!"));
    }

    public List<SearchStock> stockSearchResult(String company) {
        return apiService.stockSearchResult(company);
    }

    public Portfolio getPortfolioValues() {
        return Portfolio.builder()
                .pfValue(calcPortfolioValue())
                .pfTotalReturnAbsolute(calcPfTotalReturnAbs())
                .pfTotalReturnPercent(calcPfTotalReturnPercent())
                .build();
    }

    public void refreshStockDatas(List<Stock> stockList) {

        for (Stock stock : stockList) {
            Stock tempStock = repo.findBySymbol(stock.getSymbol());
            tempStock.setPrice(stock.getPrice());
            tempStock.setValue(calcValue(stock.getPrice(), tempStock.getShares()));
            tempStock.setTotalReturn(calcTotalReturn((calcValue(stock.getPrice(), tempStock.getShares())), tempStock.getCostPrice()));
            repo.save(tempStock);
        }
    }

    public List<Stock> getUpdatedStock() {
        List<String> symbolList = getAllSymbols();
        return apiService.getPrice(symbolList);
    }

    public void checkForDailyUpdate() {
        String name = "Portfolio";
        if (!dURepo.existsByName(name)) {
            dURepo.save(DailyUpdate.builder()
                    .name(name)
                    .updateDay(LocalDate.of(2022, 5, 25))
                    .build());
        }

        LocalDate dateTimer = dURepo.findByName(name).getUpdateDay();

        if (!dateTimer.isEqual(LocalDate.now())) {
            refreshStockDatas(getUpdatedStock());
            DailyUpdate newDate = dURepo.findByName(name);
            newDate.setUpdateDay(LocalDate.now());
            dURepo.save(newDate);
        }
    }

    public static BigDecimal calcValue(BigDecimal price, BigDecimal shares) {
        return price.multiply(shares);
    }

    public static BigDecimal calcTotalReturn(BigDecimal value, BigDecimal costPrice) {
        return value.subtract(costPrice);
    }

    public BigDecimal calcTotalReturnPercent(BigDecimal totalReturn, BigDecimal costPrice) {
        if(costPrice.equals(BigDecimal.ZERO)) {
            return new BigDecimal("100");
        }
        return totalReturn.divide(costPrice, 4, RoundingMode.HALF_DOWN).multiply(new BigDecimal("100"));
    }

    public BigDecimal calcPortfolioValue() {
        return repo.findAll().stream().map(Stock::getValue).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal calcPfTotalReturnAbs() {
        List<Stock> stockList = repo.findAll();
        return calcTotalReturn(
                stockList.stream()
                        .map(Stock::getValue)
                        .reduce(BigDecimal.ZERO, BigDecimal::add),
                stockList.stream()
                        .map(Stock::getCostPrice)
                        .reduce(BigDecimal.ZERO, BigDecimal::add));
    }

    public BigDecimal calcPfTotalReturnPercent() {
        BigDecimal calculatedCostPrice = repo.findAll().stream()
                .map(Stock::getCostPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if(calculatedCostPrice.equals(BigDecimal.ZERO)) {
            return BigDecimal.ZERO;
        } else {
            return calcPfTotalReturnAbs().
                    divide(calculatedCostPrice, 4, RoundingMode.HALF_DOWN)
                    .multiply(new BigDecimal("100"));
        }
    }

}
