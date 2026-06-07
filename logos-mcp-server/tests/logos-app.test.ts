import { describe, it, expect } from "vitest";
import { getOpenUrlCommand } from "../src/services/logos-app.js";

describe("getOpenUrlCommand", () => {
  const url = "logos4:///Search?type=Bible&q=grace";

  it("uses open on macOS", () => {
    const cmd = getOpenUrlCommand(url, "darwin");
    expect(cmd).toEqual({ command: "open", args: [url] });
  });

  it("uses powershell Start-Process on Windows", () => {
    const cmd = getOpenUrlCommand(url, "win32");
    expect(cmd.command).toBe("powershell");
    expect(cmd.args).toEqual([
      "-NoProfile",
      "-Command",
      `Start-Process -FilePath '${url}'`,
    ]);
  });

  it("uses xdg-open on other platforms", () => {
    const cmd = getOpenUrlCommand(url, "linux");
    expect(cmd).toEqual({ command: "xdg-open", args: [url] });
  });
});
