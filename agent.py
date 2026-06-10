import os
from fastapi import FastAPI
from pydantic import BaseModel
from google import genai

from app import (
    freeze_corridor,
    dispatch_emergency_responders,
    locate_medical_facilities,
    dispatch_engineering_team,
    generate_incident_report
)

app = FastAPI()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
def chat(req: ChatRequest):

    msg = req.message.lower()

    results = []

    if "derail" in msg:
        results.append(
            freeze_corridor("Dhanbad-Zone")
        )

        results.append(
            dispatch_emergency_responders("Dhanbad-Zone")
        )

        results.append(
            locate_medical_facilities("Dhanbad-Zone")
        )

        results.append(
            dispatch_engineering_team("Dhanbad-Zone")
        )

        results.append(
            generate_incident_report(
                "Derailment",
                "Dhanbad-Zone",
                "High"
            )
        )

    prompt = f"""
User Incident:

{req.message}

Tool Results:

{results}

Generate a professional railway emergency report.
"""

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )

    return {
        "reply": response.text
    }