export const metadata = {
  title: 'PickWaste Admin',
  description: 'Waste operations dashboard',
};

const stats = [
  { label: 'Scheduled Pickups', value: '184' },
  { label: 'Active Drivers', value: '24' },
  { label: 'Completed Today', value: '96' },
  { label: 'Avg. Route Time', value: '41m' }
];

const jobs = [
  { id: 'PW-1042', customer: 'Ada Johnson', status: 'Assigned', waste: 'Household' },
  { id: 'PW-1045', customer: 'Green Valley Hotel', status: 'In Progress', waste: 'Commercial' },
  { id: 'PW-1049', customer: 'City Recycling Hub', status: 'Completed', waste: 'Recycling' },
  { id: 'PW-1053', customer: 'Miller Construction', status: 'Requested', waste: 'Construction' }
];

export default function Page() {
  return (
    <main style={{ padding: 32, fontFamily: 'sans-serif', background: '#f4f7f6', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: 24, color: '#0f172a' }}>PickWaste Admin</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map((item) => (
          <div key={item.label} style={{ background: '#ffffff', borderRadius: 12, padding: 20, boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)' }}>
            <div style={{ color: '#64748b', fontSize: 14 }}>{item.label}</div>
            <div style={{ marginTop: 12, fontSize: 28, fontWeight: 700, color: '#0f172a' }}>{item.value}</div>
          </div>
        ))}
      </div>

      <section style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)' }}>
        <h2 style={{ marginTop: 0, color: '#0f172a' }}>Recent pickups</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#475569' }}>
              <th style={{ padding: '12px 8px' }}>Pickup ID</th>
              <th style={{ padding: '12px 8px' }}>Customer</th>
              <th style={{ padding: '12px 8px' }}>Waste Type</th>
              <th style={{ padding: '12px 8px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 8px' }}>{job.id}</td>
                <td style={{ padding: '12px 8px' }}>{job.customer}</td>
                <td style={{ padding: '12px 8px' }}>{job.waste}</td>
                <td style={{ padding: '12px 8px' }}>
                  <span style={{
                    padding: '6px 10px',
                    borderRadius: 999,
                    background: job.status === 'Completed' ? '#dcfce7' : job.status === 'Assigned' ? '#dbeafe' : '#fef3c7',
                    color: '#0f172a',
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {job.status}
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
