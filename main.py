from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests, base64, uvicorn

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

SUPPLIER_ID = "480490"
TOKEN = base64.b64encode(b"eRewGQPe6cIeQRPDcas3:wFIXQ57iaW0pCkAnopI6").decode()
HEADERS = {"Authorization": f"Basic {TOKEN}", "User-Agent": f"TrendyolApp-{SUPPLIER_ID}"}

@app.get("/")
def root(): return {"durum": "calisiyor"}

@app.get("/urunler")
def urunler(page: int = 0, size: int = 50):
    r = requests.get(
        f"https://api.trendyol.com/sapigw/suppliers/{SUPPLIER_ID}/products",
        headers=HEADERS, params={"page": page, "size": size, "approved": "true"}
    )
    return r.json()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
