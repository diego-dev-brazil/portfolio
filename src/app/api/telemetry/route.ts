import { NextResponse } from 'next/server';
import { cases } from '../../../data/cases';

export const dynamic = 'force-dynamic';

const GITHUB_API = 'https://api.github.com';
const DEFAULT_GITHUB_USERNAME = 'diego-dev-brazil';
const DEFAULT_GITHUB_REPO = 'diego-dev-brazil/open-prompts-br';

type GitHubProfile = {
  login: string;
  html_url: string;
  public_repos: number;
  followers: number;
  public_gists: number;
  created_at: string;
};

type GitHubRepository = {
  full_name: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string | null;
};

type GitHubCommit = {
  commit?: {
    committer?: {
      date?: string;
    };
  };
};

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function githubFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: githubHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`GitHub API respondeu HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function validUsername(value: string): boolean {
  return /^[a-zA-Z0-9-]{1,39}$/.test(value);
}

function validRepository(value: string): boolean {
  return /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(value);
}

export async function GET() {
  const username = process.env.GITHUB_USERNAME?.trim() || DEFAULT_GITHUB_USERNAME;
  const repositorySetting = process.env.GITHUB_REPOSITORY?.trim();
  const repository =
    repositorySetting || (username ? `${username}/open-prompts-br` : DEFAULT_GITHUB_REPO);
  const headers = { 'Cache-Control': 'no-store' };

  const profileTask =
    username && validUsername(username)
      ? githubFetch<GitHubProfile>(`/users/${encodeURIComponent(username)}`)
      : Promise.resolve(null);

  const repositoryTask =
    repository && validRepository(repository)
      ? Promise.all([
          githubFetch<GitHubRepository>(`/repos/${repository}`),
          githubFetch<GitHubCommit[]>(`/repos/${repository}/commits?per_page=1`),
        ])
      : Promise.resolve(null);

  const [profileResult, repositoryResult] = await Promise.allSettled([
    profileTask,
    repositoryTask,
  ]);

  const profile =
    profileResult.status === 'fulfilled' ? profileResult.value : null;
  const repositoryData =
    repositoryResult.status === 'fulfilled' ? repositoryResult.value : null;
  const repositoryInfo = repositoryData?.[0] ?? null;
  const latestCommit = repositoryData?.[1]?.[0] ?? null;

  const errors: string[] = [];
  if (username && !validUsername(username)) {
    errors.push('GITHUB_USERNAME inválido.');
  } else if (username && profileResult.status === 'rejected') {
    errors.push('Não foi possível consultar o perfil do GitHub.');
  }

  if (repository && !validRepository(repository)) {
    errors.push('GITHUB_REPOSITORY inválido; use owner/repo.');
  } else if (repository && repositoryResult.status === 'rejected') {
    errors.push('Não foi possível consultar o repositório do GitHub.');
  }

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      github: {
        status:
          profile || repositoryInfo
            ? 'available'
            : username || repository
              ? 'error'
              : 'not_configured',
        profile: profile
          ? {
              username: profile.login,
              url: profile.html_url,
              publicRepositories: profile.public_repos,
              followers: profile.followers,
              publicGists: profile.public_gists,
              createdAt: profile.created_at,
            }
          : null,
        repository: repositoryInfo
          ? {
              name: repositoryInfo.full_name,
              url: repositoryInfo.html_url,
              stars: repositoryInfo.stargazers_count,
              forks: repositoryInfo.forks_count,
              openIssues: repositoryInfo.open_issues_count,
              lastPushAt: repositoryInfo.pushed_at,
              latestCommitAt: latestCommit?.commit?.committer?.date ?? null,
            }
          : null,
        errors,
      },
      systems: cases.map((item) => ({
        id: item.id,
        status: item.repoUrl ? 'public_repo' : 'architecture_preview',
        metrics:
          item.id === 'open-prompts-br' && repositoryInfo
            ? {
                label: 'GITHUB LIVE',
                value: `${repositoryInfo.stargazers_count}★ · ${repositoryInfo.forks_count} forks`,
              }
            : item.liveMetrics ?? null,
      })),
    },
    { headers },
  );
}
