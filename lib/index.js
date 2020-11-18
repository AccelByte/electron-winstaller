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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWindowsInstaller = exports.convertVersion = void 0;
var asar = __importStar(require("asar"));
var temp_utils_1 = require("./temp-utils");
var fs = __importStar(require("fs-extra"));
var path = __importStar(require("path"));
var lodash_template_1 = __importDefault(require("lodash.template"));
var vendor_bindings_1 = require("./vendor-bindings");
var log = require("debug")("electron-windows-installer:main");
var DEFAULT_LOADING_GIF = path.join(__dirname, "..", "resources", "install-spinner.gif");
function convertVersion(version) {
    var parts = version.split("-");
    var mainVersion = parts.shift();
    if (parts.length > 0) {
        return [mainVersion, parts.join("-").replace(/\./g, "")].join("-");
    }
    else {
        return mainVersion;
    }
}
exports.convertVersion = convertVersion;
function createWindowsInstaller(options) {
    return __awaiter(this, void 0, void 0, function () {
        var appDirectory, outputDirectory, loadingGif, appSquirrelExePath, certificateFile, certificatePassword, remoteReleases, signWithParams, signTool, remoteToken, metadata, appResources, asarFile, appMetadata, templateData, nuspecContent, nugetOutput, targetNuspecPath, _a, _b, nupkgPath, releaseArgs, _c, setupPath, unfixedSetupPath, msiPath, unfixedMsiPath;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    appDirectory = options.appDirectory, outputDirectory = options.outputDirectory, loadingGif = options.loadingGif;
                    outputDirectory = path.resolve(outputDirectory || "installer");
                    appSquirrelExePath = path.join(appDirectory, "Squirrel.exe");
                    return [4 /*yield*/, fs.copy(vendor_bindings_1.getSquirrelWin32CLIPath(), appSquirrelExePath)];
                case 1:
                    _d.sent();
                    if (!(options.setupIcon && options.skipUpdateIcon !== true)) return [3 /*break*/, 3];
                    return [4 /*yield*/, vendor_bindings_1.useRCEdit([appSquirrelExePath, "--set-icon", options.setupIcon])];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3:
                    loadingGif = loadingGif ? path.resolve(loadingGif) : DEFAULT_LOADING_GIF;
                    certificateFile = options.certificateFile, certificatePassword = options.certificatePassword, remoteReleases = options.remoteReleases, signWithParams = options.signWithParams, signTool = options.signTool, remoteToken = options.remoteToken;
                    metadata = {
                        description: "",
                        iconUrl: "https://raw.githubusercontent.com/electron/electron/master/shell/browser/resources/win/electron.ico",
                    };
                    if (!(options.usePackageJson !== false)) return [3 /*break*/, 8];
                    appResources = path.join(appDirectory, "resources");
                    asarFile = path.join(appResources, "app.asar");
                    appMetadata = void 0;
                    return [4 /*yield*/, fs.pathExists(asarFile)];
                case 4:
                    if (!_d.sent()) return [3 /*break*/, 5];
                    appMetadata = JSON.parse(asar.extractFile(asarFile, "package.json"));
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, fs.readJson(path.join(appResources, "app", "package.json"))];
                case 6:
                    appMetadata = _d.sent();
                    _d.label = 7;
                case 7:
                    Object.assign(metadata, {
                        exe: appMetadata.name + ".exe",
                        title: appMetadata.productName || appMetadata.name,
                    }, appMetadata);
                    _d.label = 8;
                case 8:
                    Object.assign(metadata, options);
                    if (!metadata.authors) {
                        if (typeof metadata.author === "string") {
                            metadata.authors = metadata.author;
                        }
                        else {
                            // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
                            metadata.authors = (metadata.author || {}).name || "";
                        }
                    }
                    metadata.owners = metadata.owners || metadata.authors;
                    metadata.version = convertVersion(metadata.version);
                    metadata.copyright =
                        metadata.copyright ||
                            "Copyright \u00A9 " + new Date().getFullYear() + " " + (metadata.authors || metadata.owners);
                    return [4 /*yield*/, fs.readFile(path.join(__dirname, "..", "template.nuspectemplate"), "utf8")];
                case 9:
                    templateData = _d.sent();
                    if (path.sep === "/") {
                        templateData = templateData.replace(/\\/g, "/");
                    }
                    nuspecContent = lodash_template_1.default(templateData)(metadata);
                    log("Created NuSpec file:\n" + nuspecContent);
                    return [4 /*yield*/, temp_utils_1.createTempDir("si-")];
                case 10:
                    nugetOutput = _d.sent();
                    targetNuspecPath = path.join(nugetOutput, metadata.name + ".nuspec");
                    return [4 /*yield*/, fs.writeFile(targetNuspecPath, nuspecContent)];
                case 11:
                    _d.sent();
                    // Call NuGet to create our package
                    _a = log;
                    return [4 /*yield*/, vendor_bindings_1.useNuget([
                            "pack",
                            targetNuspecPath,
                            "-BasePath",
                            appDirectory,
                            "-OutputDirectory",
                            nugetOutput,
                            "-NoDefaultExcludes",
                        ])];
                case 12:
                    // Call NuGet to create our package
                    _a.apply(void 0, [_d.sent()]);
                    if (!remoteReleases) return [3 /*break*/, 14];
                    _b = log;
                    return [4 /*yield*/, vendor_bindings_1.useSyncReleases((function () {
                            switch (true) {
                                case !!remoteToken:
                                    return [
                                        "-u",
                                        remoteReleases,
                                        "-r",
                                        outputDirectory,
                                        "-t",
                                        remoteToken,
                                    ];
                                default:
                                    return ["-u", remoteReleases, "-r", outputDirectory];
                            }
                        })())];
                case 13:
                    _b.apply(void 0, [_d.sent()]);
                    _d.label = 14;
                case 14:
                    nupkgPath = path.join(nugetOutput, metadata.name + "." + metadata.version + ".nupkg");
                    releaseArgs = [
                        "--releasify",
                        nupkgPath,
                        "--releaseDir",
                        outputDirectory,
                        "--loadingGif",
                        loadingGif,
                    ];
                    (function () {
                        switch (signTool) {
                            case "osslsigncode": {
                                if (signWithParams) {
                                    return releaseArgs.push("--signWithParams", signWithParams);
                                }
                                if (certificateFile && certificatePassword) {
                                    return releaseArgs.push("--signWithParams", "-pkcs12 \"" + path.resolve(certificateFile) + "\" -pass \"" + certificatePassword + "\"");
                                }
                                break;
                            }
                            default: {
                                if (signWithParams &&
                                    signWithParams.includes("/f") &&
                                    signWithParams.includes("/p")) {
                                    return releaseArgs.push("--signWithParams", signWithParams);
                                }
                                if (signWithParams && certificateFile && certificatePassword) {
                                    return releaseArgs.push("--signWithParams", signWithParams + " /a /f \"" + path.resolve(certificateFile) + "\" /p \"" + certificatePassword + "\"");
                                }
                                if (certificateFile && certificatePassword) {
                                    return releaseArgs.push("--signWithParams", "/a /f \"" + path.resolve(certificateFile) + "\" /p \"" + certificatePassword + "\"");
                                }
                                break;
                            }
                        }
                    })();
                    if (signTool) {
                        releaseArgs.push("--signTool", signTool);
                    }
                    if (options.setupIcon) {
                        releaseArgs.push("--setupIcon");
                        releaseArgs.push(path.resolve(options.setupIcon));
                    }
                    if (options.noMsi) {
                        releaseArgs.push("--no-msi");
                    }
                    if (options.noDelta) {
                        releaseArgs.push("--no-delta");
                    }
                    if (options.frameworkVersion) {
                        releaseArgs.push("--framework-version");
                        releaseArgs.push(options.frameworkVersion);
                    }
                    _c = log;
                    return [4 /*yield*/, vendor_bindings_1.useSquirrelCLI(releaseArgs)];
                case 15:
                    _c.apply(void 0, [_d.sent()]);
                    if (!(options.fixUpPaths !== false)) return [3 /*break*/, 20];
                    log("Fixing up paths");
                    if (!(metadata.productName || options.setupExe)) return [3 /*break*/, 17];
                    setupPath = path.join(outputDirectory, options.setupExe || metadata.productName + "Setup.exe");
                    unfixedSetupPath = path.join(outputDirectory, "Setup.exe");
                    log("Renaming " + unfixedSetupPath + " => " + setupPath);
                    return [4 /*yield*/, fs.rename(unfixedSetupPath, setupPath)];
                case 16:
                    _d.sent();
                    _d.label = 17;
                case 17:
                    if (!(metadata.productName || options.setupMsi)) return [3 /*break*/, 20];
                    msiPath = path.join(outputDirectory, options.setupMsi || metadata.productName + "Setup.msi");
                    unfixedMsiPath = path.join(outputDirectory, "Setup.msi");
                    return [4 /*yield*/, fs.pathExists(unfixedMsiPath)];
                case 18:
                    if (!_d.sent()) return [3 /*break*/, 20];
                    log("Renaming " + unfixedMsiPath + " => " + msiPath);
                    return [4 /*yield*/, fs.rename(unfixedMsiPath, msiPath)];
                case 19:
                    _d.sent();
                    _d.label = 20;
                case 20: return [2 /*return*/];
            }
        });
    });
}
exports.createWindowsInstaller = createWindowsInstaller;
//# sourceMappingURL=index.js.map