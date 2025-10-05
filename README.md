# 🎬 Video Thumb Generator

A simple CLI tool to automatically generate **video thumbnails** using [FFmpeg](https://ffmpeg.org/).  
No need to install FFmpeg manually, everything runs out of the box via Node.js.

---

## ✨ Features

- 🔍 Scans a folder and finds all supported video files
- 🖼️ Generates thumbnails in `.jpg` format with `-thumb` suffix
- ⚙️ Respects **16:9 ratio** (1280x720 resolution)
- 💾 Skips existing thumbnails or lets you choose to overwrite (Y/N/A for all)
- ✅ Works cross-platform (macOS, Windows, Linux)

---

## 🧩 Supported Formats

`mp4`, `mkv`, `avi`, `mov`, `wmv`, `mpg`, `mpeg`

---

## 🚀 Installation

Clone this repository and install dependencies:

```bash
npm install
```

## Usage

```bash
npm start
```
