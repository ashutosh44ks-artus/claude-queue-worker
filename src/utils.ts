import { execFile } from "child_process";
import type { ExecFileException } from "child_process";
import { ClaudeTaskResult } from "./types";

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};
export const BACKEND_URL = getRequiredEnv("BACKEND_URL");
export const MACHINE_ID = getRequiredEnv("MACHINE_ID");
export const PROJECT_PATH = getRequiredEnv("PROJECT_PATH");

/**
 * Executes a headless Claude command in the project directory
 */
export const runClaudeTask = (prompt: string): Promise<ClaudeTaskResult> => {
  return new Promise((resolve) => {
    const args = [
      "-p",
      prompt,
      "--dangerously-skip-permissions",
      "--output-format",
      "json",
    ];

    console.log(`🚀 Starting Task: ${prompt}`);

    execFile(
      "claude",
      args,
      { cwd: PROJECT_PATH, maxBuffer: 10 * 1024 * 1024, encoding: "utf8" },
      (error: ExecFileException | null, stdout: string, stderr: string) => {
        const trimmedStdout = stdout.trim();
        let parsedOutput: unknown = trimmedStdout;

        try {
          parsedOutput = trimmedStdout ? JSON.parse(trimmedStdout) : null;
        } catch {
          // Keep raw stdout if parsing fails.
        }

        resolve({
          success: !error,
          output: parsedOutput,
          error: stderr || error?.message,
          exitCode: error
            ? typeof error.code === "number" && Number.isInteger(error.code)
              ? error.code
              : 1
            : 0,
        });
      },
    );
  });
};
