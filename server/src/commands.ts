import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { CommandState } from "@uds-poc/shared";

const execFileAsync = promisify(execFile);

export async function runCommand(
  command: string,
  args: string[],
  options: { timeoutMs?: number; env?: NodeJS.ProcessEnv } = {}
): Promise<CommandState> {
  const printable = [command, ...args].join(" ");

  try {
    const result = await execFileAsync(command, args, {
      timeout: options.timeoutMs ?? 30_000,
      env: options.env ?? process.env,
      maxBuffer: 10 * 1024 * 1024
    });

    return {
      ok: true,
      command: printable,
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: 0
    };
  } catch (error) {
    const failure = error as {
      stdout?: string;
      stderr?: string;
      code?: number | string;
      signal?: string;
      message?: string;
    };

    return {
      ok: false,
      command: printable,
      stdout: failure.stdout ?? "",
      stderr: failure.stderr ?? failure.message ?? "",
      exitCode: typeof failure.code === "number" ? failure.code : null
    };
  }
}

export async function commandExists(command: string): Promise<string | null> {
  const result = await runCommand("/bin/zsh", ["-lc", `command -v ${command}`], { timeoutMs: 5_000 });
  return result.ok ? result.stdout.trim() : null;
}
