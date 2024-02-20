"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSquirrelCLI = exports.useSyncReleases = exports.useNuget = exports.useRCEdit = exports.spawnOrUseWine = exports.spawnOrUseMono = exports.getEnvironmentMode = exports.getSquirrelWin32CLIPath = exports.getVendorPath = void 0;
var spawn_promise_1 = __importDefault(require("./spawn-promise"));
var path = __importStar(require("path"));
var getVendorPath = function () { return path.join(__dirname, "..", "vendor"); };
exports.getVendorPath = getVendorPath;
var getSquirrelWin32CLIPath = function () {
    return path.join((0, exports.getVendorPath)(), "Squirrel.exe");
};
exports.getSquirrelWin32CLIPath = getSquirrelWin32CLIPath;
var getSquirrelCLIPath = function () {
    switch ((0, exports.getEnvironmentMode)()) {
        case "wine-mono":
        case "wine64-mono":
            return path.join((0, exports.getVendorPath)(), "Squirrel-Mono.exe");
        case "win32":
            return (0, exports.getSquirrelWin32CLIPath)();
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
var spawnOrUseMono = function (cmd, args) {
    switch ((0, exports.getEnvironmentMode)()) {
        case "win32":
            return (0, spawn_promise_1.default)(cmd, args);
        case "wine64-mono":
        case "wine-mono":
            return (0, spawn_promise_1.default)("mono", __spreadArray([cmd], args, true));
    }
};
exports.spawnOrUseMono = spawnOrUseMono;
var spawnOrUseWine = function (cmd, args) {
    switch ((0, exports.getEnvironmentMode)()) {
        case "win32":
            return (0, spawn_promise_1.default)(cmd, args);
        case "wine64-mono":
            return (0, spawn_promise_1.default)("wine64", __spreadArray([cmd], args, true));
        case "wine-mono":
            return (0, spawn_promise_1.default)("wine", __spreadArray([cmd], args, true));
    }
};
exports.spawnOrUseWine = spawnOrUseWine;
var useRCEdit = function (args) {
    return (0, exports.spawnOrUseWine)(path.resolve((0, exports.getVendorPath)(), "rcedit.exe"), args);
};
exports.useRCEdit = useRCEdit;
var useNuget = function (args) {
    return (0, exports.spawnOrUseMono)(path.join((0, exports.getVendorPath)(), "nuget.exe"), args);
};
exports.useNuget = useNuget;
var useSyncReleases = function (args) {
    return (0, exports.spawnOrUseMono)(path.join((0, exports.getVendorPath)(), "SyncReleases.exe"), args);
};
exports.useSyncReleases = useSyncReleases;
var useSquirrelCLI = function (args) {
    return (0, exports.spawnOrUseMono)(getSquirrelCLIPath(), args);
};
exports.useSquirrelCLI = useSquirrelCLI;
//# sourceMappingURL=vendor-bindings.js.map