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
    prompt="""

You are analyzing a Moroccan handcrafted product
for the SOUKIFY marketplace.

Analyze only information that can reasonably be inferred
from the provided image.

Identify:

- product type
- material
- style
- dominant colors
- category

Then generate:

- title
- description_fr
- description_ar
- tags

Rules:

- Do not invent characteristics that are not visible.
- The title must be concise and suitable for a marketplace.
- description_fr must be written in French.
- description_ar must be written in Arabic.
- tags must contain relevant marketplace keywords.
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