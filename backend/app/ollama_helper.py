import logging
import requests
import threading
from app.config import Config

logger = logging.getLogger("OllamaHelper")

def check_and_pull_model_async(model_name: str = "qwen2.5:latest"):
    """
    Checks if the local Ollama service has the model installed.
    If not, pulls it in a background thread to avoid blocking the main server startup.
    """
    def pull_task():
        try:
            # 1. Check if Ollama is online
            tags_url = f"{Config.OLLAMA_HOST}/api/tags"
            logger.info(f"Checking Ollama models at {tags_url}...")
            response = requests.get(tags_url, timeout=3.0)
            
            if response.status_code != 200:
                logger.warning(f"Ollama server returned status code {response.status_code}.")
                return
                
            # Parse installed models
            data = response.json()
            models = data.get("models", [])
            installed_models = []
            for m in models:
                name = m.get("name", "")
                installed_models.append(name)
                # Also check base name without tag
                if ":" in name:
                    installed_models.append(name.split(":")[0])

            # Check if target model is present
            target_base = model_name.split(":")[0] if ":" in model_name else model_name
            if model_name in installed_models or target_base in installed_models:
                logger.info(f"Ollama local model '{model_name}' is already present.")
                return

            # 2. Pull the model if missing
            logger.info(f"Ollama model '{model_name}' is missing. Initiating background pull...")
            pull_url = f"{Config.OLLAMA_HOST}/api/pull"
            payload = {
                "name": model_name,
                "stream": False
            }
            
            # Use long timeout (10 minutes) for model downloading
            pull_response = requests.post(pull_url, json=payload, timeout=600.0)
            if pull_response.status_code == 200:
                logger.info(f"Successfully pulled model '{model_name}' to Ollama registry.")
            else:
                logger.error(f"Failed to pull model '{model_name}'. Status code: {pull_response.status_code}")
                
        except requests.exceptions.ConnectionError:
            logger.info("Local Ollama service is not running. Dynamic remote Groq fallback will be utilized.")
        except Exception as e:
            logger.warning(f"Unexpected error while checking Ollama model: {e}")

    # Spin up thread as daemon so it shuts down if server stops
    thread = threading.Thread(target=pull_task, daemon=True)
    thread.start()
