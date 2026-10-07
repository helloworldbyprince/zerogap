import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const port = 3217;
const baseUrl = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['.next/standalone/server.js'], {
  env: { ...process.env, PORT: String(port), HOSTNAME: '127.0.0.1' },
  stdio: ['ignore', 'pipe', 'pipe'],
});

const waitForServer = async () => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Production server did not become ready');
};

const jsonRequest = async (path, init) => {
  const response = await fetch(`${baseUrl}${path}`, init);
  const body = await response.json();
  return { response, body };
};

try {
  await waitForServer();

  for (const path of ['/', '/onboarding', '/app', '/app/sales', '/app/purchases', '/app/triangle', '/app/periods', '/app/reports', '/app/settings']) {
    const response = await fetch(`${baseUrl}${path}`);
    assert.equal(response.status, 200, `${path} should render`);
  }

  const dashboard = await jsonRequest('/api/dashboard');
  assert.equal(dashboard.response.status, 200);
  assert.equal(dashboard.body.period.period, '202609');

  const invalidTriangle = await jsonRequest('/api/triangle', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ gstr1TaxLiability: 'invalid', gstr2bCreditAvailable: -1 }),
  });
  assert.equal(invalidTriangle.response.status, 400);
  assert.equal(invalidTriangle.body.error.code, 'VALIDATION_FAILED');

  const upload = await jsonRequest('/api/uploads', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      bizId: 'biz_sharma_traders_demo',
      period: '202609',
      kind: 'sales',
      files: [{ name: 'SMOKE-INVOICE.pdf', size: 2048, type: 'application/pdf' }],
    }),
  });
  assert.equal(upload.response.status, 202);
  const job = await jsonRequest(`/api/jobs/${upload.body.jobId}`);
  assert.equal(job.response.status, 200);
  assert.ok(['processing', 'done'].includes(job.body.job.status));

  const jsonExport = await fetch(`${baseUrl}/api/gstr1/export?bizId=biz_sharma_traders_demo&period=202609&format=json&bypassGate=true`);
  assert.equal(jsonExport.status, 200);
  const gstr1 = await jsonExport.json();
  assert.deepEqual(Object.keys(gstr1), ['gstin', 'fp', 'gt', 'b2b', 'b2cl', 'b2cs', 'hsn']);
  assert.equal(gstr1.fp, '092026');
  assert.ok(gstr1.b2b.length > 0);

  const xlsxExport = await fetch(`${baseUrl}/api/gstr1/export?bizId=biz_sharma_traders_demo&period=202609&format=xlsx&bypassGate=true`);
  assert.equal(xlsxExport.status, 200);
  const xlsx = Buffer.from(await xlsxExport.arrayBuffer());
  assert.equal(xlsx.subarray(0, 2).toString(), 'PK', 'XLSX must be a valid ZIP container');

  console.log('ZeroGap production smoke tests passed.');
} finally {
  server.kill('SIGTERM');
}
