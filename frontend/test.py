import os
from dotenv import load_dotenv
from google import genai

load_dotenv(
    r"C:\Users\anant\Documents\Railway\railway-safety-agent\frontend\.env.local"
)

print("Current folder:", os.getcwd())
print("Key exists:", bool(os.getenv("GEMINI_API_KEY")))
print("Key prefix:", str(os.getenv("GEMINI_API_KEY"))[:10])

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Say hello"
)

print(response.text)