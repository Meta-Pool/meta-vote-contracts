export const getNearDollarPrice = async () => {
    let result = await fetch("https://api.diadata.org/v1/quotation/NEAR");
    let response = await result.json();
    return response.Price;
  };
  