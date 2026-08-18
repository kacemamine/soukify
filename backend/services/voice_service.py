import os
import tempfile

from dotenv import load_dotenv
from google import genai
from google.genai import types
from schemas.voice import VoiceProductData


load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is missing from .env")

client = genai.Client(
    api_key=GEMINI_API_KEY
)


def transcribe_audio(
    audio_bytes: bytes,
    suffix: str = ".mp3"
) -> str:
    """
    Sauvegarde temporairement le fichier audio, l'envoie à Gemini et retourne la transcription.
    """

    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:
            temp_file.write(audio_bytes)
            temp_path = temp_file.name

        uploaded_file = client.files.upload(
            file=temp_path
        )

        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=[
                uploaded_file,
                (
                    "Transcris fidèlement cet enregistrement audio. "
                    "La langue peut être la darija marocaine, "
                    "l'arabe ou le français. "
                    "Retourne uniquement la transcription."
                )
            ]
        )

        return response.text.strip()

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

def extract_product_data(
    transcription: str
) -> VoiceProductData:
    """
    Extrait les informations structurées (product_name, price, material) d'une transcription audio.
    """

    prompt = f"""
Tu analyses une transcription en darija marocaine, arabe ou français.

Extrais uniquement les informations suivantes :

- product_name : nom ou type du produit
- price : prix en dirhams marocains, sous forme numérique
- material : matière du produit

Si une information n'est pas présente, retourne null.

Transcription :
{transcription}
"""

    interaction = client.interactions.create(
        model="gemini-3.6-flash",
        input=prompt,
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": VoiceProductData.model_json_schema()
        }
    )

    return VoiceProductData.model_validate_json(
        interaction.output_text
    )
    