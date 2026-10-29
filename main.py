from pathlib import Path as FilePath

from fastapi import FastAPI, HTTPException, Path
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from database import get_product_record, initialize_database, list_product_records


class Product(BaseModel):
    id: int = Field(gt=0)
    name: str
    description: str
    price: int = Field(ge=0)
    category: str
    image: str


app = FastAPI(title="ShopEase Product API")
BASE_DIR = FilePath(__file__).parent


initialize_database()


@app.get("/", include_in_schema=False)
def home() -> FileResponse:
    return FileResponse(BASE_DIR / "index.html")


@app.get("/style.css", include_in_schema=False)
def stylesheet() -> FileResponse:
    return FileResponse(BASE_DIR / "style.css")


@app.get("/script.js", include_in_schema=False)
def frontend_script() -> FileResponse:
    return FileResponse(BASE_DIR / "script.js")


def load_products() -> list[Product]:
    return [Product.model_validate(record) for record in list_product_records()]


@app.get("/api/products", response_model=list[Product])
def get_products() -> list[Product]:
    return load_products()


@app.get("/api/products/{product_id}", response_model=Product)
def get_product(product_id: int = Path(gt=0)) -> Product:
    record = get_product_record(product_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product.model_validate(record)