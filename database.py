import json
import sqlite3
from pathlib import Path


BASE_DIR = Path(__file__).parent
DATABASE_FILE = BASE_DIR / "products.db"
SCHEMA_FILE = BASE_DIR / "schema.sql"
SAMPLE_PRODUCTS_FILE = BASE_DIR / "products.json"


def initialize_database() -> None:
    with sqlite3.connect(DATABASE_FILE) as connection:
        connection.executescript(SCHEMA_FILE.read_text(encoding="utf-8"))
        product_count = connection.execute(
            "SELECT COUNT(*) FROM products"
        ).fetchone()[0]
        if product_count == 0:
            products = json.loads(SAMPLE_PRODUCTS_FILE.read_text(encoding="utf-8"))
            connection.executemany(
                """INSERT INTO products
                (id, name, description, price, category, image)
                VALUES (:id, :name, :description, :price, :category, :image)""",
                products,
            )


def list_product_records() -> list[dict]:
    with sqlite3.connect(DATABASE_FILE) as connection:
        connection.row_factory = sqlite3.Row
        rows = connection.execute(
            "SELECT id, name, description, price, category, image "
            "FROM products ORDER BY id"
        ).fetchall()
    return [dict(row) for row in rows]


def get_product_record(product_id: int) -> dict | None:
    with sqlite3.connect(DATABASE_FILE) as connection:
        connection.row_factory = sqlite3.Row
        row = connection.execute(
            "SELECT id, name, description, price, category, image "
            "FROM products WHERE id = ?",
            (product_id,),
        ).fetchone()
    return dict(row) if row is not None else None