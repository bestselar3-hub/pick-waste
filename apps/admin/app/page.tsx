'use client';

import { useEffect, useMemo, useState } from 'react';

type Pickup = {
  id: string;
  customerId: string;
  customerName?: string;
  wasteType: string;
  serviceType: string;
  status: string;
  pickupLocation: { lat: number; lng: number };
  scheduledFor: string;
  assignedDriverId?: string;
};

export default function Page() {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [summary, setSummary] = useState({ totalPickups: 0, activePickups: 0, activeDrivers: 0, completedToday: 0 });

  const fetchData = async () => {
    const [pickupRes, summaryRes] = await Promise.all([
      fetch('http://localhost:4000/api/pickups'),
      fetch('http://localhost:4000/api/summary')
    ]);

    const pickupData = await pickupRes.json();
    const summaryData = await summaryRes.json();

    setPickups(pickupData.data ?? []);
    setSummary(summaryData.data ?? { totalPickups: 0, activePickups: 0, activeDrivers: 0, completedToday: 0 });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statusColors = useMemo(
    () => ({
      requested: '#fef3c7',
      assigned: '#dbeafe',
      in_progress: '#ddd6fe',
      completed: '#dcfce7',
      cancelled: '#fee2e2'
    }),
    []
  );

  return (
    <main style={{ padding: 32, fontFamily: 'sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: 24, color: '#0f172a' }}>PickWaste Admin Console</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total pickups', value: summary.totalPickups },
          { label: 'Active pickups', value: summary.activePickups },
          { label: 'Active drivers', value: summary.activeDrivers },
          { label: 'Completed today', value: summary.completedToday }
        ].map((item) => (
          <div key={item.label} style={{ background: '#ffffff', borderRadius: 12, padding: 22, boxShadow: '0 4px 12px rgba(15,23,42,0.06)' }}>
            <div style={{ color: '#64748b', fontSize: 14 }}>{item.label}</div>
            <div style={{ marginTop: 10, fontSize: 32, fontWeight: 700, color: '#0f172a' }}>{item.value}</div>
          </div>
        ))}
      </div>

      <section style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 4px 12px rgba(15,23,42,0.06)' }}>
        <h2 style={{ marginTop: 0 }}>Live pickup queue</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#475569' }}>
              <th style={{ padding: '12px 8px' }}>Pickup ID</th>
              <th style={{ padding: '12px 8px' }}>Customer</th>
              <th style={{ padding: '12px 8px' }}>Waste</th>
              <th style={{ padding: '12px 8px' }}>Schedule</th>
              <th style={{ padding: '12px 8px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {pickups.map((pickup) => (
              <tr key={pickup.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 8px' }}>{pickup.id}</td>
                <td style={{ padding: '12px 8px' }}>{pickup.customerName || pickup.customerId}</td>
                <td style={{ padding: '12px 8px' }}>{pickup.wasteType}</td>
                <td style={{ padding: '12px 8px' }}>{new Date(pickup.scheduledFor).toLocaleString()}</td>
                <td style={{ padding: '12px 8px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '6px 10px',
                    borderRadius: 999,
                    background: statusColors[pickup.status as keyof typeof statusColors] ?? '#f1f5f9',
                    fontWeight: 700,
                    color: '#0f172a',
                    textTransform: 'capitalize'
                  }}>
                    {pickup.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
