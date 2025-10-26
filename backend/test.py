import os
import uuid
import json
from typing import List, Optional
import base64
import io
import time # For the 15-second delay

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai # Import the full library
from google.genai import types # Import the types for config

# --- Configuration ---
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY must be set in .env file.")

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Vibe-Gen API",
    description="Backend for the Festive Marketing Image Generator",
    version="1.0.0"
)

# --- CORS Middleware ---
origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models for API Data Structure ---
class UploadedImage(BaseModel):
    base64_data: str
    mime_type: str

class GenerateImagePayload(BaseModel):
    company_name: str
    festival_name: str
    company_summary: Optional[str] = None
    uploaded_image: Optional[UploadedImage] = None
    address: Optional[str] = None
    phone_numbers: Optional[List[str]] = None

class SuggestionResponse(BaseModel):
    suggestion: str

class MarketingImage(BaseModel):
    id: str
    imageUrl: str
    festiveHeadline: str
    marketingHeadline: str
    theme: str

# --- Constants ---
THEME_PROMPTS = [
    {"name": 'Modern & Minimalist', "prompt": 'a modern, minimalist theme, using clean lines and a subtle color palette'},
    {"name": 'Vibrant & Colorful', "prompt": 'a vibrant, colorful style that pops, incorporating traditional decorations'},
    {"name": 'Magical & Glowing', "prompt": 'a magical scene with a glowing, ethereal aesthetic and sparkles'},
    {"name": 'Playful & Fun', "prompt": 'a playful and fun feeling, with whimsical elements like confetti and animated characters'},
    {"name": 'Elegant & Vintage', "prompt": 'a cozy, warm, vintage greeting card aesthetic, using soft textures and classic typography'},
]

# --- Helper Function for Gemini Image Generation (This part is correct) ---
def generate_image_with_gemini(client: genai.Client, prompt: str) -> Optional[str]:
    """
    Calls the Gemini image generation model using the Client method.
    """
    try:
        print(f"Attempting to generate image with model 'gemini-2.0-flash-preview-image-generation'...")
        model_name = "gemini-2.0-flash-preview-image-generation"
        contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
        
        generate_content_config = types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"],
        )
        
        response = client.models.generate_content(
            model=model_name,
            contents=contents,
            config=generate_content_config,
        )
        
        image_bytes = None
        for part in response.candidates[0].content.parts:
            if part.inline_data:
                image_bytes = part.inline_data.data
                break
        
        if not image_bytes:
            raise ValueError("No image data found in the response from the model.")

        encoded_string = base64.b64encode(image_bytes).decode('utf-8')
        data_url = f"data:image/png;base64,{encoded_string}"
        print("✅ Successfully generated image.")
        return data_url

    except Exception as e:
        print(f"❌ ERROR: Failed to generate image.")
        print(f"Error details: {e}")
        return None

# --- API Endpoints ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the Vibe-Gen API"}

# --- NEW: Add the missing endpoint back ---
@app.get("/generate-suggestion", response_model=SuggestionResponse)
def generate_suggestion():
    """
    Generates a creative suggestion for the user.
    """
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        text_model_name = "gemini-2.0-flash"
        prompt = "Generate a short, creative, and inspiring suggestion for a user of a 'Festive Marketing Image Generator' app. The suggestion should give them an idea of what to create. For example, 'How about creating a cozy, vintage-style Christmas ad for your new line of coffee beans?' or 'Try a vibrant, colorful Diwali promotion for your tech gadgets!'. Be creative and concise."
        
        response = client.models.generate_content(
            model=text_model_name,
            contents=prompt,
        )
        return SuggestionResponse(suggestion=response.text)
    except Exception as e:
        print(f"Error generating suggestion: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate suggestion from the AI model.")


@app.post("/generate-images", response_model=List[MarketingImage])
def generate_images(payload: GenerateImagePayload):
    client = genai.Client(api_key=GEMINI_API_KEY)
    company_details = f"Company Name: {payload.company_name}"
    if payload.company_summary: company_details += f"\nSummary: {payload.company_summary}"

    generated_content = []

    for theme_info in THEME_PROMPTS:
        theme_name = theme_info["name"]
        
        # Step 1: Generate the creative text (headlines and image prompt)
        prompt_parts = [
            f"""
            You are an expert marketing copywriter and a creative director.
            Your task is to generate two headlines AND a detailed visual prompt for an image generation AI.
            The promotion is for the '{payload.festival_name}' celebration.
            The visual theme is: '{theme_info["prompt"]}'.
            The company is: {company_details}
            Your response MUST be a valid JSON object with three keys: "festiveHeadline", "marketingHeadline", and "imagePrompt". Do not include any other text or markdown formatting.
            """
        ]
        
        try:
            text_model_name = "gemini-2.0-flash"
            response = client.models.generate_content(
                model=text_model_name,
                contents=prompt_parts,
            )
            
            cleaned_text = response.text.strip().replace("```json", "").replace("```", "")
            content = json.loads(cleaned_text)

            if isinstance(content, list) and len(content) > 0:
                content = content[0]
            
        except Exception as e:
            print(f"Failed to get valid JSON for theme '{theme_name}': {e}. Using fallback.")
            content = {
                "festiveHeadline": f"Happy {payload.festival_name}!",
                "marketingHeadline": f"Special offers from {payload.company_name}.",
                "imagePrompt": f"A {theme_name} style image for {payload.company_name} celebrating {payload.festival_name}."
            }

        # Step 2: Generate the image using the corrected helper function
        image_data_url = generate_image_with_gemini(client, content['imagePrompt'])
        
        if not image_data_url:
            image_data_url = f"https://via.placeholder.com/512x512.png?text=Generation+Failed"

        generated_content.append(
            MarketingImage(
                id=str(uuid.uuid4()),
                imageUrl=image_data_url,
                festiveHeadline=content.get("festiveHeadline", ""),
                marketingHeadline=content.get("marketingHeadline", ""),
                theme=theme_name,
            )
        )

        # Wait for 15 seconds after each image generation
        print("Waiting 15 seconds to avoid rate limiting...")
        time.sleep(15)
            
    return generated_content