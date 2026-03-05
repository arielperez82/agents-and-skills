const DEFAULT_BASE_URL = 'https://api.anthropic.com';
const BETA_HEADER = 'skills-2025-10-02';
const API_VERSION = '2023-06-01';

const DUPLICATE_TITLE_PATTERN = /Skill cannot reuse an existing display_title/;
const MALFORMED_FRONTMATTER_PATTERN = /malformed YAML frontmatter/;

class DuplicateTitleError extends Error {
  readonly displayTitle: string;

  constructor(displayTitle: string) {
    super(`Skill already exists with display_title: ${displayTitle}`);
    this.name = 'DuplicateTitleError';
    this.displayTitle = displayTitle;
  }
}

class MalformedFrontmatterError extends Error {
  constructor() {
    super('API rejected: malformed YAML frontmatter');
    this.name = 'MalformedFrontmatterError';
  }
}

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

type ListSkillsOptions = {
  readonly apiKey: string;
  readonly baseUrl?: string;
};

type ListSkillsPage = {
  readonly data: readonly CreateSkillResponse[];
  readonly has_more: boolean;
  readonly next_page?: string;
};

const buildHeaders = (apiKey: string): Record<string, string> => ({
  'x-api-key': apiKey,
  'anthropic-version': API_VERSION,
  'anthropic-beta': BETA_HEADER,
});

const buildFormData = (zipBuffer: Buffer, displayTitle?: string): FormData => {
  const formData = new FormData();

  if (displayTitle !== undefined) {
    formData.append('display_title', displayTitle);
  }

  const file = new File([zipBuffer], 'skill.zip', { type: 'application/zip' });
  formData.append('files[]', file);

  return formData;
};

const assertOk = async (response: Response): Promise<void> => {
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    if (MALFORMED_FRONTMATTER_PATTERN.test(body)) {
      throw new MalformedFrontmatterError();
    }
    throw new Error(`API request failed with status ${String(response.status)}: ${body}`);
  }
};

const createSkill = async (options: CreateSkillOptions): Promise<CreateSkillResponse> => {
  const { displayTitle, zipBuffer, apiKey, baseUrl = DEFAULT_BASE_URL } = options;
  const url = `${baseUrl}/v1/skills`;

  const response = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(apiKey),
    body: buildFormData(zipBuffer, displayTitle),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    if (DUPLICATE_TITLE_PATTERN.test(body)) {
      throw new DuplicateTitleError(displayTitle);
    }
    if (MALFORMED_FRONTMATTER_PATTERN.test(body)) {
      throw new MalformedFrontmatterError();
    }
    throw new Error(`API request failed with status ${String(response.status)}: ${body}`);
  }

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

const MAX_PAGES = 100;

const fetchSkillsPage = async (
  baseUrl: string,
  headers: Record<string, string>,
  cursor: string | undefined,
): Promise<ListSkillsPage> => {
  const url = new URL(`${baseUrl}/v1/skills`);
  url.searchParams.set('limit', '100');
  if (cursor !== undefined) {
    url.searchParams.set('after_id', cursor);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers,
  });

  await assertOk(response);
  return (await response.json()) as ListSkillsPage;
};

const collectAllSkills = async (
  baseUrl: string,
  headers: Record<string, string>,
  accumulated: readonly CreateSkillResponse[],
  cursor: string | undefined,
  pageCount: number = 0,
): Promise<readonly CreateSkillResponse[]> => {
  if (pageCount >= MAX_PAGES) {
    throw new Error(
      `Pagination exceeded maximum of ${String(MAX_PAGES)} pages — possible infinite loop`,
    );
  }

  const page = await fetchSkillsPage(baseUrl, headers, cursor);
  const combined = [...accumulated, ...page.data];

  if (!page.has_more) {
    return combined;
  }

  if (page.next_page === undefined) {
    throw new Error('API returned has_more: true but omitted next_page cursor');
  }

  return collectAllSkills(baseUrl, headers, combined, page.next_page, pageCount + 1);
};

const listSkills = async (options: ListSkillsOptions): Promise<readonly CreateSkillResponse[]> => {
  const { apiKey, baseUrl = DEFAULT_BASE_URL } = options;
  return collectAllSkills(baseUrl, buildHeaders(apiKey), [], undefined);
};

export {
  createSkill,
  createSkillVersion,
  DuplicateTitleError,
  listSkills,
  MalformedFrontmatterError,
};
export type {
  CreateSkillOptions,
  CreateSkillResponse,
  CreateSkillVersionOptions,
  CreateSkillVersionResponse,
  ListSkillsOptions,
};
