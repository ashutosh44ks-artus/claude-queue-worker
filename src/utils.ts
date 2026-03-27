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
export const USER_ID = getRequiredEnv("USER_ID");
export const SESSION_ID = getRequiredEnv("SESSION_ID");
export const PROJECT_PATH = getRequiredEnv("PROJECT_PATH");

/**
 * Checks if the Claude CLI is installed and accessible in the system PATH by running 'claude --version'.
 * @returns A promise that resolves if Claude CLI is installed, or rejects with an error message if not found or not installed.
 */
const checkClaudeInstalled = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    execFile(
      "claude",
      ["--version"],
      { encoding: "utf8" },
      (error: ExecFileException | null, stdout: string, stderr: string) => {
        if (error) {
          reject(
            new Error(
              `Claude CLI is not installed or not found in PATH. Please install it from https://claude.ai/ and ensure it's accessible via command line. Original error: ${stderr || error.message}`,
            ),
          );
        } else {
          console.log(`✅ Claude CLI is installed: ${stdout.trim()}`);
          resolve();
        }
      },
    );
  });
};

/**
 * Checks if the user is logged in to the Claude CLI by running 'claude auth status'.
 * @returns A promise that resolves if the user is logged in, or rejects with an error message if not authenticated or if there's an issue with the CLI.
 */
const checkClaudeLogin = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    execFile(
      "claude",
      ["auth", "status"],
      { encoding: "utf8" },
      (error: ExecFileException | null, stdout: string, stderr: string) => {
        if (error) {
          reject(
            new Error(
              `Failed to check Claude authentication status. Please ensure you are logged in using 'claude auth login'. Original error: ${stderr || error.message}`,
            ),
          );
        } else if (stdout) {
          try {
            const status = JSON.parse(stdout);
            if (!status.loggedIn) {
              reject(
                new Error(
                  `Claude CLI is not authenticated. Please log in using 'claude auth login'.`,
                ),
              );
              return;
            }
          } catch {
            reject(
              new Error(
                `Unexpected output from 'claude auth status'. Please ensure you are logged in using 'claude auth login'. Output: ${stdout}`,
              ),
            );
            return;
          }
          console.log(`✅ Claude CLI is authenticated.`);
          resolve();
        } else {
          reject(
            new Error(
              `Claude CLI is not authenticated. Please log in using 'claude auth login'.`,
            ),
          );
        }
      },
    );
  });
};

/**
 * Runs all pre-flight checks to ensure the environment is set up correctly before starting the task listener.
 * @returns A promise that resolves if all checks pass, or rejects with an error if any check fails.
 */
export const runPreFlightChecks = async (): Promise<void> => {
  await checkClaudeInstalled();
  await checkClaudeLogin();
  console.log("✅ All pre-flight checks passed. Starting task listener...");
};
/**
 * Executes a headless Claude command in the project directory
 * @param prompt The task description to send to Claude
 * @returns A promise that resolves with the task result, including success status, output, error message, and exit code
 */
export const runClaudeTask = (prompt: string): Promise<ClaudeTaskResult> => {

  // check if project path exists and is a directory
  const fs = require("fs");
  if (!fs.existsSync(PROJECT_PATH) || !fs.lstatSync(PROJECT_PATH).isDirectory()) {
    // create the directory if it doesn't exist
    fs.mkdirSync(PROJECT_PATH, { recursive: true });
    console.warn(
      `⚠️  Project path "${PROJECT_PATH}" did not exist and was created. Please ensure this is the correct path and that it contains your project files.`,
    );
  }


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
