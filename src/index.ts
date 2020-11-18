import * as asar from '@electron/asar';
import { createTempDir } from './temp-utils';
import * as fs from 'fs-extra';
import { Metadata, SquirrelWindowsOptions, PersonMetadata } from './options';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import spawn from './spawn-promise';
import template from 'lodash.template';

export { SquirrelWindowsOptions } from './options';
export { SquirrelWindowsOptions as Options} from './options';

const DEFAULT_LOADING_GIF = path.join(
  __dirname,
  "..",
  "resources",
  "install-spinner.gif"
);

export function convertVersion(version: string): string {
  const parts = version.split('+')[0].split('-');
  const mainVersion = parts.shift();

  if (parts.length > 0) {
    return [mainVersion, parts.join("-").replace(/\./g, "")].join("-");
  } else {
    return mainVersion as string;
  }
}

function checkIfCommandExists(command: string): Promise<boolean> {
  const checkCommand = os.platform() === 'win32' ? 'where' : 'which';
  return new Promise((resolve) => {
    exec(`${checkCommand} ${command}`, (error) => {
      resolve(error ? false : true);
    });
  });
}


export async function createWindowsInstaller(options: SquirrelWindowsOptions): Promise<void> {
  let useMono = false;

  const monoExe = 'mono';
  const wineExe = ['arm64', 'x64'].includes(process.arch) ? 'wine64' : 'wine';

  if (process.platform !== 'win32') {
    useMono = true;
    const [hasWine, hasMono] = await Promise.all([
      checkIfCommandExists(wineExe),
      checkIfCommandExists(monoExe)
    ]);

    if (!hasWine || !hasMono) {
      throw new Error('You must install both Mono and Wine on non-Windows');
    }

    log(`Using Mono: '${monoExe}'`);
    log(`Using Wine: '${wineExe}'`);
  }

  // eslint-disable-next-line prefer-const
  let { appDirectory, outputDirectory, loadingGif } = options;
  outputDirectory = path.resolve(outputDirectory || "installer");

  const appSquirrelExePath = path.join(appDirectory, "Squirrel.exe");

  await fs.copy(vendorUpdate, appUpdate);
  if (options.setupIcon && (options.skipUpdateIcon !== true)) {
    let cmd = path.join(vendorPath, 'rcedit.exe');
    const args = [
      appUpdate,
      '--set-icon', options.setupIcon
    ];

    if (useMono) {
      args.unshift(cmd);
      cmd = wineExe;
    }

    await spawn(cmd, args);
  }

  loadingGif = loadingGif ? path.resolve(loadingGif) : DEFAULT_LOADING_GIF;

  const { certificateFile, certificatePassword, remoteReleases, signWithParams, remoteToken } = options;

  const metadata: Metadata = {
    description: '',
    iconUrl: 'https://raw.githubusercontent.com/electron/electron/main/shell/browser/resources/win/electron.ico'
  };

  if (options.usePackageJson !== false) {
    const appResources = path.join(appDirectory, "resources");
    const asarFile = path.join(appResources, "app.asar");
    let appMetadata;

    if (await fs.pathExists(asarFile)) {
      appMetadata = JSON.parse(asar.extractFile(asarFile, 'package.json').toString());
    } else {
      appMetadata = await fs.readJson(
        path.join(appResources, "app", "package.json")
      );
    }

    Object.assign(
      metadata,
      {
        exe: `${appMetadata.name}.exe`,
        title: appMetadata.productName || appMetadata.name,
      },
      appMetadata
    );
  }

  Object.assign(metadata, options);

  if (!metadata.authors) {
    if (typeof metadata.author === "string") {
      metadata.authors = metadata.author;
    } else {
      metadata.authors = (metadata.author || ({} as PersonMetadata)).name || "";
    }
  }

  metadata.owners = metadata.owners || metadata.authors;
  metadata.version = convertVersion(metadata.version as string);
  metadata.copyright = metadata.copyright ||
    `Copyright © ${new Date().getFullYear()} ${metadata.authors || metadata.owners}`;
  metadata.additionalFiles = metadata.additionalFiles || [];

  if (await fs.pathExists(path.join(appDirectory, 'swiftshader'))) {
    metadata.additionalFiles.push({ src: 'swiftshader\\**', target: 'lib\\net45\\swiftshader' });
  }

  if (await fs.pathExists(path.join(appDirectory, 'vk_swiftshader_icd.json'))) {
    metadata.additionalFiles.push({ src: 'vk_swiftshader_icd.json', target: 'lib\\net45' });
  }

  const templatePath = options.nuspecTemplate || path.join(__dirname, '..', 'template.nuspectemplate');
  let templateData = await fs.readFile(templatePath, 'utf8');
  if (path.sep === '/') {
    templateData = templateData.replace(/\\/g, '/');
    for (const f of metadata.additionalFiles) {
      f.src = f.src.replace(/\\/g, '/');
      f.target = f.target.replace(/\\/g, '/');
    }
  }
  const nuspecContent = template(templateData)(metadata);

  log(`Created NuSpec file:\n${nuspecContent}`);

  const nugetOutput = await createTempDir("si-");
  const targetNuspecPath = path.join(nugetOutput, metadata.name + ".nuspec");

  await fs.writeFile(targetNuspecPath, nuspecContent);

  // Call NuGet to create our package
  log(
    await useNuget([
      "pack",
      targetNuspecPath,
      "-BasePath",
      appDirectory,
      "-OutputDirectory",
      nugetOutput,
      "-NoDefaultExcludes",
    ])
  );

  if (remoteReleases) {
    log(
      await useSyncReleases(
        (() => {
          switch (true) {
            case !!remoteToken:
              return [
                "-u",
                remoteReleases,
                "-r",
                outputDirectory,
                "-t",
                remoteToken as string,
              ];
            default:
              return ["-u", remoteReleases, "-r", outputDirectory];
          }
        })()
      )
    );
  }

  const nupkgPath = path.join(
    nugetOutput,
    `${metadata.name}.${metadata.version}.nupkg`
  );

  const releaseArgs = [
    "--releasify",
    nupkgPath,
    "--releaseDir",
    outputDirectory,
    "--loadingGif",
    loadingGif,
  ];

  (() => {
    switch (signTool) {
      case "osslsigncode": {
        if (signWithParams) {
          return releaseArgs.push("--signWithParams", signWithParams);
        }

        if (certificateFile && certificatePassword) {
          return releaseArgs.push(
            "--signWithParams",
            `-pkcs12 "${path.resolve(
              certificateFile
            )}" -pass "${certificatePassword}"`
          );
        }
        break;
      }
      default: {
        if (
          signWithParams &&
          signWithParams.includes("/f") &&
          signWithParams.includes("/p")
        ) {
          return releaseArgs.push("--signWithParams", signWithParams);
        }

        if (signWithParams && certificateFile && certificatePassword) {
          return releaseArgs.push(
            "--signWithParams",
            `${signWithParams} /a /f "${path.resolve(
              certificateFile
            )}" /p "${certificatePassword}"`
          );
        }

        if (certificateFile && certificatePassword) {
          return releaseArgs.push(
            "--signWithParams",
            `/a /f "${path.resolve(
              certificateFile
            )}" /p "${certificatePassword}"`
          );
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

  log(await useSquirrelCLI(releaseArgs));

  if (options.fixUpPaths !== false) {
    log("Fixing up paths");

    if (metadata.productName || options.setupExe) {
      const setupPath = path.join(
        outputDirectory,
        options.setupExe || `${metadata.productName}Setup.exe`
      );
      const unfixedSetupPath = path.join(outputDirectory, "Setup.exe");
      log(`Renaming ${unfixedSetupPath} => ${setupPath}`);
      await fs.rename(unfixedSetupPath, setupPath);
    }

    if (metadata.productName || options.setupMsi) {
      const msiPath = path.join(
        outputDirectory,
        options.setupMsi || `${metadata.productName}Setup.msi`
      );
      const unfixedMsiPath = path.join(outputDirectory, "Setup.msi");
      if (await fs.pathExists(unfixedMsiPath)) {
        log(`Renaming ${unfixedMsiPath} => ${msiPath}`);
        await fs.rename(unfixedMsiPath, msiPath);
      }
    }
  }
}
