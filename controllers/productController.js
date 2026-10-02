const productService = require('../services/productService');

function parseIntegerId(param) {
  if (typeof param !== 'string' || !/^-?\d+$/.test(param)) {
    return null;
  }
  const id = parseInt(param, 10);
  return Number.isSafeInteger(id) ? id : null;
}

async function getAllProducts(req, res, next) {
  try {
    const products = await productService.getAll();
    return res.status(200).json(products);
  } catch (err) {
    next(err);
  }
}

async function getProductById(req, res, next) {
  try {
    const id = parseIntegerId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: 'ID must be an integer' });
    }

    const product = await productService.getById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.status(200).json(product);
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const { name, price } = req.body || {};

    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Name must be a non-empty string' });
    }

    if (typeof price !== 'number' || Number.isNaN(price) || price < 0) {
      return res.status(400).json({ error: 'Price must be a number greater than or equal to 0' });
    }

    const newProduct = await productService.create({
      name: name.trim(),
      price
    });

    return res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
}

async function replaceProduct(req, res, next) {
  try {
    const id = parseIntegerId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: 'ID must be an integer' });
    }

    const { name, price } = req.body || {};

    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Name must be a non-empty string' });
    }

    if (typeof price !== 'number' || Number.isNaN(price) || price < 0) {
      return res.status(400).json({ error: 'Price must be a number greater than or equal to 0' });
    }

    const replacedProduct = await productService.replace(id, {
      name: name.trim(),
      price
    });

    if (!replacedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.status(200).json(replacedProduct);
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const id = parseIntegerId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: 'ID must be an integer' });
    }

    const { name, price } = req.body || {};

    if (name === undefined && price === undefined) {
      return res.status(400).json({ error: 'At least one of name or price must be provided' });
    }

    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return res.status(400).json({ error: 'Name must be a non-empty string' });
    }

    if (price !== undefined && (typeof price !== 'number' || Number.isNaN(price) || price < 0)) {
      return res.status(400).json({ error: 'Price must be a number greater than or equal to 0' });
    }

    const updates = {};
    if (name !== undefined) {
      updates.name = name.trim();
    }
    if (price !== undefined) {
      updates.price = price;
    }

    const updatedProduct = await productService.update(id, updates);
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.status(200).json(updatedProduct);
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const id = parseIntegerId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: 'ID must be an integer' });
    }

    const deleted = await productService.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  replaceProduct,
  updateProduct,
  deleteProduct
};

