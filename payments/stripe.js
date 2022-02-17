import initStripe from 'stripe';

const stripe = initStripe(process.env.PAYMENTS_SECRET_KEY);

export const createCustomer = async (email) =>
  await stripe.customers.create({
    email,
  });

export const getInvoices = async (customer) => {
  const invoices = await stripe.invoices.list({ customer });
  return invoices?.data;
};

export const getProducts = async () => {
  const products = await stripe.products.list();
  const prices = await stripe.prices.list();
  const productPrices = {};
  prices?.data.map((price) => (productPrices[price.product] = price));
  products?.data.map((product) => (product.prices = productPrices[product.id]));
  return products?.data.reverse();
};

export default stripe;
