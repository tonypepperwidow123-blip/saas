import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function DebugPage() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    setLoading(true);
    const tests = {};

    // Test 1: Check env vars
    tests.env = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'MISSING',
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET (' + import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20) + '...)' : 'MISSING',
    };

    // Test 2: Supabase client exists
    tests.supabaseClient = {
      url: supabase?.client?.supabaseUrl || supabase?.client?.restUrl || 'unknown',
      exists: !!supabase,
      hasTransport: !!supabase?.client?.transport,
    };

    // Test 3: Profiles table with direct REST (fallback)
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=*&limit=5`, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });
      const data = await response.json();
      tests.directRestApi = { status: response.status, count: Array.isArray(data) ? data.length : 0, data };
    } catch (e) {
      tests.directRestApi = { error: e.message };
    }

    // Test 4: Supabase JS client profiles query
    try {
      const { data: profiles, error, count, status } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .limit(5);

      tests.supabaseJsClient = {
        data: profiles,
        count,
        error: error?.message,
        status,
        hasData: !!profiles && profiles.length > 0
      };
    } catch (e) {
      tests.supabaseJsClient = { error: e.message, name: e.name };
    }

    // Test 5: Simple count query
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      tests.countQuery = { count, error: error?.message };
    } catch (e) {
      tests.countQuery = { error: e.message };
    }

    // Test 6: Developers query
    try {
      const { data: devs, error } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .eq('role', 'developer');

      tests.developersQuery = { count: devs?.length || 0, data: devs, error: error?.message };
    } catch (e) {
      tests.developersQuery = { error: e.message };
    }

    console.log('Debug tests results:', tests);
    setResults(tests);
    setLoading(false);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Supabase Debug Page</h1>
        <button
          onClick={runTests}
          disabled={loading}
          className="rounded bg-accent px-4 py-2 text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Re-run Tests'}
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(results).map(([key, value]) => (
          <div key={key} className="rounded-lg border border-border-subtle bg-bg-card p-4">
            <h3 className="font-semibold text-text-primary">{key.toUpperCase()}</h3>
            {value?.error ? (
              <p className="mt-2 text-sm text-red-400">Error: {value.error}</p>
            ) : (
              <pre className="mt-2 overflow-auto rounded bg-bg-elevated p-2 text-xs">
                {JSON.stringify(value, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}