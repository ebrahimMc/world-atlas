"""Build the browser data from Natural Earth's 1:50m Admin 0 Countries GeoJSON."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
data = (ROOT / "assets/data.js").read_text(encoding="utf-8")
countries = json.loads(data.split("const COUNTRIES = ", 1)[1].split(";\n", 1)[0])
codes = {country["code"] for country in countries}
features = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))["features"]

def ring_area(ring):
    return abs(sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(ring, ring[1:]))) / 2

shapes = []
anchors = {}
anchor_areas = {}
for feature in features:
    properties = feature["properties"]
    code = properties["ISO_A2_EH"]
    geometry = feature["geometry"]
    polygons = geometry["coordinates"] if geometry["type"] == "MultiPolygon" else [geometry["coordinates"]]
    area = sum(ring_area(polygon[0]) for polygon in polygons)
    coordinates = [
        [[[round(x, 4), round(y, 4)] for x, y in ring] for ring in polygon]
        for polygon in polygons
    ]
    shapes.append({
        "code": code if code in codes else None,
        "geometry": {
            "type": geometry["type"],
            "coordinates": coordinates if geometry["type"] == "MultiPolygon" else coordinates[0],
        },
    })
    if code in codes and area > anchor_areas.get(code, 0):
        anchor_areas[code] = area
        anchors[code] = {
            "code": code,
            "lat": properties["LABEL_Y"],
            "lng": properties["LABEL_X"],
            "marker": area < 1.6,
        }

missing = codes - anchors.keys()
if missing:
    raise ValueError(f"Missing globe geometry for {sorted(missing)}")

payload = json.dumps({"shapes": shapes, "anchors": anchors}, separators=(",", ":"), sort_keys=True)
(ROOT / "assets/globe-geography.js").write_text(
    "// Natural Earth Admin 0 Countries, 1:50m, v5.1.2. Public domain.\n"
    f"globalThis.atlasGlobeGeography = {payload};\n",
    encoding="utf-8",
)
