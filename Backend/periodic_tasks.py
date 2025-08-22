import asyncio

async def session_logger(sessions, interval=5):
    while True:
        for session in sessions.values():
            session.printData()
        await asyncio.sleep(interval)   