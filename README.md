# go2rtc-tauri

基于 Tauri 2 + Vue 3 构建的 [go2rtc](https://github.com/AlexxIT/go2rtc) 桌面端 GUI 管理工具。

它提供了一个现代化的用户界面来管理 go2rtc 流媒体服务器，支持配置编辑、实时日志查看、流预览以及自动化的进程管理。

![](./docs/demo.jpg)

## ✨ 功能特性

- **可视化配置管理**：提供直观的表单界面管理 RTSP/WebRTC 流和 API 设置，同时也支持高级用户的 JSON 源码编辑。
- **进程守护**：一键启动/停止 go2rtc 服务。在启动前会自动检测并优雅地结束占用目标端口（如 8554, 1984 等）的冲突进程。
- **实时日志**：内置 xterm.js 终端，实时展示 go2rtc 的运行日志，并对日志格式和颜色进行了美化解析。
- **自动化控制**：
  - **开机自启**：配置应用随系统启动。
  - **自动运行**：应用启动后自动拉起 go2rtc 服务。
- **跨平台**：通过 Tauri Sidecar 机制，支持 Windows (x64), macOS (Apple Silicon/Intel), Linux (x64)。

## 🛠️ 技术栈

- **核心框架**: [Tauri 2.0](https://tauri.app/) (Rust)
- **前端框架**: [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/)
- **语言**: TypeScript
- **样式**: [Unocss](https://unocss.dev/) (Utility-first CSS)
- **状态管理**: Pinia + VueUse
- **终端组件**: xterm.js

## 🚀 快速开始

### 开发环境设置

1. **环境要求**
   - Node.js (推荐 v20+)
   - Rust (最新稳定版)
   - pnpm

2. **安装依赖**

   ```bash
   pnpm install
   ```

3. **准备 Sidecar**
   项目包含一个自动脚本，用于根据当前操作系统架构下载对应的 `go2rtc` (v1.9.12) 二进制文件到 `src-tauri/sidecar/` 目录：

   ```bash
   pnpm check
   ```

4. **启动开发服务器**

   ```bash
   pnpm dev
   ```

5. **构建应用**
   ```bash
   pnpm build
   ```

## 📦 架构说明

本项目使用了 Tauri 的 **Sidecar (边车)** 模式来打包和运行 `go2rtc` 二进制文件。

- **二进制管理**: 构建脚本 (`scripts/check.mjs`) 会自动处理二进制文件的下载和重命名，以匹配 Tauri 的目标平台命名规范（例如 `go2rtc-x86_64-pc-windows-msvc.exe`）。
- **配置持久化**: 用户配置存储在本地存储中，并在启动 Sidecar 时动态生成配置文件传递给 go2rtc。
- **日志处理**: Rust 后端通过 Command API 启动子进程，并将 `stdout`/`stderr` 实时转发给前端，前端进行解析和着色渲染。

## 📄 许可证

MIT License

---

**致谢**: 本项目是 [go2rtc](https://github.com/AlexxIT/go2rtc) 的 GUI 包装器，核心流媒体功能由 go2rtc 提供。
