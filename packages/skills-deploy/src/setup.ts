import { vi } from 'vitest';

vi.spyOn(console, 'log').mockImplementation(() => undefined);
vi.spyOn(console, 'warn').mockImplementation(() => undefined);
