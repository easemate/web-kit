import { ControlPanel } from '@/components/ControlPanel';

export default function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Ease Web Kit - Next.js Demo</h1>
      <p>Testing @easemate/web-kit components in Next.js with App Router.</p>
      
      <section style={{ marginTop: '2rem' }}>
        <ControlPanel />
      </section>
    </main>
  );
}
