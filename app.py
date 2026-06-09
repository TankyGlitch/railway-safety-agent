import os
from pymongo import MongoClient
from fastmcp import FastMCP
from dotenv import load_dotenv

load_dotenv()

mcp = FastMCP("R.E.A.C.T. AI Railway Safety Protocol Interface")

# -----------------------------
# Database Connection
# -----------------------------
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
db_client = MongoClient(MONGO_URI)
db = db_client["railway_emergency"]

# -----------------------------
# Tool 1 - Freeze Corridor
# -----------------------------
@mcp.tool()
def freeze_corridor(sector: str) -> dict:
    """
    Emergency halt all active trains in a sector.
    """

    try:
        query = {
            "current_sector": sector,
            "status": {
                "$in": ["Running", "Delayed"]
            }
        }

        trains = list(db["trains"].find(query))

        if not trains:
            return {
                "action": "freeze_corridor",
                "sector": sector,
                "status": "completed",
                "affected_trains": []
            }

        db["trains"].update_many(
            query,
            {"$set": {"status": "Emergency Halt"}}
        )

        return {
            "action": "freeze_corridor",
            "sector": sector,
            "status": "completed",
            "affected_trains": [
                {
                    "train_id": t.get("train_id"),
                    "train_name": t.get("train_name"),
                    "passengers": t.get("passenger_count")
                }
                for t in trains
            ]
        }

    except Exception as e:
        return {
            "action": "freeze_corridor",
            "status": "error",
            "message": str(e)
        }


# -----------------------------
# Tool 2 - Emergency Responders
# -----------------------------
@mcp.tool()
def dispatch_emergency_responders(sector: str) -> dict:
    """
    Retrieve emergency responders responsible for a sector.
    """

    try:
        responders = list(
            db["responders"].find(
                {"jurisdiction_sectors": sector}
            )
        )

        return {
            "action": "dispatch_emergency_responders",
            "sector": sector,
            "responder_count": len(responders),
            "responders": [
                {
                    "agency": r.get("agency_type"),
                    "station": r.get("station_name"),
                    "supervisor": r.get("on_duty_supervisor"),
                    "phone": r.get("dispatch_phone"),
                    "radio": r.get("radio_frequency")
                }
                for r in responders
            ]
        }

    except Exception as e:
        return {
            "action": "dispatch_emergency_responders",
            "status": "error",
            "message": str(e)
        }


# -----------------------------
# Tool 3 - Medical Assets
# -----------------------------
@mcp.tool()
def locate_medical_facilities(sector: str) -> dict:
    """
    Locate trauma centers serving a sector.
    """

    try:
        hospitals = list(
            db["hospitals"].find(
                {"sectors_covered": sector}
            )
        )

        return {
            "action": "locate_medical_facilities",
            "sector": sector,
            "facility_count": len(hospitals),
            "hospitals": [
                {
                    "name": h.get("name"),
                    "trauma_level": h.get("trauma_level"),
                    "available_beds": h.get("available_beds"),
                    "total_beds": h.get("total_beds"),
                    "ambulances": h.get("ambulances_available"),
                    "hotline": h.get("emergency_hotline")
                }
                for h in hospitals
            ]
        }

    except Exception as e:
        return {
            "action": "locate_medical_facilities",
            "status": "error",
            "message": str(e)
        }


# -----------------------------
# Tool 4 - Engineering Dispatch
# -----------------------------
@mcp.tool()
def dispatch_engineering_team(sector: str) -> dict:
    """
    Simulate dispatch of railway engineering personnel.
    """

    return {
        "action": "dispatch_engineering_team",
        "sector": sector,
        "status": "Engineering team dispatched",
        "estimated_arrival": "20 minutes"
    }


# -----------------------------
# Tool 5 - Incident Report
# -----------------------------
@mcp.tool()
def generate_incident_report(
    incident_type: str,
    sector: str,
    severity: str
) -> dict:
    """
    Generate structured incident report.
    """

    return {
        "report_type": "Rail Emergency Incident Report",
        "incident_type": incident_type,
        "sector": sector,
        "severity": severity,
        "status": "Generated"
    }


# -----------------------------
# MCP Server
# -----------------------------
if __name__ == "__main__":
    mcp.run()