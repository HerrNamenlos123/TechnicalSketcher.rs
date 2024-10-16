# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Fedora Requirements

```
sudo dnf install gtk3-devel pango-devel gdk-pixbuf2-devel libsoup-devel webkit2gtk3-devel
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Building

### Install pnpm

Windows (PowerShell):
```bash
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

Linux
```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### Install dependencies

```bash
pnpm install
```

### Run TechnicalSketcher in dev mode

```bash
pnpm tauri dev
```

### Build the installer

```bash
pnpm tauri build
```