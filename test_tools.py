from app import *

print(freeze_corridor("Dhanbad-Zone"))

print(dispatch_emergency_responders("Dhanbad-Zone"))

print(locate_medical_facilities("Dhanbad-Zone"))

print(dispatch_engineering_team("Dhanbad-Zone"))

print(
    generate_incident_report(
        "Derailment",
        "Dhanbad-Zone",
        "Critical"
    )
)