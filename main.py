from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests, base64, os

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

SUPPLIER_ID = "480490"
TOKEN = base64.b64encode(b"x4ea3wblY7pSrkRQJJVD:JtWzSkp8HLHB9M3pVLMc").decode()
HEADERS = {
    "Authorization": f"Basic {TOKEN}",
    "User-Agent": f"TrendyolApp-{SUPPLIER_ID}",
    "Content-Type": "application/json"
}

@app.get("/")
def root():
    return {"durum": "calisiyor", "supplier": SUPPLIER_ID}

@app.get("/urunler")
def urunler(page: int = 0, size: int = 50):
    url = f"https://api.trendyol.com/sapigw/suppliers/{SUPPLIER_ID}/products"
    r = requests.get(url, headers=HEADERS, params={"page": page, "size": size, "approved": "true"}, timeout=15)
    return {
        "status_code": r.status_code,
        "headers": dict(r.headers),
        "body": r.text[:500]
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
