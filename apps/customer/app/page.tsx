export const metadata = {
  title: 'PickWaste',
  description: 'Book waste pickup and track service',
};

const services = [
  'Household Waste',
  'Recycling',
  'Organic Waste',
  'Construction Debris',
  'Bulk Pickup'
];

export default function Page() {
  return (
    <main style={{ padding: 32, background: '#f0fdf4', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <section style={{ background: '#ffffff', maxWidth: 1100, margin: '0 auto', borderRadius: 20, padding: 32, boxShadow: '0 10px 24px rgba(15, 118, 110, 0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <p style={{ textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, color: '#0f766e', marginBottom: 8 }}>PickWaste</p>
            <h1 style={{ margin: 0, fontSize: 42, color: '#0f172a' }}>Waste pickup, without the hassle.</h1>
          </div>
          <button style={{ background: '#0f766e', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 18px', fontWeight: 700, cursor: 'pointer' }}>
            Book Pickup
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginTop: 36 }}>
          {services.map((service) => (
            <div key={service} style={{ background: '#ecfeff', borderRadius: 12, padding: 18, border: '1px solid #a7f3d0', color: '#0f172a' }}>
              {service}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24 }}>
          <div style={{ background: '#f8fafc', borderRadius: 16, padding: 22 }}>
            <h2 style={{ marginTop: 0 }}>Scheduled pickup</h2>
            <p><strong>Date:</strong> Tue, Oct 5</p>
            <p><strong>Time:</strong> 9:00 AM</p>
            <p><strong>Location:</strong> 15 Ikoyi Road, Lagos</p>
            <p><strong>Status:</strong> Driver assigned</p>
          </div>

          <div style={{ background: '#ecfccb', borderRadius: 16, padding: 22 }}>
            <h2 style={{ marginTop: 0 }}>Driver update</h2>
            <p><strong>Driver:</strong> Samuel Ade</p>
            <p><strong>ETA:</strong> 18 mins</p>
            <p><strong>Vehicle:</strong> 5-ton waste truck</p>
          </div>
        </div>
      </section>
    </main>
  );
}
