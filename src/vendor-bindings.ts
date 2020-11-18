import spawn from "./spawn-promise";
import * as path from "path";

export const getVendorPath = () => path.join(__dirname, "..", "vendor");

export const getSquirrelWin32CLIPath = () =>
  path.join(getVendorPath(), "Squirrel.exe");

const getSquirrelCLIPath = () => {
  switch (getEnvironmentMode()) {
    case "wine-mono":
    case "wine64-mono":
      return path.join(getVendorPath(), "Squirrel-Mono.exe");
    case "win32":
      return getSquirrelWin32CLIPath();
  }
};

type EnvironmentMode = "wine-mono" | "wine64-mono" | "win32";
export const getEnvironmentMode = (() => {
  const getEnvironmentModeImpl = (): EnvironmentMode => {
    switch (true) {
      case process.platform === "win32":
        return "win32";
      case process.platform !== "win32" && process.arch === "x64":
        return "wine64-mono";
      case process.platform !== "win32" && process.arch !== "x64":
        return "wine-mono";
      default: {
        throw new Error("Environment Mode: Wrong branch");
      }
    }
  };
  let mode: EnvironmentMode;
  return () => {
    if (!mode) {
      mode = getEnvironmentModeImpl();
      console.log("Using environment", mode);
    }
    return mode;
  };
})();

export const spawnOrUseMono = (cmd: string, args: string[]) => {
  switch (getEnvironmentMode()) {
    case "win32":
      return spawn(cmd, args);
    case "wine64-mono":
    case "wine-mono":
      return spawn("mono", [cmd, ...args]);
  }
};

export const spawnOrUseWine = (cmd: string, args: string[]) => {
  switch (getEnvironmentMode()) {
    case "win32":
      return spawn(cmd, args);
    case "wine64-mono":
      return spawn("wine64", [cmd, ...args]);
    case "wine-mono":
      return spawn("wine", [cmd, ...args]);
  }
};

export const useRCEdit = (args: string[]) =>
  spawnOrUseWine(path.resolve(getVendorPath(), "rcedit.exe"), args);

export const useNuget = (args: string[]) =>
  spawnOrUseMono(path.join(getVendorPath(), "nuget.exe"), args);

export const useSyncReleases = (args: string[]) =>
  spawnOrUseMono(path.join(getVendorPath(), "SyncReleases.exe"), args);

export const useSquirrelCLI = (args: string[]) =>
  spawnOrUseMono(getSquirrelCLIPath(), args);
