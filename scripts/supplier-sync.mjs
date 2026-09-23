const appUrl = process.env.APP_URL?.trim();
const cronSecret = process.env.CRON_SECRET?.trim();

if (!appUrl) {
  console.error('APP_URL não configurada.');
  process.exit(1);
}

if (!cronSecret) {
  console.error('CRON_SECRET não configurado.');
  process.exit(1);
}

let endpoint;
try {
  endpoint = new URL('/api/internal/supplier-sync', appUrl);
} catch {
  console.error('APP_URL inválida.');
  process.exit(1);
}

try {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {Authorization: `Bearer ${cronSecret}`},
  });
  const body = await response.text();

  if (!response.ok) {
    console.error(`Sincronização falhou (HTTP ${response.status}): ${body}`);
    process.exit(1);
  }

  console.log(body);
} catch (error) {
  console.error(`Não foi possível chamar a sincronização: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
