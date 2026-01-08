"""
Suno Lyrics Generator Backend
使用 Claude Code SDK，支援 OAuth (claude login) 和 API Key 認證
"""

import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional

# Claude Code SDK
from claude_code_sdk import query, ClaudeCodeOptions, AssistantMessage, TextBlock

# 增加 buffer size (處理大型回應)
try:
    from claude_code_sdk._internal.transport import subprocess_cli
    subprocess_cli._MAX_BUFFER_SIZE = 50 * 1024 * 1024  # 50MB
    print("✅ Claude SDK buffer size: 50MB")
except Exception as e:
    print(f"⚠️ Failed to patch buffer size: {e}")

app = FastAPI(title="Suno Lyrics Generator API")

# CORS - 允許前端呼叫
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def check_auth_status() -> dict:
    """檢查認證狀態"""
    status = {
        'api_key_set': bool(os.environ.get('ANTHROPIC_API_KEY')),
        'oauth_logged_in': False,
    }

    # 檢查 OAuth 登入狀態 (~/.claude/)
    claude_dir = os.path.expanduser('~/.claude')
    if os.path.exists(claude_dir):
        auth_files = ['credentials.json', 'settings.json', '.credentials.json']
        for auth_file in auth_files:
            if os.path.exists(os.path.join(claude_dir, auth_file)):
                status['oauth_logged_in'] = True
                break

    status['auth_available'] = status['api_key_set'] or status['oauth_logged_in']
    status['auth_method'] = 'API Key' if status['api_key_set'] else ('OAuth' if status['oauth_logged_in'] else 'None')

    return status


class GenerateRequest(BaseModel):
    prompt: str
    max_tokens: int = 2000


@app.get("/api/health")
async def health():
    """健康檢查和認證狀態"""
    auth = check_auth_status()
    return {
        "status": "ok",
        "auth": auth
    }


@app.post("/api/generate")
async def generate(request: GenerateRequest):
    """生成歌詞 (一次性回應)"""
    auth = check_auth_status()
    if not auth['auth_available']:
        raise HTTPException(
            status_code=401,
            detail="請先執行 'claude login' 或設置 ANTHROPIC_API_KEY 環境變數"
        )

    try:
        options = ClaudeCodeOptions(
            max_turns=5,
            allowed_tools=[]  # 純對話，不需要工具
        )

        results = []
        async for message in query(prompt=request.prompt, options=options):
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        results.append(block.text)

        return {
            "success": True,
            "content": "\n".join(results),
            "auth_method": auth['auth_method']
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/stream")
async def stream(request: GenerateRequest):
    """生成歌詞 (串流回應)"""
    auth = check_auth_status()
    if not auth['auth_available']:
        raise HTTPException(
            status_code=401,
            detail="請先執行 'claude login' 或設置 ANTHROPIC_API_KEY 環境變數"
        )

    async def event_generator():
        try:
            options = ClaudeCodeOptions(
                max_turns=5,
                allowed_tools=[]
            )

            async for message in query(prompt=request.prompt, options=options):
                if isinstance(message, AssistantMessage):
                    for block in message.content:
                        if isinstance(block, TextBlock):
                            data = json.dumps({"text": block.text}, ensure_ascii=False)
                            yield f"data: {data}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            error_data = json.dumps({"error": str(e)}, ensure_ascii=False)
            yield f"data: {error_data}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


if __name__ == "__main__":
    import uvicorn

    print("\n" + "="*50)
    print("🎵 Suno Lyrics Generator Backend")
    print("="*50)

    auth = check_auth_status()
    if auth['auth_available']:
        print(f"✅ 認證方式: {auth['auth_method']}")
    else:
        print("⚠️  未認證！請執行 'claude login' 或設置 ANTHROPIC_API_KEY")

    print("="*50 + "\n")

    uvicorn.run(app, host="0.0.0.0", port=8000)
