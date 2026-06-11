import os
import json

from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from google import genai

load_dotenv("frontend/.env.local")

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

    try:

        tool_selection_prompt = f"""
You are R.E.A.C.T. AI (Railway Emergency Action Coordination and Triage).

Your role is to analyze railway incidents and determine the appropriate response.

You have access to the following tools:

1. freeze_corridor
   Use when rail traffic must be stopped due to safety risks, derailments, collisions, obstructions, fires, track damage, or hazardous situations.

2. dispatch_emergency_responders
   Use when police, fire services, rescue teams, or emergency personnel are required.

3. locate_medical_facilities
   Use only when there is a possibility of injuries, casualties, medical emergencies, or passenger health risks.

4. dispatch_engineering_team
   Use when infrastructure damage, track blockage, signal failure, fallen trees, derailments, equipment failures, or repair work is involved.

5. generate_incident_report
   Always generate a final incident report after completing all necessary actions.

Decision Process:

- Analyze the incident.
- Determine severity.
- Select ONLY required tools.
- Do not select unnecessary tools.
- Always include generate_incident_report.

Incident:

{req.message}

Extract the most likely railway sector if present.

Return ONLY valid JSON:

{{
  "sector": "<sector>",
  "tools": [],
  "reasoning": ""
}}
"""

        selection = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=tool_selection_prompt
        )

        raw = selection.text.strip()

        raw = raw.replace("```json", "")
        raw = raw.replace("```", "")
        raw = raw.strip()

        print("\nRAW GEMINI PLAN:")
        print(raw)

        plan = json.loads(raw)

        print("\nPARSED PLAN:")
        print(plan)

        sector = plan.get("sector", "Dhanbad-Zone")

        tool_map = {
            "freeze_corridor": freeze_corridor,
            "dispatch_emergency_responders": dispatch_emergency_responders,
            "locate_medical_facilities": locate_medical_facilities,
            "dispatch_engineering_team": dispatch_engineering_team,
        }

        results = []

        for tool_name in plan.get("tools", []):

            if tool_name == "generate_incident_report":
                continue

            if tool_name in tool_map:

                try:
                    result = tool_map[tool_name](sector)

                    results.append(result)

                except Exception as tool_error:

                    results.append({
                        "tool": tool_name,
                        "status": "error",
                        "message": str(tool_error)
                    })

        results.append(
            generate_incident_report(
                "Auto-Detected",
                sector,
                "Auto-Assessed"
            )
        )

        report_prompt = f"""
User Incident:

{req.message}

Gemini Reasoning:

{plan.get("reasoning", "")}

Tool Results:

{results}

Generate a professional railway emergency report.
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=report_prompt
        )

        return {
            "reply": response.text,
            "tool_results": results,
            "plan": plan
        }

    except Exception as e:

        print("\nAGENT ERROR:")
        print(str(e))

        return {
            "reply": f"Agent execution failed: {str(e)}",
            "tool_results": []
        }