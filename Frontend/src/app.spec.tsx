import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import App from './App';
import { store } from './app/store';
import { resetCheckout } from './feat/checkout/checkoutSlice';
import { apiService } from './services/api.service';
import '@testing-library/jest-dom';

jest.mock('./services/api.service', () => ({
  apiService: {
    getProducts: jest.fn(),
    createTransaction: jest.fn(),
    processPayment: jest.fn(),
    getTransaction: jest.fn(),
  },
}));

const mockedApi = apiService as jest.Mocked<typeof apiService>;

const sampleProduct = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Auriculares ANC Pro',
  description: 'Audio espacial de alta resolución',
  priceInCents: 24990000,
  stock: 10,
  imageUrl: 'https://img.test/anc.jpg',
};

describe('App Checkout Flow & Store Persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    store.dispatch(resetCheckout());
  });

  it('completes the full 5-step checkout flow from catalog to approved result and back', async () => {
    const pendingTx = {
      id: 'tx-1',
      reference: 'TXN-001',
      productId: sampleProduct.id,
      customerId: 'cust-1',
      quantity: 1,
      productAmountInCents: 24990000,
      baseFeeInCents: 300000,
      deliveryFeeInCents: 1000000,
      totalInCents: 26290000,
      status: 'PENDING' as const,
    };
    const approvedTx = {
      ...pendingTx,
      status: 'APPROVED' as const,
      externalTransactionId: 'ext-123',
      cardBrand: 'VISA',
      cardLastFour: '4242',
    };
    const delivery = {
      id: 'del-1',
      transactionId: 'tx-1',
      address: 'Calle 45 # 12-34',
      city: 'Montería',
      department: 'Córdoba',
      status: 'ASSIGNED' as const,
    };
    const updatedProduct = { ...sampleProduct, stock: 9 };

    mockedApi.getProducts.mockResolvedValue([sampleProduct]);
    mockedApi.createTransaction.mockResolvedValue({
      transaction: pendingTx,
      delivery,
      product: sampleProduct,
    });
    mockedApi.processPayment.mockResolvedValue({
      transaction: approvedTx,
      delivery,
      product: updatedProduct,
    });

    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );

    // Paso 1: Catálogo
    expect(await screen.findByText('Auriculares ANC Pro')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Pay with credit card'));

    // Paso 2: Modal de tarjeta y envío
    expect(screen.getByText('Datos de pago y envío')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Número de tarjeta'), {
      target: { value: '4242424242424242' },
    });
    fireEvent.change(screen.getByLabelText('Nombre en la tarjeta'), {
      target: { value: 'JUAN PEREZ' },
    });
    fireEvent.change(screen.getByLabelText('Mes (MM)'), {
      target: { value: '08' },
    });
    fireEvent.change(screen.getByLabelText('Año (AA)'), {
      target: { value: '29' },
    });
    fireEvent.change(screen.getByLabelText('CVC'), {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByLabelText('Nombre completo'), {
      target: { value: 'Juan Pérez' },
    });
    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'juan@test.com' },
    });
    fireEvent.change(screen.getByLabelText('Teléfono'), {
      target: { value: '+573001234567' },
    });
    fireEvent.change(screen.getByLabelText('Dirección'), {
      target: { value: 'Calle 45 # 12-34' },
    });
    fireEvent.change(screen.getByLabelText('Ciudad'), {
      target: { value: 'Montería' },
    });
    fireEvent.change(screen.getByLabelText('Departamento'), {
      target: { value: 'Córdoba' },
    });

    fireEvent.click(screen.getByText('Continuar al resumen de pago'));

    // Paso 3: Backdrop de resumen + verificación de persistencia en localStorage
    expect(screen.getByText('Resumen de tu pago')).toBeInTheDocument();
    expect(localStorage.getItem('quickpay_checkout_state_v1')).toContain(
      'SUMMARY_BACKDROP',
    );

    // Probar volver a editar y regresar al resumen
    fireEvent.click(screen.getByText('Editar datos'));
    expect(screen.getByText('Datos de pago y envío')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Continuar al resumen de pago'));

    // Paso 4: Ejecutar pago y mostrar resultado aprobado
    fireEvent.click(screen.getByRole('button', { name: /Pagar/i }));
    expect(await screen.findByText('¡Pago aprobado!')).toBeInTheDocument();

    // Paso 5: Volver a la tienda con stock actualizado
    mockedApi.getProducts.mockResolvedValue([updatedProduct]);
    fireEvent.click(screen.getByText(/Volver a la tienda/i));
    await waitFor(() => {
      expect(screen.getByText('9 disponibles')).toBeInTheDocument();
    });
  });
});