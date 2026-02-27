import { execFileSync } from 'node:child_process';

import { resolveLocalToken, waitForTinybird } from './helpers/wait-for-tinybird';

export default async function globalSetup(): Promise<void> {
  await resolveLocalToken();
  await waitForTinybird();
  if (process.env.TB_TOKEN) {
    // Push schema to Tinybird Local so integration tests have tables; child inherits TB_* from process.env.
    // eslint-disable-next-line sonarjs/no-os-command-from-path -- required to run tinybird CLI in globalSetup
    execFileSync('npx', ['tinybird', 'build'], { cwd: process.cwd(), stdio: 'pipe' });
  }
}
