const pickups = [
  { id: 'PW-1042', address: '15 Ikoyi Road, Lagos', status: 'Assigned' },
  { id: 'PW-1043', address: 'Bode Thomas, Surulere', status: 'En Route' },
  { id: 'PW-1047', address: 'Lekki Phase I', status: 'Completed' }
];

export default function App() {
  return (
    <main className="driver-shell">
      <header className="driver-header">
        <div>
          <p className="eyebrow">Driver Console</p>
          <h1>PickWaste</h1>
        </div>
        <button className="toggle-btn">Online</button>
      </header>

      <section className="route-card">
        <h2>Today’s route</h2>
        <p>5 stops • Estimated completion: 2h 15m</p>
      </section>

      <section className="pickup-list">
        {pickups.map((pickup) => (
          <article key={pickup.id} className="pickup-item">
            <div>
              <strong>{pickup.id}</strong>
              <p>{pickup.address}</p>
            </div>
            <span className="status-pill">{pickup.status}</span>
          </article>
        ))}
      </section>
    </main>
  );
}
