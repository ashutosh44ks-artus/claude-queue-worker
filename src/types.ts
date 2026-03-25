export type ClaudeTaskResult = {
  success: boolean;
  output: unknown;
  error: string | null | undefined;
  exitCode: number;
};

export type PendingTaskResponse = {
  task?: {
    id: string | number;
    prompt: string;
  } | null;
};
