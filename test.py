from google import genai

client = genai.Client(
    api_key="AQ.Ab8RN6J46LQUMpXHOjDe_VnewPTmOILTIQfIJJSbe2cfGDSfEg"
)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Say You Are Working"
)

print(response.text)