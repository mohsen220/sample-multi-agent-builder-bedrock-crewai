import json
from typing import Type, Optional
from pydantic import BaseModel, Field
from crewai_tools.tools.base_tool import BaseTool
import boto3
import base64
import io
from PIL import Image
import time
import random
import os

class ImagePromptSchema(BaseModel):
    """Input prompt for Generic Image Generator Tool."""
    prompt: str = Field(description="The text prompt describing the image to generate")

class ImageGeneratorTool(BaseTool):
    name: str = "ImageGenerator"
    description: str = "Generates images from text prompts using Amazon Bedrock."
    args_schema: Type[BaseModel] = ImagePromptSchema

    def _run(self, **kwargs) -> str:
        prompt = kwargs.get("prompt")

        if not prompt:
            return "Prompt is required."
        
        if len(prompt) > 500:
            return f"Error: Prompt exceeds 500 characters. Please provide a shorter description."

        bedrock = boto3.client('bedrock-runtime')

        body = json.dumps({
            "prompt": prompt,
            "seed": int(time.time()) % 4294967295,  # Use time-based seed
        })

        try:
            response = bedrock.invoke_model(
                modelId='stability.stable-image-ultra-v1:0',
                body=body
            )
            
            output_body = json.loads(response["body"].read())
            base64_image = output_body["images"][0]

            # Ensure images directory exists
            os.makedirs("images", exist_ok=True)
            
            new_file_name = f"image_{time.time()}.txt"
            with open("images/" + new_file_name, "w", encoding="utf-8") as file:
                file.write(base64_image)

            return json.dumps({
                "type": "image",
                "image_file_name": new_file_name
            })

        except Exception as e:
            return f"Error generating image: {str(e)}"