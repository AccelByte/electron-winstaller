"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSquirrelCLI = exports.useSyncReleases = exports.useNuget = exports.useRCEdit = exports.spawnOrUseWine = exports.spawnOrUseMono = exports.getEnvironmentMode = exports.getSquirrelWin32CLIPath = exports.getVendorPath = void 0;
var spawn_promise_1 = __importDefault(require("./spawn-promise"));
var path = __importStar(require("path"));
exports.getVendorPath = function () { return path.join(__dirname, "..", "vendor"); };
exports.getSquirrelWin32CLIPath = function () {
    return path.join(exports.getVendorPath(), "Squirrel.exe");
};
var getSquirrelCLIPath = function () {
    switch (exports.getEnvironmentMode()) {
        case "wine-mono":
        case "wine64-mono":
            return path.join(exports.getVendorPath(), "Squirrel-Mono.exe");
        case "win32":
            return exports.getSquirrelWin32CLIPath();
    }
};
exports.getEnvironmentMode = (function () {
    var getEnvironmentModeImpl = function () {
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
    var mode;
    return function () {
        if (!mode) {
            mode = getEnvironmentModeImpl();
            console.log("Using environment", mode);
        }
        return mode;
    };
})();
exports.spawnOrUseMono = function (cmd, args) {
    switch (exports.getEnvironmentMode()) {
        case "win32":
            return spawn_promise_1.default(cmd, args);
        case "wine64-mono":
        case "wine-mono":
            return spawn_promise_1.default("mono", __spreadArrays([cmd], args));
    }
};
exports.spawnOrUseWine = function (cmd, args) {
    switch (exports.getEnvironmentMode()) {
        case "win32":
            return spawn_promise_1.default(cmd, args);
        case "wine64-mono":
            return spawn_promise_1.default("wine64", __spreadArrays([cmd], args));
        case "wine-mono":
            return spawn_promise_1.default("wine", __spreadArrays([cmd], args));
    }
};
exports.useRCEdit = function (args) {
    return exports.spawnOrUseWine(path.resolve(exports.getVendorPath(), "rcedit.exe"), args);
};
exports.useNuget = function (args) {
    return exports.spawnOrUseMono(path.join(exports.getVendorPath(), "nuget.exe"), args);
};
exports.useSyncReleases = function (args) {
    return exports.spawnOrUseMono(path.join(exports.getVendorPath(), "SyncReleases.exe"), args);
};
exports.useSquirrelCLI = function (args) {
    return exports.spawnOrUseMono(getSquirrelCLIPath(), args);
};
//# sourceMappingURL=vendor-bindings.js.map