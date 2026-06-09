import os
from pymongo import MongoClient
from fastmcp import FastMCP
from dotenv import load_dotenv

load_dotenv()

mcp = FastMCP("Railway Safety Protocol Interface")

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
db_client = MongoClient(MONGO_URI)
db = db_client["railway_safety"]

@mcp.tool()
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

@mcp.tool()
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

@mcp.tool()
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

if __name__ == "__main__":
    mcp.run()