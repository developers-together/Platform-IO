import google.generativeai as genai
import json
import sys

def get_gemini_response(api_key, prompt):
    genai.configure(api_key=api_key)

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)  # Corrected method call
        return json.dumps({"response": response.text})
    except Exception as e:
        return json.dumps({"error": str(e)})

if __name__ == "__main__":
    api_key = sys.argv[1]
    prompt = sys.argv[2]
    result = get_gemini_response(api_key, prompt)
    print(result)
