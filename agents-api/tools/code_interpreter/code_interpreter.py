from crewai_tools import CodeInterpreterTool as BaseCodeInterpreterTool
import asyncio
import signal

class TimeoutCodeInterpreterTool(BaseCodeInterpreterTool):
    def __init__(self, timeout=120, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.timeout = timeout
    
    def _run(self, **kwargs):
        try:
            # Set a timeout for the code execution
            result = asyncio.run(self._run_with_timeout(**kwargs))
            return result
        except asyncio.TimeoutError:
            return "Code execution timed out. Please simplify your code or break it into smaller parts."
    
    async def _run_with_timeout(self, **kwargs):
        # Run the original _run method with a timeout
        return await asyncio.wait_for(
            asyncio.to_thread(super()._run, **kwargs),
            timeout=self.timeout
        )