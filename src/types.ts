export type PubSubEvent = {
  data: string;
};

export type Source = {
  repoSource?: RepoSource;
};

export type RepoSource = {
  repoName: string;
  branchName: string;
  tagName: string;
  commitSha: string;
  dir: string;
  projectId: string;
};

export type EventData = {
  id: string;
  status: string;
  logUrl: string;
  source: Source;
  substitutions: { [key: string]: string };
};
