import Link from 'next/link';

export default function Home() {
  return (
    <main
      style={{
        maxWidth: 560,
        margin: '80px auto',
        padding: 24,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Acme Store</h1>
      <p style={{ color: '#666', marginBottom: 32, lineHeight: 1.5 }}>
        A one-time-payment checkout demo. Stripe for payments, Clerk for auth.
      </p>
      <Link
        href="/checkout"
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: '#635bff',
          color: 'white',
          borderRadius: 8,
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        Buy now — $49.99
      </Link>
    </main>
  );
}
