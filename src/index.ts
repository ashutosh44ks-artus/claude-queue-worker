import axios from "axios";
import "dotenv/config";
import { PendingTaskResponse } from "./types";
import {
  BACKEND_URL,
  MACHINE_ID,
  runClaudeTask,
  runPreFlightChecks,
} from "./utils";

/**
 * Polls the backend for "pending" tasks
 */
const pollTasks = async (): Promise<void> => {
  try {
    const { data } = await axios.get<PendingTaskResponse>(
      `${BACKEND_URL}/tasks/pending?machineId=${MACHINE_ID}`,
    );

    if (!data.task) {
      console.log("No pending tasks right now.");
      return;
    }

    const claudeResponse = await runClaudeTask(data.task.prompt);

    if (!claudeResponse.success) {
      console.error("❌ Task failed:", claudeResponse.error);
    }

    const outputResult =
      typeof claudeResponse.output === "object" &&
      claudeResponse.output !== null &&
      "result" in claudeResponse.output
        ? (claudeResponse.output as { result?: unknown }).result
        : claudeResponse.output;

    console.log("Claude Output:", outputResult);

    // Report the result back to the server
    await axios.post(`${BACKEND_URL}/tasks/update`, {
      taskId: data.task.id,
      shellCommandStatus: claudeResponse.success ? "completed" : "failed",
      logs: claudeResponse.output,
      errors: claudeResponse.error,
    });

    console.log(
      `✅ Task ${data.task.id} ${claudeResponse.success ? "finished" : "failed"}.`,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("❌ Polling error:", message);
  } finally {
    // Wait 5 seconds before checking for the next task
    setTimeout(pollTasks, 5000);
  }
};

runPreFlightChecks()
  .then(() => {
    console.log("📡 Listener active. Waiting for instructions...");
    pollTasks();
  })
  .catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ Pre-flight check failed: ${message}`);
    process.exit(1);
  });
