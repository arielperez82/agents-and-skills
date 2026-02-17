const DEFAULT_BASE_URL = 'https://api.anthropic.com';
const BETA_HEADER = 'skills-2025-10-02';
const API_VERSION = '2023-06-01';

type CreateSkillOptions = {
  readonly displayTitle: string;
  readonly zipBuffer: Buffer;
  readonly apiKey: string;
  readonly baseUrl?: string;
};

type CreateSkillResponse = {
  readonly id: string;
  readonly created_at: string;
  readonly display_title: string;
  readonly latest_version: string;
  readonly source: string;
  readonly type: string;
  readonly updated_at: string;
};

type CreateSkillVersionOptions = {
  readonly skillId: string;
  readonly zipBuffer: Buffer;
  readonly apiKey: string;
  readonly baseUrl?: string;
};

type CreateSkillVersionResponse = {
  readonly id: string;
  readonly created_at: string;
  readonly description: string;
  readonly directory: string;
  readonly name: string;
  readonly skill_id: string;
  readonly type: string;
  readonly version: string;
};

const buildHeaders = (apiKey: string): Record<string, string> => ({
  'x-api-key': apiKey,
  'anthropic-version': API_VERSION,
  'anthropic-beta': BETA_HEADER,
});

const buildFormData = (
  zipBuffer: Buffer,
  displayTitle?: string,
): FormData => {
  const formData = new FormData();

  if (displayTitle !== undefined) {
    formData.append('display_title', displayTitle);
  }

  const blob = new Blob([zipBuffer], { type: 'application/zip' });
  formData.append('files[]', blob, 'skill.zip');

  return formData;
};

const assertOk = async (response: Response): Promise<void> => {
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `API request failed with status ${String(response.status)}: ${body}`,
    );
  }
};

const createSkill = async (
  options: CreateSkillOptions,
): Promise<CreateSkillResponse> => {
  const { displayTitle, zipBuffer, apiKey, baseUrl = DEFAULT_BASE_URL } = options;
  const url = `${baseUrl}/v1/skills`;

  const response = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(apiKey),
    body: buildFormData(zipBuffer, displayTitle),
  });

  await assertOk(response);
  return (await response.json()) as CreateSkillResponse;
};

const createSkillVersion = async (
  options: CreateSkillVersionOptions,
): Promise<CreateSkillVersionResponse> => {
  const { skillId, zipBuffer, apiKey, baseUrl = DEFAULT_BASE_URL } = options;
  const url = `${baseUrl}/v1/skills/${skillId}/versions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(apiKey),
    body: buildFormData(zipBuffer),
  });

  await assertOk(response);
  return (await response.json()) as CreateSkillVersionResponse;
};

export { createSkill, createSkillVersion };
export type {
  CreateSkillOptions,
  CreateSkillResponse,
  CreateSkillVersionOptions,
  CreateSkillVersionResponse,
};
