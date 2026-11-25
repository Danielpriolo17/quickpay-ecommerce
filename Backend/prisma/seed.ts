import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INITIAL_PRODUCTS = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Auriculares Inalámbricos ANC Pro',
    description:
      'Cancelación activa de ruido híbrida, 40 horas de autonomía, audio espacial de alta resolución y carga rápida USB-C.',
    priceInCents: 24990000, // $249.900 COP
    stock: 15,
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Reloj Inteligente Titanium Sport',
    description:
      'Pantalla AMOLED de 1.43", GPS de doble banda, resistencia al agua 5 ATM y monitoreo continuo de frecuencia cardíaca.',
    priceInCents: 38900000, // $389.000 COP
    stock: 8,
    imageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Teclado Mecánico Compacto 75%',
    description:
      'Switches táctiles hot-swap, retroiluminación RGB personalizable, conectividad Bluetooth 5.1 / 2.4 GHz y chasis de aluminio.',
    priceInCents: 31500000, // $315.000 COP
    stock: 12,
    imageUrl:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
  },
];

async function main() {
  console.log('Seeding products...');

  for (const product of INITIAL_PRODUCTS) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: product,
    });
  }

  console.log(`Seed completed: ${INITIAL_PRODUCTS.length} products ready.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });