const axios = require('axios');

export const calculateProfitLoss = ({
    symbol,
    openPrice,
    closePrice,
    direction,
    platform,
    volume
}: {
    symbol: string,
    openPrice: string,
    closePrice: string,
    direction: string,
    platform: string,
    volume: string,
}) => {
    const FormData = require('form-data');
    let data = new FormData();
    data.append('symbol', symbol);
    data.append('open_price', openPrice);
    data.append('currency', 'USD');
    data.append('close_price', closePrice);
    data.append('period', '1');
    data.append('volume', volume);
    data.append('direction', direction);
    data.append('label', platform);
    data.append('platform', platform);

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://www.octafx.com/markets/calculate/profit',
        headers: {
            'Cookie': 'forcedlang=en; geo_ip_country_code=NGA; ref=direct',
            ...data.getHeaders()
        },
        data: data
    };


    return new Promise((resolve, reject) => {
        axios.request(config).then(({ data }: any) => resolve(data))
    })
}

export const calculateRiskLotSize = async ({
    symbol,
    openPrice,
    closePrice,
    direction,
    platform,
    riskAmount
}: {
    symbol: string,
    openPrice: string | number,
    closePrice: string | number,
    direction: string,
    platform: string,
    riskAmount: string | number,
}): Promise<{
    grossProfit: number;
    commission: number;
    tradingFees: number;
    profit: number;
    riskAmount: number;
    lotSize: number;
}> => {
    const FormData = require('form-data');
    let data = new FormData();
    data.append('symbol', symbol);
    data.append('open_price', openPrice);
    data.append('currency', 'USD');
    data.append('close_price', closePrice);
    data.append('period', '1');
    data.append('volume', '1.00');
    data.append('direction', direction);
    data.append('label', platform);
    data.append('platform', platform);

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://www.octafx.com/markets/calculate/profit',
        headers: {
            'Cookie': 'forcedlang=en; geo_ip_country_code=NGA; ref=direct',
            ...data.getHeaders()
        },
        data: data
    };

    const response = (await axios.request(config)).data
    const lotSize = Number(parseFloat(`${Math.abs((1 / Number(response.grossProfit)) * Number(riskAmount))}`).toFixed(2))
    // const calculated = await calculateProfitLoss({ symbol: 'EURUSD', openPrice: "1.09819", closePrice: "1.09600", direction: 'buy', platform: 'mt5' })
    console.log({ ...response, riskAmount, lotSize })
    return { ...response, riskAmount, lotSize }

}