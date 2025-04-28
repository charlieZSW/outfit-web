# 实时 Markdown 编辑器 (Outfit Web)

一个简单、安全、高效的 Web 应用，允许用户输入 Markdown 文本并实时预览渲染后的、经过安全处理的 HTML 效果。

## 核心功能

*   **Markdown 输入区:** 提供一个文本区域供用户输入和编辑 Markdown 格式的文本。
*   **实时 HTML 预览区:** 根据用户输入的 Markdown 文本，实时生成并显示相应的 HTML 预览。
*   **前端渲染:** Markdown 到 HTML 的转换完全在用户浏览器端通过 JavaScript 实现。
*   **安全保障:** 对生成的 HTML 进行严格的清理 (Sanitization) 使用 `DOMPurify`，以防止跨站脚本攻击 (XSS)。
*   **代码高亮:** 使用 `highlight.js` 对预览区的代码块进行语法高亮。

## 技术栈

*   **后端:** Python (Flask) - 极简后端，主要负责提供静态文件 (`index.html`, CSS, JS)。
*   **前端:** Vanilla JavaScript (ES6+), HTML5, CSS3。
*   **关键库:**
    *   `marked.js`: 用于 Markdown 解析。
    *   `DOMPurify`: 用于 HTML 安全清理 (防 XSS)。
    *   `highlight.js`: 用于代码块语法高亮。

## 开发设置与运行

**前提:** 需要安装 Python 3.x 和 pip。

1.  **克隆仓库 (如果需要):**
    ```bash
    git clone <repository-url>
    cd outfit-web
    ```

2.  **创建并激活 Python 虚拟环境:**
    ```bash
    # Linux / macOS
    python3 -m venv venv
    source venv/bin/activate
    
    # Windows
    python -m venv venv
    .\venv\Scripts\activate 
    ```
    *推荐使用虚拟环境来隔离项目依赖。*

3.  **安装后端依赖:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **运行 Flask 开发服务器:**
    ```bash
    flask run --debug
    ```
    *`--debug` 参数会启用调试模式，在代码更改时自动重载服务器。生产环境部署时请勿使用此模式。*

5.  **访问应用:**
    在浏览器中打开 Flask 输出的本地地址 (通常是 `http://127.0.0.1:5000` 或 `http://localhost:5000`)。

## 项目规范

本项目遵循一套详细的开发规范，定义在 `.cursor/rules/` 目录下的 `.mdc` 文件中。这些规则涵盖了项目结构、技术选型、代码风格、安全要求等方面。在进行开发贡献前，请务必熟悉相关规则。

## 项目记忆

项目的关键决策、变更历史和重要信息记录在 `memory.md` 文件中。 