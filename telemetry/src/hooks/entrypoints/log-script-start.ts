import { bashToolInputSchema, postToolUseSchema } from '@/hooks/parse-skill-activation';
import { recordScriptStart } from '@/hooks/script-timing';
import { isScriptCommand } from '@/hooks/skill-path-patterns';

import type { HealthLogger, ScriptTimingStore } from './ports';
import { isMainModule, readStdin } from './shared';

const HOOK_NAME = 'log-script-start';

export type LogScriptStartDeps = {
  readonly clock: { readonly now: () => number };
  readonly scriptTiming: Pick<ScriptTimingStore, 'recordScriptStart'>;
  readonly health: HealthLogger;
};

export const runLogScriptStart = (eventJson: string, deps: LogScriptStartDeps): void => {
  if (!eventJson.trim()) return;

  try {
    const result = postToolUseSchema.safeParse(JSON.parse(eventJson));
    if (!result.success) return;
    const event = result.data;

    if (event.tool_name !== 'Bash') return;

    const inputResult = bashToolInputSchema.safeParse(event.tool_input);
    if (!inputResult.success) return;

    if (!isScriptCommand(inputResult.data.command)) return;
    if (typeof event.tool_use_id !== 'string') return;

    const startTime = deps.clock.now();
    deps.scriptTiming.recordScriptStart(event.tool_use_id, startTime);
    deps.health(HOOK_NAME, 0, 0, null, null);
  } catch {
    /* silent exit for malformed JSON */
  }
};

if (isMainModule(import.meta.url)) {
  void readStdin().then((eventJson) => {
    runLogScriptStart(eventJson, {
      clock: { now: Date.now },
      scriptTiming: { recordScriptStart },
      health: () => {
        /* no Tinybird client in PreToolUse — health is best-effort */
      },
    });
  });
}
