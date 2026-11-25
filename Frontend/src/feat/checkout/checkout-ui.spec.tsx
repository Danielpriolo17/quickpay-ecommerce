import { fireEvent, render, screen } from '@testing-library/react';
import { CardBrandBadge } from '../../components/CardBrandBadge';
import { ProductListPage } from '../products/ProductListPage';
import { PaymentModal } from './PaymentModal';
import { PaymentResultPage } from './PaymentResultPage';
import { SummaryBackdrop } from './SummaryBackdrop';
import '@testing-library/jest-dom';

const product = {
  id: 'prod-1',
  name: 'Teclado Mecánico 75%',
  description: 'Switches táctiles',
  priceInCents: 31500000,
  stock: 5,
  imageUrl: 'https://img.test/kb.jpg',
};

describe('Checkout UI Components', () => {
  it('CardBrandBadge renders VISA, MasterCard and fallback', () => {
    const { rerender } = render(<CardBrandBadge brand="VISA" />);
    expect(screen.getByLabelText('VISA')).toBeInTheDocument();

    rerender(<CardBrandBadge brand="MASTERCARD" />);
    expect(screen.getByLabelText('MasterCard')).toBeInTheDocument();

    rerender(<CardBrandBadge brand="UNKNOWN" />);
    expect(screen.queryByLabelText('VISA')).not.toBeInTheDocument();
  });

  it('ProductListPage renders products, adjusts quantity and triggers payment', () => {
    const onPay = jest.fn();
    render(
      <ProductListPage
        products={[
          product,
          { ...product, id: 'prod-2', name: 'Mouse Gamer Agotado', stock: 0 },
        ]}
        loading={false}
        error={null}
        onRetry={jest.fn()}
        onPayWithCard={onPay}
      />,
    );

    expect(screen.getByText('Teclado Mecánico 75%')).toBeInTheDocument();
    expect(screen.getByText('Agotado')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Aumentar cantidad'));
    fireEvent.click(screen.getByText('Pay with credit card'));
    expect(onPay).toHaveBeenCalledWith(product, 2);
  });

  it('ProductListPage renders error state and retry button', () => {
    const onRetry = jest.fn();
    render(
      <ProductListPage
        products={[]}
        loading={false}
        error="Error de red"
        onRetry={onRetry}
        onPayWithCard={jest.fn()}
      />,
    );

    expect(screen.getByText('Error de red')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Reintentar'));
    expect(onRetry).toHaveBeenCalled();
  });

  it('PaymentModal validates inputs, detects VISA and submits valid form', () => {
    const onContinue = jest.fn();
    render(
      <PaymentModal
        product={product}
        quantity={1}
        initialCustomer={{ fullName: '', email: '', phone: '' }}
        initialDelivery={{
          address: '',
          city: '',
          department: '',
          postalCode: '',
        }}
        initialCard={{
          number: '',
          cardHolder: '',
          expMonth: '',
          expYear: '',
          cvc: '',
          installments: 1,
        }}
        onClose={jest.fn()}
        onContinue={onContinue}
      />,
    );

    // Submit empty -> validation errors
    fireEvent.click(screen.getByText('Continuar al resumen de pago'));
    expect(
      screen.getByText(/número de tarjeta válido/i),
    ).toBeInTheDocument();

    // Fill valid fields
    fireEvent.change(screen.getByLabelText('Número de tarjeta'), {
      target: { value: '4242424242424242' },
    });
    expect(screen.getByLabelText('VISA')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nombre en la tarjeta'), {
      target: { value: 'Juan Perez' },
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
    expect(onContinue).toHaveBeenCalledWith(
      expect.objectContaining({
        brand: 'VISA',
        lastFour: '4242',
      }),
    );
  });

  it('SummaryBackdrop displays cost breakdown and handles pay/refresh states', () => {
    const onConfirm = jest.fn();
    const onEdit = jest.fn();
    const { rerender } = render(
      <SummaryBackdrop
        product={product}
        quantity={1}
        customer={{
          fullName: 'Juan Pérez',
          email: 'juan@test.com',
          phone: '+573001234567',
        }}
        delivery={{
          address: 'Calle 45',
          city: 'Montería',
          department: 'Córdoba',
          postalCode: '',
        }}
        cardSummary={{
          brand: 'VISA',
          lastFour: '4242',
          cardHolder: 'JUAN PEREZ',
          installments: 1,
        }}
        hasCardInMemory={true}
        baseFeeInCents={300000}
        deliveryFeeInCents={1000000}
        processing={false}
        error={null}
        onEditDetails={onEdit}
        onConfirmPayment={onConfirm}
      />,
    );

    expect(screen.getByText('Resumen de tu pago')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Pagar/i }));
    expect(onConfirm).toHaveBeenCalled();

    // Refresh recovery state (no card in memory)
    rerender(
      <SummaryBackdrop
        product={product}
        quantity={1}
        customer={{
          fullName: 'Juan Pérez',
          email: 'juan@test.com',
          phone: '+573001234567',
        }}
        delivery={{
          address: 'Calle 45',
          city: 'Montería',
          department: 'Córdoba',
          postalCode: '',
        }}
        cardSummary={null}
        hasCardInMemory={false}
        baseFeeInCents={300000}
        deliveryFeeInCents={1000000}
        processing={false}
        error="Error de pago"
        onEditDetails={onEdit}
        onConfirmPayment={onConfirm}
      />,
    );

    expect(screen.getByText('Error de pago')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Reingresar datos de tarjeta'));
    expect(onEdit).toHaveBeenCalled();
  });

  it('PaymentResultPage renders APPROVED and DECLINED states', () => {
    const onReturn = jest.fn();
    const baseTx = {
      id: 'tx-1',
      reference: 'TXN-999',
      productId: 'prod-1',
      customerId: 'cust-1',
      quantity: 1,
      productAmountInCents: 31500000,
      baseFeeInCents: 300000,
      deliveryFeeInCents: 1000000,
      totalInCents: 32800000,
      status: 'APPROVED' as const,
      externalTransactionId: 'ext-1',
      cardBrand: 'VISA',
      cardLastFour: '4242',
    };

    const { rerender } = render(
      <PaymentResultPage
        transaction={baseTx}
        delivery={{
          id: 'del-1',
          transactionId: 'tx-1',
          address: 'Calle 45',
          city: 'Montería',
          department: 'Córdoba',
          status: 'ASSIGNED',
        }}
        product={{ ...product, stock: 4 }}
        onReturnToStore={onReturn}
      />,
    );

    expect(screen.getByText('¡Pago aprobado!')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Volver a la tienda/i));
    expect(onReturn).toHaveBeenCalled();

    rerender(
      <PaymentResultPage
        transaction={{ ...baseTx, status: 'DECLINED' }}
        delivery={null}
        product={product}
        onReturnToStore={onReturn}
      />,
    );

    expect(screen.getByText('Pago rechazado')).toBeInTheDocument();
  });
});