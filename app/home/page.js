import Link from 'next/link';
import styles from './home.module.css';
import { Metadata } from 'next';

// Add page-specific metadata
export const metadata = {
  title: "Home - Instrument Inventory",
  description: "Welcome to Instrument Inventory - Manage and track all your musical instruments with ease",
  openGraph: {
    title: "Home - Instrument Inventory",
    description: "Welcome to Instrument Inventory - Manage and track all your musical instruments with ease",
  },
};

// Mock data for instruments
const mockInstruments = [
  { id: 1, name: 'Yamaha Piano', category: 'Keyboard', status: 'Available', condition: 'Excellent' },
  { id: 2, name: 'Fender Stratocaster', category: 'Guitar', status: 'In Use', condition: 'Good' },
  { id: 3, name: 'Pearl Drum Kit', category: 'Percussion', status: 'Available', condition: 'Excellent' },
  { id: 4, name: 'Saxophone Alto', category: 'Wind', status: 'Maintenance', condition: 'Fair' },
  { id: 5, name: 'Violin Stradivarius', category: 'String', status: 'Available', condition: 'Excellent' },
  { id: 6, name: 'Electric Bass', category: 'Bass', status: 'In Use', condition: 'Good' }
];

const stats = {
  total: mockInstruments.length,
  available: mockInstruments.filter(i => i.status === 'Available').length,
  inUse: mockInstruments.filter(i => i.status === 'In Use').length,
  maintenance: mockInstruments.filter(i => i.status === 'Maintenance').length
};

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Instrument Inventory</h1>
          <nav className={styles.nav} role="navigation" aria-label="Main navigation">
            <Link href="/home" className={styles.navLink}>Home</Link>
            <Link href="/dashboard" className={styles.navLink}>Dashboard</Link>
            <Link href="/login" className={styles.navLink}>Logout</Link>
          </nav>
        </div>
      </header>

      <main className={styles.main} role="main">
        <section className={styles.welcomeSection} aria-labelledby="welcome-heading">
          <h2 id="welcome-heading" className={styles.welcomeTitle}>Welcome to Instrument Inventory</h2>
          <p className={styles.welcomeText}>
            Manage and track all your musical instruments with ease. View availability, 
            check conditions, and monitor usage across your collection.
          </p>
        </section>

        <section className={styles.statsSection} aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">Instrument Statistics</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.total}</div>
              <div className={styles.statLabel}>Total Instruments</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.available}</div>
              <div className={styles.statLabel}>Available</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.inUse}</div>
              <div className={styles.statLabel}>In Use</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.maintenance}</div>
              <div className={styles.statLabel}>Maintenance</div>
            </div>
          </div>
        </section>

        <section className={styles.instrumentsSection} aria-labelledby="instruments-heading">
          <div className={styles.sectionHeader}>
            <h3 id="instruments-heading" className={styles.sectionTitle}>Recent Instruments</h3>
            <Link href="/dashboard" className={styles.viewAllLink}>View All →</Link>
          </div>
          
          <div className={styles.instrumentsGrid}>
            {mockInstruments.slice(0, 4).map((instrument) => (
              <div key={instrument.id} className={styles.instrumentCard}>
                <div className={styles.instrumentHeader}>
                  <h4 className={styles.instrumentName}>{instrument.name}</h4>
                  <span className={`${styles.status} ${styles[instrument.status.toLowerCase().replace(' ', '')]}`}>
                    {instrument.status}
                  </span>
                </div>
                <div className={styles.instrumentDetails}>
                  <p className={styles.category}>{instrument.category}</p>
                  <p className={styles.condition}>Condition: {instrument.condition}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.actionsSection} aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="sr-only">Quick Actions</h2>
          <div className={styles.quickActions}>
            <Link href="/dashboard" className={styles.actionButton}>
              Manage Inventory
            </Link>
            <Link href="/dashboard" className={styles.actionButtonSecondary}>
              Add New Instrument
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}