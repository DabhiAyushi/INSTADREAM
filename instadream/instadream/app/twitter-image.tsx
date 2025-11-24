import { ImageResponse } from 'next/og';

// Image metadata
export const alt = 'Cashly - Smart Expense Tracking with AI';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(to bottom right, #6366f1, #8b5cf6)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              fontSize: 200,
              fontWeight: 'bold',
            }}
          >
            💰
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 100,
                fontWeight: 'bold',
                letterSpacing: '-0.05em',
              }}
            >
              Cashly
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 32,
            marginTop: 20,
            opacity: 0.9,
          }}
        >
          Smart Expense Tracking with AI
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
