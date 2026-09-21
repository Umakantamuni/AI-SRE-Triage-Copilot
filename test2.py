from fastapi import FastAPI
from app.api.routes.excel import router as er

print("=" * 70)
print(f"excel_router routes: {len(er.routes)}")
for r in er.routes:
    print(f"  {r.path} {r.methods}")
print("=" * 70)

test_app = FastAPI()
test_app.include_router(er)

print(f"test_app routes (after include): {len(test_app.routes)}")
for r in test_app.routes:
    p = getattr(r, "path", "?")
    inner = len(r.routes) if hasattr(r, "routes") else 0
    print(f"  {type(r).__name__}: {p} (inner: {inner})")
print("=" * 70)