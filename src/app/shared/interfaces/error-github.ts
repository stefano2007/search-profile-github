export default interface ErrorGithub{
  message: string;
  errors: ErrorGithubDetail[];
  documentation_url: string;
}

interface ErrorGithubDetail{
  resource: string;
  field: string;
  code: string;
}
