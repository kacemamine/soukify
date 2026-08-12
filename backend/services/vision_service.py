import os 
from io import BytesIO
from google import genai
from google.genai import types
from PIL import Image
from dotenv import load_dotenv
from schemas.ai_listing import AIListingResponse
load_dotenv()  
client=genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def analyze_product_image(image_bytes: bytes,content_type: str):
    image=Image.open(BytesIO(image_bytes))
    prompt = """
Analyse the Moroccan handcrafted product shown in the image.

Return the following fields:

- title
- description_fr
- description_ar
- category
- material
- style
- colors
- tags

Rules:
- title must be a concise marketplace title
- description_fr must be in French
- description_ar must be in Arabic
- category must describe the product category
- material must describe the apparent material
- style must describe the apparent style
- colors must be a list of visible dominant colors
- tags must be a list of relevant keywords
- do not invent information that cannot reasonably be inferred from the image
"""

    response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        prompt,
        image
    ],
    config=types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=AIListingResponse,
    )
)

    return AIListingResponse.model_validate_json(
        response.text
    )