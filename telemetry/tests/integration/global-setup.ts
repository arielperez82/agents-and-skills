import { waitForTinybird } from './helpers/wait-for-tinybird';

export default async function globalSetup(): Promise<void> {
  await waitForTinybird();
}
