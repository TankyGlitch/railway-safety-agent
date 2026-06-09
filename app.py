import os
from dotenv import load_dotenv
from pymongo import MongoClient
from google import genai
from google.genai import types

load_dotenv()

GENAI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GENAI_API_KEY:
    exit(1)

client = genai.Client(api_key=GENAI_API_KEY)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
db_client = MongoClient(MONGO_URI)
db = db_client["railway_safety"]

def freeze_corridor(sector: str) -> str:
    """Halts active trains inside a target regional sector."""
    try:
        query = {"current_sector": sector, "status": {"$ne": "Halted"}}
        trains_in_zone = list(db["trains"].find(query))
        if not trains_in_zone:
            return f"No running trains inside {sector}."
        result = db["trains"].update_many(query, {"$set": {"status": "Halted"}})
        train_names = [t.get("train_name") for t in trains_in_zone]
        return f"Halted {result.modified_count} trains in {sector}: {', '.join(train_names)}."
    except Exception as e:
        return str(e)

def get_emergency_responders(sector: str) -> str:
    """Retrieves security forces, frequencies, and supervisors for a sector."""
    try:
        responders = list(db["responders"].find({"jurisdiction_sectors": sector}))
        if not responders:
            return f"No responder data for {sector}."
        summary = []
        for r in responders:
            summary.append(
                f"{r.get('agency_type')} - {r.get('station_name')} "
                f"({r.get('on_duty_supervisor')}, Phone: {r.get('dispatch_phone')}, Radio: {r.get('radio_frequency')})"
            )
        return "Responders: " + " | ".join(summary)
    except Exception as e:
        return str(e)

def get_medical_facilities(sector: str) -> str:
    """Queries open trauma beds, hotlines, and ambulances in a sector."""
    try:
        hospitals = list(db["hospitals"].find({"sectors_covered": sector}))
        if not hospitals:
            return f"No trauma centers for {sector}."
        summary = []
        for h in hospitals:
            summary.append(
                f"{h.get('name')} [Lvl {h.get('trauma_level')}] "
                f"(Beds: {h.get('available_beds')}/{h.get('total_beds')}, "
                f"Ambulances: {h.get('ambulances_available')}, Hotline: {h.get('emergency_hotline')})"
            )
        return "Medical Assets: " + " | ".join(summary)
    except Exception as e:
        return str(e)

def process_emergency_report(incident_text: str):
    system_prompt = """
    You are the R.E.A.C.T. AI safety platform interface.
    Process incoming natural language reports by running the available database tools.
    Synthesize the raw database payloads into a high-priority operational bulletin.
    Organize using bold markdown layout sections:
    - CRISIS OVERVIEW
    - TRAFFIC CONTROL INTERVENTIONS
    - FIELD SECURITY UNITS
    - MEDICAL INFRASTRUCTURE LOG
    Keep text blunt, clean, and highly directive.
    """
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=incident_text,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            tools=[freeze_corridor, get_emergency_responders, get_medical_facilities],
            temperature=0.1
        )
    )
    return response.text

if __name__ == "__main__":
    test_incident = "Severe track issue reported near New-Delhi-Zone with multiple passengers complaining of sudden impacts and injuries."
    final_output = process_emergency_report(test_incident)
    print(final_output)