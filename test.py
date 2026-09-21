from app.main import app

print("=" * 70)
print(f"Total routes in app.router: {len(app.router.routes)}")
print("=" * 70)

for i, r in enumerate(app.router.routes):
    rtype = type(r).__name__
    path = getattr(r, "path", None)
    
    if path:
        print(f"{i}: {rtype} path={path}")
    else:
        inner_count = len(r.routes) if hasattr(r, "routes") else 0
        print(f"{i}: {rtype} (inner routes: {inner_count})")
        if hasattr(r, "routes"):
            for j, inner in enumerate(r.routes):
                inner_path = getattr(inner, "path", "?")
                print(f"     {i}.{j}: {inner_path}")

print("=" * 70)
print("Excel routes check:")
print("=" * 70)

for r in app.router.routes:
    if hasattr(r, "routes"):
        for inner in r.routes:
            p = getattr(inner, "path", "")
            if "excel" in p.lower():
                print(f"  FOUND: {p}")
    p = getattr(r, "path", "")
    if "excel" in p.lower():
        print(f"  FOUND: {p}")