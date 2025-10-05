import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import chalk from "chalk";
import boxen from "boxen";
import { prompt } from "enquirer";
import cliProgress from "cli-progress";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

const SUPPORTED = ["mp4", "mkv", "avi", "mov", "wmv", "mpg", "mpeg"];
const MAX_FILENAME_LENGTH = 60;

function shortenFilename(name: string, maxLength: number = MAX_FILENAME_LENGTH): string {
    if (name.length <= maxLength) return name;
    const half = Math.floor((maxLength - 3) / 2);
    return `${name.slice(0, half)}...${name.slice(-half)}`;
}

async function main() {
    console.log(
        boxen(chalk.cyan("🎬 Video Thumbnail Generator"), {
            padding: 1,
            borderColor: "cyan",
        })
    );

    const { folder } = await prompt<{ folder: string }>({
        type: "input",
        name: "folder",
        message: "Enter the folder path with videos:",
    });

    const dirPath = path.resolve(folder);
    if (!fs.existsSync(dirPath)) {
        console.error(chalk.red("❌ Directory not found!"));
        process.exit(1);
    }

    const files = fs.readdirSync(dirPath).filter((f) => {
        const stats = fs.statSync(path.join(dirPath, f));
        if (stats.size === 0) return false;
        if (f.startsWith("._") || f.startsWith(".")) return false;
        const ext = f.split(".").pop()?.toLowerCase();
        return ext && SUPPORTED.includes(ext);
    });

    if (files.length === 0) {
        console.log(chalk.yellow("No video files found."));
        return;
    }

    let overwriteAll = false;

    const progressBar = new cliProgress.SingleBar(
        {
            format: chalk.cyan("Progress") + " [{bar}] {percentage}% | {value}/{total}",
            barCompleteChar: "█",
            barIncompleteChar: "░",
            hideCursor: true,
        },
        cliProgress.Presets.shades_classic
    );

    progressBar.start(files.length, 0);

    for (const [index, file] of files.entries()) {
        const fullPath = path.join(dirPath, file);
        const baseName = path.basename(file, path.extname(file));
        const thumbPath = path.join(dirPath, `${baseName}-thumb.jpg`);
        const shortName = shortenFilename(file);

        if (fs.existsSync(thumbPath) && !overwriteAll) {
            console.log(chalk.yellow(`\nThumbnail already exists for:`));
            console.log(chalk.gray(`"${shortName}"`));

            const { overwrite } = await prompt<{ overwrite: string }>({
                type: "input",
                name: "overwrite",
                message: chalk.white("Overwrite? (Y/N/A for all):"),
            });

            const answer = overwrite.trim().toLowerCase();
            if (answer === "n") {
                progressBar.increment();
                continue;
            } else if (answer === "a" || answer === "y") {
                if (answer === "a") overwriteAll = true;
            } else {
                 //nothing;
            }
        }

        console.log(chalk.green(`\n📸 Generating thumb for: ${shortName}`));

        try {
            await new Promise<void>((resolve, reject) => {
                ffmpeg(fullPath)
                    .on("end", () => {
                        console.log(chalk.gray(`✅ Saved: ${path.basename(thumbPath)}`));
                        resolve();
                    })
                    .on("error", reject)
                    .screenshots({
                        timestamps: ["10%"],
                        filename: `${baseName}-thumb.jpg`,
                        folder: dirPath,
                        size: "1280x720",
                    });
            });
        } catch (err) {
            console.log(chalk.red(`❌ Error processing ${shortName}: ${(err as Error).message}`));
        }

        progressBar.update(index + 1);
    }

    progressBar.stop();
    console.log(chalk.cyanBright("\n✨ All done!"));
}

main().catch((err) => console.error(chalk.red(err)));
