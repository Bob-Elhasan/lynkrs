# Connecting Blender through BlenderMCP

[BlenderMCP](https://github.com/ahujasid/blender-mcp) lets an AI assistant
drive Blender in plain language — build and modify objects, apply materials,
pull in Poly Haven HDRIs or Sketchfab models, and generate 3D assets. It is
useful here for producing the site's visual assets; it is not part of the site
itself and nothing it does ships in the build.

`.mcp.json` in the repository root already declares the server, so Claude Code
picks it up when you open this project. The rest is on your machine, and has
to be done once.

## This only works locally

BlenderMCP is a bridge between two processes on the *same* computer:

```
Claude  →  uvx blender-mcp  →  TCP localhost:9876  →  add-on inside a running Blender
```

The add-on half lives inside the Blender GUI. So the assistant has to be
running on the machine where Blender is open — a desktop Claude Code session,
Claude Desktop, or Cursor. A cloud session (Claude Code on the web, a GitHub
Action) has no Blender and no access to your `localhost`; the server starts
but every call fails with a connection error. That is expected, not a
misconfiguration.

## 1. Prerequisites

- **Blender 3.0 or newer**
- **Python 3.10 or newer**
- **`uv`** — install it with the official installer, not `pip`:

  ```bash
  # macOS
  brew install uv

  # Linux / macOS, no Homebrew
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```

  ```powershell
  # Windows
  powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```

  `uvx` comes with it. Confirm with `uv --version`.

The server itself needs no install — `uvx blender-mcp` fetches and runs it on
demand.

## 2. Install the Blender add-on

```bash
uvx blender-mcp install-addon
```

Then in Blender:

1. **Edit → Preferences → Add-ons**
2. Enable **Interface: Blender MCP**

## 3. Start the server inside Blender

1. In the 3D viewport, press **N** to open the sidebar.
2. Open the **BlenderMCP** tab.
3. Click **Start MCP Server**.

This is the step that is easy to forget. Blender has to be open with the
server started *before* the assistant tries to talk to it, every session.

## 4. Point your assistant at it

Opening this repository in a local Claude Code session is enough — `.mcp.json`
is project-scoped and Claude Code will ask you to approve the server the first
time. Approve it, then check with `/mcp`.

To make it available everywhere instead of only in this project:

```bash
claude mcp add --scope user blender uvx blender-mcp
```

For **Claude Desktop** (`claude_desktop_config.json`) or **Cursor**
(`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "blender": {
      "command": "uvx",
      "args": ["blender-mcp"]
    }
  }
}
```

On Windows, use `"command": "cmd"` with `"args": ["/c", "uvx", "blender-mcp"]`.

## What you get

Scene and object inspection; creating, deleting and modifying objects;
materials and colour; Poly Haven assets and HDRIs; Sketchfab model search and
download; AI-generated models via Hyper3D Rodin and Hunyuan3D; and
`execute_blender_code`, which runs arbitrary Python inside Blender.

> `execute_blender_code` is what makes the whole thing flexible, and it is also
> the sharp edge — it will run whatever Python it is given, against whatever
> file you have open. **Save your work before a session**, and prefer working
> in a scratch `.blend` rather than the real asset.

The Sketchfab and Hyper3D features need API keys. Set them in the add-on's
preferences panel, or as `BLENDERMCP_SKETCHFAB_API_KEY` and
`BLENDERMCP_HYPER3D_API_KEY` in the environment. Keys do not belong in
`.mcp.json` — that file is committed.

Telemetry is on by default. Turn it off in the add-on preferences or with
`DISABLE_TELEMETRY=true`.

## If it stops working

- **"Connection refused" / the tools all fail**: Blender is closed, or
  **Start MCP Server** was never clicked in the BlenderMCP sidebar. Restarting
  the assistant does not help; start the server in Blender first.
- **Nothing happens on a cloud session**: see *This only works locally* above.
  Run it from a desktop session instead.
- **Port 9876 already in use**: something else has the port. Set `BLENDER_PORT`
  (and `BLENDER_HOST` if needed) for both Blender and the server so the two
  agree.
- **`uvx: command not found`**: `uv` is installed but not on `PATH`. Open a new
  shell, or give the config the absolute path to `uvx` — GUI apps like Claude
  Desktop do not read your shell profile.
- **Blender freezes on a big request**: the add-on runs the work on Blender's
  own thread. Ask for one change at a time rather than a whole scene at once.
