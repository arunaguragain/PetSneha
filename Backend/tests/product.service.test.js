jest.mock('../src/repositories/product.repository', () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn(),
  findBySellerUserId: jest.fn(),
}));

const productRepository = require('../src/repositories/product.repository');
const productService = require('../src/services/product.service');

describe('product service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('builds a filter for marketplace products', async () => {
    productRepository.findAll.mockResolvedValue([]);

    await productService.listProducts({ category: 'food', search: 'dog', petType: 'dog', minPrice: '100', maxPrice: '500' });

    expect(productRepository.findAll).toHaveBeenCalledWith(expect.objectContaining({
      category: 'food',
      petType: 'dog',
      name: { $regex: 'dog', $options: 'i' },
      price: { $gte: 100, $lte: 500 },
      isVerifiedSeller: true,
    }), '-createdAt');
  });

  it('allows admins to create products and mark them as verified sellers', async () => {
    productRepository.create.mockResolvedValue({ id: 'p1' });

    const result = await productService.createProduct({ role: 'admin', id: 'admin-1' }, { name: 'Food', price: 200 }, []);

    expect(productRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Food',
      price: 200,
      isVerifiedSeller: true,
      sellerId: 'admin-1',
    }));
    expect(result).toEqual({ id: 'p1' });
  });

  it('blocks a vet from updating someone else product', async () => {
    productRepository.findById.mockResolvedValue({ sellerId: { toString: () => 'another-vet' } });

    await expect(productService.updateProduct({ role: 'vet', id: 'vet-1' }, 'p1', { name: 'Updated' }, [])).rejects.toMatchObject({
      statusCode: 403,
      message: 'You can only update your own product.',
    });
  });

  it('returns products for the current seller', async () => {
    productRepository.findBySellerUserId.mockResolvedValue([{ id: 'p1' }]);

    const result = await productService.getMyProducts({ id: 'vet-1' });

    expect(productRepository.findBySellerUserId).toHaveBeenCalledWith('vet-1');
    expect(result).toEqual([{ id: 'p1' }]);
  });
});
