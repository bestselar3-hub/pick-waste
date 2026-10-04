import { useEffect, useState } from 'react';

type DriverPickup = {
  id: string;
  customerName?: string;
  wasteType: string;
  pickupLocation: { lat: number; lng: number };
  status: string;
  scheduledFor: string;
  assignedDriverId?: string;
};

export default function App() {
  const [pickups, setPickups] = useState<DriverPickup[]>([]);
  const [updatingId, setUpdatingId] = useState('');

  const loadPickups = async () => {
    const res = await fetch('http://localhost:4000/api/pickups');
    const json = await res.json();
    setPickups(json.data ?? []);
  };

  useEffect(() => {
    loadPickups();
  }, []);

  const updateStatus = async (pickupId: string, nextStatus: string) => {
    setUpdatingId(pickupId);
    await fetch(`http://localhost:4000/api/pickups/${pickupId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    });

    await loadPickups();
    setUpdatingId('');
  };

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
        <p>{pickups.filter((item) => item.status !== 'completed').length} active pickups • 2.4 km to next stop</p>
      </section>

      <section className="pickup-list">
        {pickups.map((pickup) => (
          <article key={pickup.id} className="pickup-item">
            <div>
              <strong>{pickup.id}</strong>
              <p>{pickup.customerName || 'Customer'} • {pickup.wasteType}</p>
              <p>{new Date(pickup.scheduledFor).toLocaleString()}</p>
            </div>

            <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
              <span className="status-pill">{pickup.status}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="action-btn" onClick={() => updateStatus(pickup.id, 'in_progress')} disabled={updatingId === pickup.id}>Start</button>
                <button className="action-btn success" onClick={() => updateStatus(pickup.id, 'completed')} disabled={updatingId === pickup.id}>Done</button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
