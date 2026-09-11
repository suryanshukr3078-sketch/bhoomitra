import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve('apps/web/src');

const FORBIDDEN_PATTERNS = [
  /SECRET_KEY/i,
  /POSTGRES_PASSWORD/i,
  /DATABASE_URL/i,
  /MINIO_ROOT_PASSWORD/i,
  /S3_SECRET_KEY/i,
  /REDIS_PASSWORD/i,
];

const ALLOWED_NEXT_PUBLIC = new Set([
  'NEXT_PUBLIC_API_URL',
]);

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const violations = [];

  // Check forbidden secrets
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(content)) {
      violations.push(`Found forbidden pattern ${pattern} in ${filePath}`);
    }
  }

  // Check all NEXT_PUBLIC_ usages
  const matches = content.match(/NEXT_PUBLIC_[A-Z0-9_]+/g) || [];
  for (const match of matches) {
    if (!ALLOWED_NEXT_PUBLIC.has(match)) {
      violations.push(`Unauthorized NEXT_PUBLIC variable '${match}' in ${filePath}`);
    }
  }

  return violations;
}

function scanDir(dir) {
  let allViolations = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      allViolations = allViolations.concat(scanDir(fullPath));
    } else if (/\.(tsx?|jsx?|json|mjs)$/.test(entry.name)) {
      allViolations = allViolations.concat(scanFile(fullPath));
    }
  }

  return allViolations;
}

console.log('--- Scanning apps/web/src for client bundle leaks ---');
const violations = scanDir(SRC_DIR);

if (violations.length > 0) {
  console.error('FAILED: Security violations detected:');
  violations.forEach(v => console.error(`  - ${v}`));
  process.exit(1);
} else {
  console.log('PASSED: Zero secrets or unauthorized NEXT_PUBLIC_* variables found in client bundle.');
  process.exit(0);
}
