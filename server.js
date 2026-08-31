const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

// Add CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);
const cookieName = 'd4an_viewed';

app.use(express.json());

async function handleViewRequest(req, res) {
  try {
    const cookieHeader = req.headers.cookie || '';
    const hasCookie = cookieHeader
      .split(';')
      .map(cookie => cookie.trim())
      .some(cookie => cookie.startsWith(`${cookieName}=`));

    const { data, error } = await supabase
      .from('site_views')
      .select('total')
      .eq('id', 1)
      .single();

    if (error) throw error;

    const total = Number(data.total);

    if (hasCookie) {
      return res.json({ total });
    }

    const newTotal = total + 1;

    const { error: updateError } = await supabase
      .from('site_views')
      .update({ total: newTotal })
      .eq('id', 1);

    if (updateError) throw updateError;

    res.setHeader(
      'Set-Cookie',
      `${cookieName}=true; Max-Age=1800; Path=/; SameSite=Lax; HttpOnly`
    );

    return res.json({ total: newTotal });
  } catch (err) {
    console.error('View request failed:', err);
    return res.status(500).json({ error: 'Failed to update view count' });
  }
}

app.get('/api/view', handleViewRequest);
app.post('/api/view', handleViewRequest);

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'view counter api' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
