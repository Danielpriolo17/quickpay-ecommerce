import axios from 'axios';

jest.mock('axios', () => {
  const instance = {
    get: jest.fn(),
    post: jest.fn(),
  };
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => instance),
    },
  };
});

import { apiService } from './api.service';

const mockHttp = (axios.create as jest.Mock).mock.results[0].value as {
  get: jest.Mock;
  post: jest.Mock;
};

describe('apiService', () => {
  beforeEach(() => {
    mockHttp.get.mockReset();
    mockHttp.post.mockReset();
  });

  it('getProducts fetches product list', async () => {
    const products = [{ id: 'p1', name: 'Item', priceInCents: 1000, stock: 3 }];
    mockHttp.get.mockResolvedValue({ data: { data: products } });

    const result = await apiService.getProducts();
    expect(mockHttp.get).toHaveBeenCalledWith('/products');
    expect(result).toEqual(products);
  });

  it('createTransaction posts customer, product and delivery data', async () => {
    const responseData = { transaction: { id: 'tx-1' } };
    mockHttp.post.mockResolvedValue({ data: { data: responseData } });

    const result = await apiService.createTransaction({
      productId: 'p1',
      quantity: 1,
      customer: {
        fullName: 'Juan Pérez',
        email: 'juan@test.com',
        phone: '+573001234567',
      },
      delivery: {
        address: 'Calle 10',
        city: 'Montería',
        department: 'Córdoba',
        postalCode: '',
      },
    });

    expect(mockHttp.post).toHaveBeenCalledWith(
      '/transactions',
      expect.objectContaining({
        productId: 'p1',
        quantity: 1,
        delivery: expect.objectContaining({ postalCode: undefined }),
      }),
    );
    expect(result).toEqual(responseData);
  });

  it('processPayment posts sanitized card payload', async () => {
    const responseData = { transaction: { id: 'tx-1', status: 'APPROVED' } };
    mockHttp.post.mockResolvedValue({ data: { data: responseData } });

    const result = await apiService.processPayment('tx-1', {
      number: '4242 4242 4242 4242',
      cardHolder: 'JUAN PEREZ',
      expMonth: '08',
      expYear: '29',
      cvc: '123',
      installments: 1,
    });

    expect(mockHttp.post).toHaveBeenCalledWith('/transactions/tx-1/pay', {
      installments: 1,
      card: {
        number: '4242424242424242',
        cvc: '123',
        expMonth: '08',
        expYear: '29',
        cardHolder: 'JUAN PEREZ',
      },
    });
    expect(result).toEqual(responseData);
  });

  it('getTransaction fetches transaction detail by id', async () => {
    const responseData = { transaction: { id: 'tx-1' }, delivery: null };
    mockHttp.get.mockResolvedValue({ data: { data: responseData } });

    const result = await apiService.getTransaction('tx-1');
    expect(mockHttp.get).toHaveBeenCalledWith('/transactions/tx-1');
    expect(result).toEqual(responseData);
  });
});