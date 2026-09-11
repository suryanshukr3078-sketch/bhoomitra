import asyncio
import sys
import uvicorn
import uvicorn.loops.asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    uvicorn.loops.asyncio.asyncio_loop_factory = lambda use_subprocess=False: asyncio.SelectorEventLoop


def run() -> None:
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, loop="asyncio")


if __name__ == "__main__":
    run()
