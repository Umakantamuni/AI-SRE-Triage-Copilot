from concurrent.futures import (
    ThreadPoolExecutor,
    TimeoutError as FutureTimeoutError,
)

from google import genai

from app.config import settings


class AIService:
    AI_TIMEOUT_SECONDS = 30

    def __init__(self):
        self.client = None

        if (
            settings.ai_enabled
            and settings.gemini_api_key
        ):
            self.client = genai.Client(
                api_key=settings.gemini_api_key
            )

    def is_available(self) -> bool:
        return self.client is not None

    def _generate(self, prompt: str) -> str:
        if self.client is None:
            raise RuntimeError(
                "AI service is not available."
            )

        response = self.client.models.generate_content(
            model=settings.ai_model,
            contents=prompt,
        )

        output = response.text or ""

        if not output.strip():
            raise RuntimeError(
                "AI service returned an empty response."
            )

        return output.strip()

    def generate(self, prompt: str) -> str:
        if self.client is None:
            raise RuntimeError(
                "AI service is not available."
            )

        executor = ThreadPoolExecutor(
            max_workers=1
        )

        future = executor.submit(
            self._generate,
            prompt,
        )

        try:
            return future.result(
                timeout=self.AI_TIMEOUT_SECONDS
            )

        except FutureTimeoutError as exc:
            future.cancel()

            raise TimeoutError(
                "AI service request timed out."
            ) from exc

        except Exception as exc:
            raise RuntimeError(
                f"AI generation failed: {exc}"
            ) from exc

        finally:
            executor.shutdown(
                wait=False,
                cancel_futures=True,
            )