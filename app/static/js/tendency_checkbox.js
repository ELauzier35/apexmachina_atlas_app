// --- Highlight layer (focus) ---
window.focusSource = new ol.source.Vector();
window.focusLayer = new ol.layer.Vector({ source: focusSource, zIndex: 50 });
// Optional: make sure highlight is visible
focusLayer.setStyle(new ol.style.Style({
    stroke: new ol.style.Stroke({ color: '#2F6DDB', width: 3 }),
    fill: new ol.style.Fill({ color: 'rgba(0, 11, 22,0.55)' })
}));
map.addLayer(focusLayer);

// Track focus features per code
const focusFeatures = Object.create(null);

// Base data layer
const rlsSource = RLSLayer.getSource();

// Cache + readiness
const baseFeatureByCode = Object.create(null);
let rlsReady = false;

// If user clicks a checkbox before data is ready, we remember the intent here:
const pendingToggles = []; // items: { code, on }

function indexBaseFeatures() {
    const feats = rlsSource.getFeatures();
    feats.forEach(f => {
        // Make sure each feature has a usable code
        // Prefer explicit property 'code', else fall back to feature id
        const code = String(f.get('code') ?? f.getId() ?? '');
        if (code) {
            baseFeatureByCode[code] = f;
            // (Optional) also set the id so getFeatureById works fast later
            if (f.getId() == null) f.setId(code);
        }
    });
}

function ensureIndexedIfReady() {
    if (!rlsReady) return;
    // Rebuild cache in case features arrived
    indexBaseFeatures();
}

if (rlsSource.getState && rlsSource.getState() !== 'ready') {
    rlsSource.once('change', function () {
        if (rlsSource.getState() === 'ready') {
            rlsReady = true;
            indexBaseFeatures();
            // Apply any pending checkbox toggles now that data exists
            pendingToggles.splice(0).forEach(({ code, on }) => {
                applyFocusForCode(code, on);
            });
        }
    });
} 
else {
    rlsReady = true;
    indexBaseFeatures();
}

// Counter
function updateRLSCount() {
    const count = Object.keys(focusFeatures).length;
    if (count >= 2) {
        $('#rlsCount').html(`${count} sélectionnés`);
    } else {
        $('#rlsCount').html(`${count} sélectionné`);
    }
}

// Robust base-feature lookup
function getBaseFeatureForCode(code) {
    // 1) cache
    if (baseFeatureByCode[code]) return baseFeatureByCode[code];
    // 2) byId (works if we setId(code) or server provided ids)
    const byId = rlsSource.getFeatureById(code);
    if (byId) return (baseFeatureByCode[code] = byId);
    // 3) last resort: scan by property 'code'
    const found = rlsSource.getFeatures().find(f => String(f.get('code')) === String(code));
    if (found) {
        baseFeatureByCode[code] = found;
        if (found.getId() == null) found.setId(code);
        return found;
    }
    return null;
}

// Add / remove highlight
function applyFocusForCode(code, on, baseFeatureIfKnown) {
    ensureIndexedIfReady();

    if (on) {
        const baseFeature = baseFeatureIfKnown || getBaseFeatureForCode(code);
        if (!baseFeature) {
            // Data not here yet — queue it
            if (!rlsReady) pendingToggles.push({ code, on: true });
            return;
        }
        const geom = baseFeature.getGeometry();
        if (!geom) return;

        const cloned = geom.clone ? geom.clone() : geom;
        const focusFeature = new ol.Feature({ geometry: cloned, code });
        focusSource.addFeature(focusFeature);
        focusFeatures[code] = focusFeature;
    } else {
        const f = focusFeatures[code];
        if (f) {
            focusSource.removeFeature(f);
            delete focusFeatures[code];
        } else if (!rlsReady) {
            // If it was queued as "on" earlier, remove that intent
            const idx = pendingToggles.findIndex(p => p.code === code);
            if (idx >= 0) pendingToggles.splice(idx, 1);
        }
    }

    updateRLSCount();
}

// --- Map → Checkbox ---
let isSyncing = false;
map.on('singleclick', function (evt) {
    map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
        if (layer !== RLSLayer) return false;

        const code = String(feature.get('code') ?? feature.getId() ?? '');
        if (!code) return false;

        const checkbox = document.getElementById(code);
        if (!checkbox) return true;

        isSyncing = true;
        checkbox.checked = !checkbox.checked;
        applyFocusForCode(code, checkbox.checked, feature);
        checkbox.dispatchEvent(new Event('change'));
        isSyncing = false;

        return true;
    });
});

// --- Checkbox → Map  ---
window.wireCheckboxes = function() {
    document.querySelectorAll('input[name="lsp-rls"]').forEach(cb => {
        if (cb.__wired) return;
        cb.__wired = true;

        cb.addEventListener('change', (e) => {
            if (isSyncing) return;
            const code = e.target.id;
            const on = e.target.checked;

            isSyncing = true;
            applyFocusForCode(code, on);
            isSyncing = false;
        });
    });
}