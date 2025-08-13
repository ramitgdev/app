// Environment Variables Test
console.log('=== Environment Variables Test ===');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING');
console.log('STORAGE_PROVIDER:', process.env.STORAGE_PROVIDER);
console.log('STORAGE_BUCKET:', process.env.STORAGE_BUCKET);
console.log('===================================');

export default function EnvTest() {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h3>Environment Variables Test</h3>
      <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING'}</p>
      <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING'}</p>
      <p>STORAGE_PROVIDER: {process.env.STORAGE_PROVIDER || 'MISSING'}</p>
      <p>STORAGE_BUCKET: {process.env.STORAGE_BUCKET || 'MISSING'}</p>
    </div>
  );
} 