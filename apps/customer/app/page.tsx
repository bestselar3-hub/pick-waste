'use client';

import { useEffect, useState } from 'react';

type PickupFormState = {
  customerId: string;
  customerName: string;
  wasteType: string;
  serviceType: string;
  pickupLocation: {
    lat: number;
    lng: number;
  };
  scheduledFor: string;
  notes: string;
};

const initialForm: PickupFormState = {
  customerId: 'cust-001',
  customerName: 'Ada Johnson',
  wasteType: 'household',
  serviceType: 'residential',
  pickupLocation: { lat: 6.5244, lng: 3.3792 },
  scheduledFor: '2026-10-05T09:00:00',
  notes: 'Residential household pickup'
};

export default function Page() {
  const [form, setForm] = useState<PickupFormState>(initialForm);
  const [pickups, setPickups] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const loadPickups = async () => {
    const res = await fetch('http://localhost:4000/api/pickups');
    const json = await res.json();
    setPickups(json.data ?? []);
  };

  useEffect(() => {
    loadPickups();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const res = await fetch('http://localhost:4000/api/pickups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        pickupLocation: {
          lat: Number(form.pickupLocation.lat),
          lng: Number(form.pickupLocation.lng)
        }
      })
    });

    const json = await res.json();
    if (!res.ok) {
      setMessage(json.error || 'Unable to create pickup');
      return;
    }

    setMessage(`Pickup ${json.data.id} created successfully.`);
    setForm(initialForm);
    loadPickups();
  };

  return (
    <main style={{ padding: 32, background: '#f0fdf4', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: 20, color: '#0f172a' }}>Book waste pickup</h1>

      <section style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 24, maxWidth: 1200, margin: '0 auto' }}>
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 12px 20px rgba(15,118,110,0.08)' }}>
          <div style={{ display: 'grid', gap: 16 }}>
            <label>
              <div style={{ marginBottom: 6, fontWeight: 600 }}>Customer ID</div>
              <input value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} style={styles.input} />
            </label>

            <label>
              <div style={{ marginBottom: 6, fontWeight: 600 }}>Customer name</div>
              <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} style={styles.input} />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label>
                <div style={{ marginBottom: 6, fontWeight: 600 }}>Waste type</div>
                <select value={form.wasteType} onChange={(e) => setForm({ ...form, wasteType: e.target.value })} style={styles.input}>
                  <option value="household">Household</option>
                  <option value="recycling">Recycling</option>
                  <option value="organic">Organic</option>
                  <option value="construction">Construction</option>
                  <option value="hazardous">Hazardous</option>
                  <option value="bulk">Bulk</option>
                </select>
              </label>

              <label>
                <div style={{ marginBottom: 6, fontWeight: 600 }}>Service type</div>
                <select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} style={styles.input}>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label>
                <div style={{ marginBottom: 6, fontWeight: 600 }}>Latitude</div>
                <input type="number" value={form.pickupLocation.lat} onChange={(e) => setForm({ ...form, pickupLocation: { ...form.pickupLocation, lat: Number(e.target.value) } })} style={styles.input} />
              </label>

              <label>
                <div style={{ marginBottom: 6, fontWeight: 600 }}>Longitude</div>
                <input type="number" value={form.pickupLocation.lng} onChange={(e) => setForm({ ...form, pickupLocation: { ...form.pickupLocation, lng: Number(e.target.value) } })} style={styles.input} />
              </label>
            </div>

            <label>
              <div style={{ marginBottom: 6, fontWeight: 600 }}>Scheduled time</div>
              <input type="datetime-local" value={form.scheduledFor} onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })} style={styles.input} />
            </label>

            <label>
              <div style={{ marginBottom: 6, fontWeight: 600 }}>Notes</div>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ ...styles.input, minHeight: 90, resize: 'vertical' }} />
            </label>

            <button type="submit" style={styles.primaryButton}>Create pickup</button>
            {message ? <p style={{ color: '#0f766e', margin: 0 }}>{message}</p> : null}
          </div>
        </form>

        <aside style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 12px 20px rgba(15,118,110,0.08)' }}>
          <h2 style={{ marginTop: 0 }}>Recent pickup requests</h2>

          <div style={{ display: 'grid', gap: 12 }}>
            {pickups.slice(0, 6).map((pickup) => (
              <div key={pickup.id} style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <strong>{pickup.customerName || pickup.customerId}</strong>
                  <span style={{ borderRadius: 999, background: '#dcfce7', padding: '5px 10px', fontSize: 12, fontWeight: 700 }}>{pickup.status}</span>
                </div>
                <div style={{ marginTop: 8, color: '#475569' }}>
                  {pickup.wasteType} • {pickup.serviceType}
                </div>
                <div style={{ marginTop: 6, color: '#64748b', fontSize: 13 }}>{new Date(pickup.scheduledFor).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  input: {
    width: '100%',
    border: '1px solid #cbd5e1',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 15,
    background: '#fff'
  },
  primaryButton: {
    border: 'none',
    background: '#0f766e',
    color: '#fff',
    borderRadius: 12,
    padding: '12px 18px',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer'
  }
};
