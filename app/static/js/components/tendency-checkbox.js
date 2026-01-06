/**
 * tendency_checkbox.js
 * -------------------------
 * Functions regarding the checkboxes of the tendency mapbox
*/

import {
    map,
    RLSLayer,
    RTSLayer,
    RSSLayer
} from "../map-and-layers.js";

/* -----------------------------
   Focus layers (one per level)
------------------------------ */

function makeFocusLayer(zIndex = 50) {
    const source = new ol.source.Vector();
    const layer = new ol.layer.Vector({ source, zIndex });

    // Same style for all levels (customize if you want)
    layer.setStyle(new ol.style.Style({
        stroke: new ol.style.Stroke({ color: "#2F6DDB", width: 3 }),
        fill: new ol.style.Fill({ color: "rgba(0, 11, 22, 0.55)" })
    }));

    map.addLayer(layer);
    return { source, layer };
}

export const focusRLS = makeFocusLayer(50);
export const focusRTS = makeFocusLayer(50);
export const focusRSS = makeFocusLayer(50);


function getFocusSource(level) {
    return level === "RLS" ? focusRLS.source
        : level === "RTS" ? focusRTS.source
            : level === "RSS" ? focusRSS.source
                : null;
}

/* -----------------------------
   Per-level base state + cache
------------------------------ */

export const LEVELS = {
    RLS: { layer: RLSLayer, source: RLSLayer.getSource(), ready: false, baseByCode: Object.create(null), focus: focusRLS },
    RTS: { layer: RTSLayer, source: RTSLayer.getSource(), ready: false, baseByCode: Object.create(null), focus: focusRTS },
    RSS: { layer: RSSLayer, source: RSSLayer.getSource(), ready: false, baseByCode: Object.create(null), focus: focusRSS }
};

// Focus features per level (no collisions)
const focusFeaturesByLevel = {
    RLS: Object.create(null),
    RTS: Object.create(null),
    RSS: Object.create(null)
};

// If user clicks checkbox before a level is ready
const pendingToggles = []; // items: { level, code, on }

function indexBaseFeatures(level) {
    const L = LEVELS[level];
    if (!L) return;

    const feats = L.source.getFeatures();
    feats.forEach(f => {
        const code = String(f.get("code") ?? f.getId() ?? "");
        if (!code) return;

        L.baseByCode[code] = f;
        if (f.getId() == null) f.setId(code);
    });
}

function setReadyWhenSourceReady(level) {
    const L = LEVELS[level];
    if (!L) return;

    const src = L.source;

    const onReady = () => {
        L.ready = true;
        indexBaseFeatures(level);

        // Apply pending toggles for this level
        for (let i = pendingToggles.length - 1; i >= 0; i--) {
            const p = pendingToggles[i];
            if (p.level === level) {
                pendingToggles.splice(i, 1);
                applyFocusForCode(p.level, p.code, p.on);
            }
        }
    };

    if (src.getState && src.getState() !== "ready") {
        src.once("change", () => {
            if (src.getState() === "ready") onReady();
        });
    } else {
        onReady();
    }
}

function getBaseFeatureForCode(level, code) {
    const L = LEVELS[level];
    if (!L) return null;

    const c = String(code);

    // 1) cache
    if (L.baseByCode[c]) return L.baseByCode[c];

    // 2) byId
    const byId = L.source.getFeatureById(c);
    if (byId) return (L.baseByCode[c] = byId);

    // 3) last resort: scan by property 'code'
    const found = L.source.getFeatures().find(f => String(f.get("code")) === c);
    if (found) {
        L.baseByCode[c] = found;
        if (found.getId() == null) found.setId(c);
        return found;
    }

    return null;
}

/* -----------------------------
   Counters (optional)
------------------------------ */

function updateCount(level) {
    const count = Object.keys(focusFeaturesByLevel[level]).length;

    const id =
        level === "RLS" ? "#rlsCount"
            : level === "RTS" ? "#rtsCount"
                : level === "RSS" ? "#rssCount"
                    : null;

    if (!id) return;

    $(id).html(count >= 2 ? `${count} sélectionnés` : `${count} sélectionné`);
}

/* -----------------------------
   Add / remove highlight
------------------------------ */

function applyFocusForCode(level, code, on, baseFeatureIfKnown) {
    const L = LEVELS[level];
    if (!L) return;

    const c = String(code);
    const focusSource = getFocusSource(level);
    if (!focusSource) return;

    const focusDict = focusFeaturesByLevel[level];

    if (on) {
        const baseFeature = baseFeatureIfKnown || getBaseFeatureForCode(level, c);

        if (!baseFeature) {
            if (!L.ready) pendingToggles.push({ level, code: c, on: true });
            return;
        }

        const geom = baseFeature.getGeometry();
        if (!geom) return;

        // Avoid duplicates
        if (focusDict[c]) return;

        const cloned = geom.clone ? geom.clone() : geom;
        const focusFeature = new ol.Feature({ geometry: cloned, code: c, level });

        focusSource.addFeature(focusFeature);
        focusDict[c] = focusFeature;

    } else {
        const f = focusDict[c];
        if (f) {
            focusSource.removeFeature(f);
            delete focusDict[c];
        } else if (!L.ready) {
            const idx = pendingToggles.findIndex(p => p.level === level && String(p.code) === c);
            if (idx >= 0) pendingToggles.splice(idx, 1);
        }
    }

    updateCount(level);
}

/* -----------------------------
   Map ↔ Checkbox sync
------------------------------ */

let isSyncing = false;

function cssEscape(s) {
    return (window.CSS && CSS.escape) ? CSS.escape(s) : String(s).replace(/["\\]/g, "\\$&");
}

// Map → Checkbox (for all 3 layers)
map.on("singleclick", function (evt) {
    map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
        const level =
            layer === RLSLayer ? "RLS"
                : layer === RTSLayer ? "RTS"
                    : layer === RSSLayer ? "RSS"
                        : null;

        if (!level) return false;

        const code = String(feature.get("code") ?? feature.getId() ?? "");
        if (!code) return false;

        const name = `lsp-${level.toLowerCase()}`;
        const selector = `input[name="${name}"][value="${cssEscape(code)}"]`;
        const checkbox = document.querySelector(selector);
        if (!checkbox) return true;

        isSyncing = true;
        checkbox.checked = !checkbox.checked;

        // Important: correct signature (level, code, on, baseFeatureIfKnown)
        applyFocusForCode(level, code, checkbox.checked, feature);

        checkbox.dispatchEvent(new Event("change", { bubbles: true }));
        isSyncing = false;

        return true;
    });
});

// Checkbox → Map (ONE delegated handler)
export function wireCheckboxes() {
    // Remove previous handler to avoid duplicates
    $(document).off("change", 'input[type="checkbox"][name^="lsp-"]');

    $(document).on("change", 'input[type="checkbox"][name^="lsp-"]', function () {
        if (isSyncing) return;

        const code = String(this.value); // use value (safer than id)
        const on = this.checked;

        const level =
            this.name === "lsp-rls" ? "RLS"
                : this.name === "lsp-rts" ? "RTS"
                    : this.name === "lsp-rss" ? "RSS"
                        : null;

        if (!level) return;

        isSyncing = true;
        applyFocusForCode(level, code, on);
        isSyncing = false;
    });
}

/* -----------------------------
   Initialize readiness watchers
------------------------------ */

setReadyWhenSourceReady("RLS");
setReadyWhenSourceReady("RTS");
setReadyWhenSourceReady("RSS");
