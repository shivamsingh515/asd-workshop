const db = require('../database/db');

async function getAll() {
  return await db.readDb();
}

async function getById(id) {
  const products = await db.readDb();
  const product = products.find((p) => p.id === id);
  return product || null;
}

async function create(productData) {
  const products = await db.readDb();
  const maxId = products.reduce((max, p) => (p.id > max ? p.id : max), 0);
  const newProduct = {
    id: maxId + 1,
    name: productData.name,
    price: productData.price
  };
  products.push(newProduct);
  await db.writeDb(products);
  return newProduct;
}

async function replace(id, productData) {
  const products = await db.readDb();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return null;
  }
  const replacedProduct = {
    id,
    name: productData.name,
    price: productData.price
  };
  products[index] = replacedProduct;
  await db.writeDb(products);
  return replacedProduct;
}

async function update(id, updates) {
  const products = await db.readDb();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return null;
  }
  const updatedProduct = { ...products[index] };
  if (updates.name !== undefined) {
    updatedProduct.name = updates.name;
  }
  if (updates.price !== undefined) {
    updatedProduct.price = updates.price;
  }
  products[index] = updatedProduct;
  await db.writeDb(products);
  return updatedProduct;
}

async function deleteProduct(id) {
  const products = await db.readDb();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return false;
  }
  products.splice(index, 1);
  await db.writeDb(products);
  return true;
}

module.exports = {
  getAll,
  getById,
  create,
  replace,
  update,
  deleteProduct
};

