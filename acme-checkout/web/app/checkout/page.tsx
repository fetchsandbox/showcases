import { CheckoutForm } from './CheckoutForm';

export default function CheckoutPage() {
  return (
    <main style={{ maxWidth: 480, margin: '64px auto', padding: 16 }}>
      <h1>Checkout</h1>
      <CheckoutForm />
    </main>
  );
}
