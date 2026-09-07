/**
 * Broadcast a push notification to all registered ZERA users.
 *
 * Usage:
 *   npx tsx scripts/broadcast-notification.ts "Title" "Body text"
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables
 * (service key, not anon key — needs to bypass RLS to read all tokens).
 */

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface PushToken {
  token: string;
  user_id: string;
}

async function main() {
  const [title, body] = process.argv.slice(2);
  if (!title || !body) {
    console.error('Usage: npx tsx scripts/broadcast-notification.ts "Title" "Body"');
    process.exit(1);
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? '';
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY ?? '';
  if (!supabaseUrl || !supabaseKey) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars');
    process.exit(1);
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/push_tokens?select=token,user_id`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
  });

  if (!res.ok) {
    console.error('Failed to fetch tokens:', await res.text());
    process.exit(1);
  }

  const tokens: PushToken[] = await res.json();
  if (tokens.length === 0) {
    console.log('No registered tokens found.');
    return;
  }

  console.log(`Sending to ${tokens.length} device(s)...`);

  const messages = tokens.map((t) => ({
    to: t.token,
    sound: 'default',
    title,
    body,
    data: { type: 'broadcast' },
  }));

  // Expo accepts batches of up to 100
  for (let i = 0; i < messages.length; i += 100) {
    const batch = messages.slice(i, i + 100);
    const pushRes = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch),
    });

    if (!pushRes.ok) {
      console.error(`Batch ${i / 100 + 1} failed:`, await pushRes.text());
    } else {
      const result = await pushRes.json();
      console.log(`Batch ${i / 100 + 1}: ${JSON.stringify(result.data?.length ?? 0)} sent`);
    }
  }

  console.log('Done.');
}

main();
