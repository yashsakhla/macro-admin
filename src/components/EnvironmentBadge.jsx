// Fixed, always-on-top indicator so it's impossible to mistake which backend
// this session is talking to — driven by VITE_APP_ENV, not vite's build mode,
// since a "production build" can still be deployed pointed at a dev API.
const IS_PROD = import.meta.env.VITE_APP_ENV === 'production';

export default function EnvironmentBadge() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        textAlign: 'center',
        padding: '4px 8px',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.5,
        color: '#fff',
        background: IS_PROD ? '#DC2626' : '#0EA5E9',
        pointerEvents: 'none',
      }}
    >
      {IS_PROD ? 'PRODUCTION' : 'DEVELOPMENT'}
    </div>
  );
}
