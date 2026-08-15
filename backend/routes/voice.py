from pathlib import Path
from fastapi import APIRouter, HTTPException, UploadFile, File
from schemas.voice import VoiceTextRequest
from pydantic import BaseModel
from services.voice_service import (

    transcribe_audio,
    extract_product_data,
)

router = APIRouter(
    prefix="/api/voice",
    tags=["Darija voice"],
)
ALLOWED_AUDIO_TYPES = {
    "audio/mpeg": ".mp3",
    "audio/mp3": ".mp3",
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "audio/webm": ".webm",
    "audio/mp4": ".m4a",
    "audio/x-m4a": ".m4a",
}
@router.post("/transcribe")
async def transcribe_voice(audio: UploadFile = File(...)):
    if audio.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Format audio non supporté."
        )
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(
            status_code=400,
            detail="Le fichier audio est vide."
        )
    suffix = ALLOWED_AUDIO_TYPES[audio.content_type]
    try:
        transcription = transcribe_audio(audio_bytes, suffix=suffix)
        return {"file_name": audio.filename, "transcription": transcription}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la transcription de l'audio: {str(e)}"
        )
@router.post("/extract")
def extract_voice_data(
    request: VoiceTextRequest
):
    try:
        result = extract_product_data(
            request.transcription
        )

        return {
            "transcription": request.transcription,
            "data": result.model_dump()
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'extraction : {str(e)}"
        )

@router.post("/process")
async def process_voice(
    audio: UploadFile = File(...)
):
    if audio.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Format audio non supporté."
        )

    audio_bytes = await audio.read()

    if not audio_bytes:
        raise HTTPException(
            status_code=400,
            detail="Le fichier audio est vide."
        )

    suffix = ALLOWED_AUDIO_TYPES[audio.content_type]

    try:
        transcription = transcribe_audio(
            audio_bytes,
            suffix=suffix
        )

        extracted_data = extract_product_data(
            transcription
        )

        return {
            "filename": audio.filename,
            "transcription": transcription,
            "data": extracted_data.model_dump()
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors du traitement audio : {str(e)}"
        )