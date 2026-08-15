"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type VoiceData = {
  product_name: string | null;
  price: number | null;
  material: string | null;
};

type VoiceResponse = {
  filename: string;
  transcription: string;
  data: VoiceData;
};

export default function VoicePage() {
  const router = useRouter();

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [transcription, setTranscription] = useState("");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [material, setMaterial] = useState("");

  // Microphone
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // =========================
  // AUDIO FILE UPLOAD
  // =========================

  const handleAudioChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      setAudioFile(file);
      setError("");
    }
  };

  // =========================
  // START MICROPHONE RECORDING
  // =========================

  const startRecording = async () => {
    try {
      setError("");

      // Remove previously selected audio
      setAudioFile(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(
          audioChunksRef.current,
          {
            type: "audio/webm",
          }
        );

        const file = new File(
          [audioBlob],
          "darija-recording.webm",
          {
            type: "audio/webm",
          }
        );

        setAudioFile(file);

        // Stop microphone
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      };

      mediaRecorder.start();

      setIsRecording(true);
    } catch (err) {
      console.error(err);

      setError(
        "Impossible d'accéder au microphone. Vérifiez l'autorisation du navigateur."
      );
    }
  };

  // =========================
  // STOP MICROPHONE RECORDING
  // =========================

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // =========================
  // PROCESS AUDIO
  // =========================

  const handleProcessAudio = async () => {
    if (!audioFile) {
      setError(
        "Veuillez sélectionner ou enregistrer un fichier audio."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("audio", audioFile);

      const response = await fetch(
        "http://127.0.0.1:8000/api/voice/process",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.detail ||
            "Erreur lors du traitement audio."
        );
      }

      const result: VoiceResponse =
        await response.json();

      setTranscription(
        result.transcription || ""
      );

      setProductName(
        result.data.product_name || ""
      );

      setPrice(
        result.data.price !== null
          ? String(result.data.price)
          : ""
      );

      setMaterial(
        result.data.material || ""
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Une erreur est survenue."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SEND DATA TO LISTING
  // =========================

  const handleUseInformation = () => {
    const params = new URLSearchParams();

    if (productName) {
      params.set("title", productName);
    }

    if (price) {
      params.set("price", price);
    }

    if (material) {
      params.set("material", material);
    }

    router.push(
      `/listing?${params.toString()}`
    );
  };

  return (
    <main className="min-h-screen bg-[#F5F1E8] px-6 py-12">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#9A7650]">
            SOUKIFY
          </p>

          <h1 className="text-4xl font-bold text-[#193C32]">
            Darija Voice
          </h1>

          <p className="mt-3 max-w-2xl text-[#6C706B]">
            Décrivez votre produit en darija,
            arabe ou français. Soukify
            transcrit votre audio et extrait
            automatiquement les informations
            principales du produit.
          </p>
        </div>

        {/* Audio card */}
        <div className="rounded-3xl border border-[#DED7CA] bg-[#FFFDF8] p-8 shadow-sm">

          <div className="mb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7650]">
              Étape 01
            </p>

            <h2 className="text-2xl font-semibold text-[#193C32]">
              Ajouter un enregistrement audio
            </h2>

            <p className="mt-2 text-sm text-[#777A75]">
              Importez un fichier audio ou
              enregistrez directement votre voix.
            </p>
          </div>

          {/* Upload zone */}
          <div className="rounded-2xl border-2 border-dashed border-[#CFC5B4] bg-[#F9F6EF] p-6">

            <p className="mb-3 text-sm font-semibold text-[#44514B]">
              Importer un fichier audio
            </p>

            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              disabled={isRecording}
              className="block w-full cursor-pointer rounded-xl border border-[#D8D0C2] bg-white p-3 text-sm text-[#4F5752] file:mr-4 file:rounded-lg file:border-0 file:bg-[#193C32] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-[#28594B] disabled:cursor-not-allowed disabled:opacity-50"
            />

            {/* Separator */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#DDD5C8]" />

              <span className="text-xs font-semibold uppercase tracking-wider text-[#9A7650]">
                ou
              </span>

              <div className="h-px flex-1 bg-[#DDD5C8]" />
            </div>

            {/* Microphone */}
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="w-full rounded-xl border border-[#193C32] bg-white px-6 py-3 font-semibold text-[#193C32] transition hover:bg-[#EEF3F0]"
              >
                🎤 Enregistrer avec le microphone
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="w-full rounded-xl bg-[#A44742] px-6 py-3 font-semibold text-white transition hover:bg-[#893A36]"
              >
                ⏹ Arrêter l&apos;enregistrement
              </button>
            )}

            {/* Recording indicator */}
            {isRecording && (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3">

                <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />

                <p className="text-sm font-medium text-red-700">
                  Enregistrement en cours...
                </p>

              </div>
            )}

            {/* Selected / recorded audio */}
            {audioFile && !isRecording && (
              <div className="mt-5 rounded-xl border border-[#DDD5C8] bg-white px-4 py-3">

                <p className="text-xs font-semibold uppercase tracking-wide text-[#9A7650]">
                  Audio prêt
                </p>

                <p className="mt-1 text-sm font-medium text-[#193C32]">
                  {audioFile.name}
                </p>

                {audioFile.name ===
                  "darija-recording.webm" && (
                  <p className="mt-1 text-xs text-[#777A75]">
                    Enregistrement microphone
                  </p>
                )}

              </div>
            )}
          </div>

          {/* Analyze */}
          <button
            type="button"
            onClick={handleProcessAudio}
            disabled={
              loading ||
              isRecording ||
              !audioFile
            }
            className="mt-6 rounded-xl bg-[#193C32] px-6 py-3 font-semibold text-white transition hover:bg-[#28594B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Analyse en cours..."
              : "Analyser l'audio"}
          </button>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Result */}
        {(transcription ||
          productName ||
          price ||
          material) && (
          <div className="mt-8 rounded-3xl border border-[#DED7CA] bg-[#FFFDF8] p-8 shadow-sm">

            <div className="mb-7">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7650]">
                Étape 02
              </p>

              <h2 className="text-2xl font-semibold text-[#193C32]">
                Informations détectées
              </h2>

              <p className="mt-2 text-sm text-[#777A75]">
                Vérifiez les informations
                générées automatiquement avant
                validation.
              </p>
            </div>

            {/* Transcription */}
            <div className="mb-7">
              <label className="mb-2 block text-sm font-semibold text-[#44514B]">
                Transcription
              </label>

              <textarea
                value={transcription}
                onChange={(e) =>
                  setTranscription(
                    e.target.value
                  )
                }
                rows={4}
                className="w-full rounded-xl border border-[#D8D0C2] bg-white p-4 text-[#303832] outline-none transition focus:border-[#193C32] focus:ring-1 focus:ring-[#193C32]"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* Product name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#44514B]">
                  Nom du produit
                </label>

                <input
                  type="text"
                  value={productName}
                  onChange={(e) =>
                    setProductName(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-[#D8D0C2] bg-white p-3 text-[#303832] outline-none transition focus:border-[#193C32] focus:ring-1 focus:ring-[#193C32]"
                />
              </div>

              {/* Price */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#44514B]">
                  Prix (DH)
                </label>

                <input
                  type="number"
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-[#D8D0C2] bg-white p-3 text-[#303832] outline-none transition focus:border-[#193C32] focus:ring-1 focus:ring-[#193C32]"
                />
              </div>

              {/* Material */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-[#44514B]">
                  Matière
                </label>

                <input
                  type="text"
                  value={material}
                  onChange={(e) =>
                    setMaterial(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-[#D8D0C2] bg-white p-3 text-[#303832] outline-none transition focus:border-[#193C32] focus:ring-1 focus:ring-[#193C32]"
                />
              </div>

            </div>

            {/* Use information */}
            <div className="mt-7 border-t border-[#DED7CA] pt-6">

              <button
                type="button"
                onClick={handleUseInformation}
                disabled={
                  !productName &&
                  !price &&
                  !material
                }
                className="w-full rounded-xl bg-[#193C32] px-6 py-3 font-semibold text-white transition hover:bg-[#28594B] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Utiliser ces informations
              </button>

              <p className="mt-3 text-center text-xs text-[#777A75]">
                Ces informations seront utilisées pour
                pré-remplir la fiche produit.
              </p>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}