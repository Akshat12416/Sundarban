// src/utils/projectUtils.js
export function collectImgs(entry, prefix) {
  if (!entry) return [];
  const arr = [];
  for (let i = 1; i <= 12; i++) {
    const k = `${prefix}${i}`;
    if (entry[k]) arr.push(entry[k]);
  }
  return arr;
}

export function getImageSrc(raw) {
  if (!raw) return null;
  const s = raw.trim();
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("data:")) return s;
  const cleaned = s.replace(/^"+|"+$/g, "");
  if (/^[A-Za-z0-9+/]{10,}/.test(cleaned) || cleaned.startsWith("/9j/")) {
    return `data:image/jpeg;base64,${cleaned}`;
  }
  return cleaned;
}

export function parseLocationField(locStr) {
  if (!locStr) return null;
  try {
    const latMatch = locStr.match(/Lat:\s*([-\d.]+)/i);
    const lngMatch =
      locStr.match(/Long:\s*([-\d.]+)/i) ||
      locStr.match(/=>Long:\s*([-\d.]+)/i);
    return {
      lat: latMatch ? Number(latMatch[1]) : null,
      lng: lngMatch ? Number(lngMatch[1]) : null,
    };
  } catch {
    return null;
  }
}
