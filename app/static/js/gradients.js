window.modifySelPalette;
window.modifySteps;
window.modifySelMethod;

window.black_to_white = [
    [0, 0, 0, , 1],
    [28, 28, 28, 1],
    [56, 56, 56, 1],
    [85, 85, 85, 1],
    [113, 113, 113, 1],
    [141, 141, 141, 1],
    [169, 169, 169, 1],
    [197, 197, 197, 1],
    [225, 225, 225, 1],
    [255, 255, 255, 1],
]
window.white_to_black = [...black_to_white].reverse();
window.red_yel_blue = [
    [215, 25, 28, 1],
    [232, 91, 58, 1],
    [249, 158, 89, 1],
    [254, 201, 128, 1],
    [255, 237, 170, 1],
    [237, 247, 201, 1],
    [199, 230, 219, 1],
    [157, 207, 228, 1],
    [100, 165, 205, 1],
    [44, 123, 182, 1],
]
window.blue_yel_red = [
    [44, 123, 182, 1],
    [100, 165, 205, 1],
    [157, 207, 228, 1],
    [199, 230, 219, 1],
    [237, 247, 201, 1],
    [255, 237, 170, 1],
    [254, 201, 128, 1],
    [249, 158, 89, 1],
    [232, 91, 58, 1],
    [215, 25, 28, 1]
]
window.red_green_blue = [
    [253, 19, 0, 1],
    [224, 138, 0, 1],
    [200, 175, 0, 1],
    [172, 202, 0, 1],
    [125, 219, 67, 1],
    [75, 223, 127, 1],
    [0, 223, 179, 1],
    [0, 203, 209, 1],
    [0, 161, 255, 1],
    [0, 54, 255, 1],
]
window.red_green_blue_rev = [
    [0, 54, 255, 1],
    [0, 161, 255, 1],
    [0, 203, 209, 1],
    [0, 223, 179, 1],
    [75, 223, 127, 1],
    [125, 219, 67, 1],
    [172, 202, 0, 1],
    [200, 175, 0, 1],
    [224, 138, 0, 1],
    [253, 19, 0, 1]
];
window.brown_green_blue = [
    [201, 92, 53, 1],
    [212, 136, 22, 1],
    [200, 184, 3, 1],
    [174, 204, 28, 1],
    [134, 207, 72, 1],
    [56, 208, 118, 1],
    [0, 199, 147, 1],
    [0, 179, 164, 1],
    [0, 128, 174, 1],
    [10, 77, 140, 1],
]
window.brown_green_blue_rev = [...brown_green_blue].reverse();
window.world_palette_rev = [
    "#14243c", "#233653", "#294D65", "#2e6377", "#38909a", "#65b0b8", "#92cfd5", "#bfdddb", "#eceae1", "#ffffff"
]
window.world_palette = [
    "#14243c", "#233653", "#294D65", "#2e6377", "#38909a", "#65b0b8", "#92cfd5", "#bfdddb", "#eceae1", "#ffffff"
].reverse()
window.world_palette_transp = world_palette.map(hex => {
    // Convert hex to RGB
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    // Return array with opacity
    return [r, g, b, 0.8];
});
window.BLUES_COLORS = [
    [255, 253, 221, 1],  // #fffddd
    [208, 226, 204, 1],  // #d0e2cc
    [178, 210, 199, 1],  // #b2d2c7
    [128, 189, 195, 1],  // #80bdc3
    [100, 174, 189, 1],  // #64aebd
    [83, 149, 173, 1],   // #5395ad
    [62, 116, 144, 1],   // #3e7490
    [51, 99, 129, 1],    // #336381
    [36, 68, 100, 1],    // #244464
    [27, 39, 57, 1],     // #1b2739
];
window.reds_colors = [
    [255, 255, 204, 1],
    [255, 236, 161, 1],
    [254, 217, 118, 1],
    [254, 179, 89, 1],
    [253, 140, 60, 1],
    [240, 83, 44, 1],
    [226, 25, 28, 1],
    [177, 13, 33, 1],
    [128, 0, 38, 1],
    [64, 3, 21, 1],
]
window.reds_colors_transp = [
    [255, 255, 204, 0.8],
    [255, 236, 161, 0.8],
    [254, 217, 118, 0.8],
    [254, 179, 89, 0.8],
    [253, 140, 60, 0.8],
    [240, 83, 44, 0.8],
    [226, 25, 28, 0.8],
    [177, 13, 33, 0.8],
    [128, 0, 38, 0.8],
    [64, 3, 21, 0.8],
]
window.reds_colors_rev = [
    [64, 3, 21, 1],
    [128, 0, 38, 1],
    [177, 13, 33, 1],
    [226, 25, 28, 1],
    [240, 83, 44, 1],
    [253, 140, 60, 1],
    [254, 179, 89, 1],
    [254, 217, 118, 1],
    [255, 236, 161, 1],
    [255, 255, 204, 1],
]
window.red_yel_green = [
    [215, 25, 28, 1],
    [223, 67, 56, 1],
    [231, 111, 85, 1],
    [241, 165, 121, 1],
    [251, 216, 156, 1],
    [255, 237, 170, 1],
    [195, 206, 140, 1],
    [135, 175, 111, 1],
    [91, 152, 89, 1],
    [9, 109, 49, 1],
]
window.greens_colors = [
    [255, 253, 221, 1],  // #fffddd (unchanged - light yellowish green)
    [220, 240, 160, 1],  // #dcf0a0 (brighter and more distinct than previous)
    [170, 225, 100, 1],  // #aae164 (stronger lime tone)
    [115, 205, 70, 1],   // #73cd46 (enhanced vibrance)
    [75, 185, 50, 1],    // #4bb932 (brighter midtone)
    [55, 160, 45, 1],    // #37a02d (strong contrast from above)
    [40, 135, 50, 1],    // #288732 (a bit cooler, more separation)
    [28, 110, 45, 1],    // #1c6e2d (darker and cooler)
    [15, 85, 35, 1],     // #0f5523 (deeper contrast)
    [5, 50, 20, 1],      // #053214 (very dark green, better endpoint)
];
window.greens_colors_rev = [...greens_colors].reverse();
window.ci_colors = [
    [135, 0, 0, 1],
    [160, 54, 0, 1],
    [180, 109, 10, 1],
    [207, 165, 1, 1],
    [227, 210, 0, 1],
    [219, 229, 0, 1],
    [150, 187, 2, 1],
    [108, 146, 16, 1],
    [54, 129, 1, 1],
    [9, 109, 49, 1],
]
window.ci_colors_rev = [...ci_colors].reverse();
window.BLUES_COLORS_REV = [...BLUES_COLORS].reverse();
window.ndvi_colors = [
    [206, 126, 69, 1],
    [241, 181, 85, 1],
    [252, 209, 99, 1],
    [153, 183, 24, 1],
    [116, 169, 1, 1],
    [82, 148, 0, 1],
    [32, 116, 1, 1],
    [5, 98, 1, 1],
    [2, 59, 1, 1],
    [1, 29, 1, 1]
]
window.ndvi_colors_rev = [...ndvi_colors].reverse();
window.inferno_colors = [
    [1, 1, 11, 1],
    [29, 22, 41, 1],
    [61, 33, 64, 1],
    [100, 40, 80, 1],
    [142, 45, 86, 1],
    [173, 61, 86, 1],
    [199, 82, 82, 1],
    [221, 107, 77, 1],
    [242, 178, 93, 1],
    [246, 249, 146, 1]
]
window.inferno_colors_rev = [...inferno_colors].reverse();
window.ndbi_colors = [
    [0, 49, 125, 1],
    [0, 109, 81, 1],
    [0, 164, 41, 1],
    [0, 202, 13, 1],
    [85, 212, 9, 1],
    [162, 222, 5, 1],
    [254, 233, 1, 1],
    [245, 189, 17, 1],
    [234, 138, 35, 1],
    [223, 82, 54, 1]
]
window.spi_colors = [
    [140, 81, 10, 1],
    [191, 129, 45, 1],
    [223, 194, 125, 1],
    [246, 232, 195, 1],
    [245, 245, 245, 1],
    [199, 234, 229, 1],
    [128, 205, 193, 1],
    [53, 151, 143, 1],
    [7, 94, 87, 1],
    [0, 60, 60, 1] 
];
window.spi_colors_rev = [...spi_colors].reverse();


window.class_to_grad_dict = [
    // Reds
    { name : 'Reds', class : 'yr-gradient', colors : reds_colors },
    { name : 'Reds inverted', class : 'ry-gradient', colors : reds_colors_rev },
    // Greens
    { name : 'Greens', class : 'yg-gradient', colors : greens_colors },
    { name : 'Greens inverted', class : 'gy-gradient', colors : greens_colors_rev },
    // Blues
    { name : 'Blues', class : 'yb-gradient', colors : BLUES_COLORS },
    { name : 'Blues inverted', class : 'by-gradient', colors : BLUES_COLORS_REV },
    // Greys
    { name : 'Greys', class : 'wtb-gradient', colors : white_to_black },
    { name : 'Greys inverted', class : 'btw-gradient', colors : black_to_white },
    // Ndvi
    { name : 'Vegetation', class : 'ndvi-gradient', colors : ndvi_colors },
    { name : 'Vegetation inverted', class : 'ndvi-gradient-rev', colors : ndvi_colors_rev },
    // Magma
    { name : 'Magma', class : 'inf-gradient', colors : inferno_colors },
    { name : 'Magma inverted', class : 'inf-gradient-rev', colors : inferno_colors_rev },
    // Cold
    { name : 'Cold', class : 'geoimp-gradient', colors : world_palette },
    { name : 'Cold inverted', class : 'geoimp-gradient-rev', colors : world_palette_rev },
    // Brown Teal
    { name : 'Brown Teal', class : 'spi-gradient', colors : spi_colors },
    { name : 'Brown Teal inverted', class : 'spi-gradient-rev', colors : spi_colors_rev },
    // Red-yel-blue
    { name : 'Red-Yellow-Blue', class : 'ryb-gradient', colors : red_yel_blue },
    { name : 'Blue-Yellow-Red', class : 'byr-gradient', colors : blue_yel_red },
    // Red-yel-green
    { name : 'Red-Yellow-Green', class : 'ci-gradient', colors : ci_colors },
    { name : 'Green-Yellow-Red', class : 'ci-gradient-rev', colors : ci_colors_rev },
    // Red-green-blue
    { name : 'Red-Green-Blue', class : 'rgb-gradient', colors : red_green_blue },
    { name : 'Blue-Green-Red', class : 'rgbinvert-gradient', colors : red_green_blue_rev },
    // Brown-green-blue
    { name : 'Brown-Green-Blue', class : 'browngb-gradient', colors : brown_green_blue },
    { name : 'Blue-Green-Brown', class : 'browngb-gradient-rev', colors : brown_green_blue_rev },
]


window.initGradients = function(){
    const container = document.getElementById('colorPalettes');
    container.innerHTML = ''; // Clear previous content

    const palettes = window.class_to_grad_dict;

    for (let i = 0; i < palettes.length; i += 2) {
        const column = document.createElement('div');
        column.className = 'flex-col-item';

        for (let j = i; j < i + 2 && j < palettes.length; j++) {
            const palette = palettes[j];

            const gradGroup = document.createElement('div');
            gradGroup.className = 'grad-group';

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'gradient';
            input.id = `${palette.class}`;
            if (i === 0 && j === i) input.checked = true;

            const label = document.createElement('label');
            label.htmlFor = `${palette.class}`;
            label.className = 'gradient-box';

            const gradientDiv = document.createElement('div');
            gradientDiv.className = 'gradient';
            gradientDiv.style.background = generateLinearGradient(palette.colors);

            const nameDiv = document.createElement('div');
            nameDiv.className = 'palette-name';
            nameDiv.textContent = palette.name;

            const checkedDiv = document.createElement('div');
            checkedDiv.className = 'checked';
            checkedDiv.innerHTML = `<i class="fa-solid fa-circle-check"></i>`;

            label.appendChild(gradientDiv);
            label.appendChild(nameDiv);
            label.appendChild(checkedDiv);

            gradGroup.appendChild(input);
            gradGroup.appendChild(label);

            column.appendChild(gradGroup);
        }

        container.appendChild(column);
    }
}

window.getColorsByClass = function(className) {
    // Iterate through the dictionary array
    for (let entry of window.class_to_grad_dict) {
        if (entry.class === className) {
            return entry.colors; // Return colors if class name matches
        }
    }
    return null; // Return null if no matching class name found
}

// Helper function to build a CSS linear-gradient from a color array
function generateLinearGradient(colorArray) {
    const steps = colorArray.length;
    const stepPercent = 100 / (steps - 1);

    const gradientStops = colorArray.map((color, index) => {
        const percent = (index * stepPercent).toFixed(2);
        return `${parseColor(color)} ${percent}%`;
    });

    return `linear-gradient(90deg, ${gradientStops.join(', ')})`;
}

function parseColor(color) {
    if (Array.isArray(color) && color.length >= 3) {
        // It's an [r, g, b, (optional) a] array
        const [r, g, b, a] = color;
        if (typeof a === 'number' && a !== 1) {
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        } else {
            return `rgb(${r}, ${g}, ${b})`;
        }
    }

    if (typeof color === 'string') {
        // Already a hex or rgb/rgba string
        const hexRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
        if (hexRegex.test(color)) {
            return color;
        }

        const rgbRegex = /^rgba?\(/;
        if (rgbRegex.test(color)) {
            return color;
        }
    }

    console.warn("Unrecognized color format:", color);
    return 'black'; // Fallback
}


function selectMethod(method) {
    selectedMethod = method;
    document.querySelectorAll('.classification-option').forEach(option => {
        option.classList.toggle('selected', option.dataset.method === method);
    });
    this_data_dict = master_dict[modifyLayer][0];
    if (modifyLayer.includes('TS')) {
        only_vals = [];
        for (const my_key in this_data_dict) {
            only_vals.push(...this_data_dict[my_key]);
        }
    } else {
        only_vals = Object.values(this_data_dict);
    }
    this_only_vals = only_vals.flat(1).filter(val => val !== null);
    modifySelMethod = selectedMethod;
    modifySteps = computeSteps(modifyLayer, this_only_vals, modifySelMethod);
    formatted_steps = formatSteps(modifySteps, modifyLayer);
    updatePreview(modifySelPalette, formatted_steps);
}

function selectPalette(id){
    console.log(`Gradient changed to: ${id}`);
    modifySelPalette = id;
    formatted_steps = formatSteps(modifySteps, modifyLayer);
    updatePreview(modifySelPalette, formatted_steps);
}

window.updatePreview = function (palette_class, steps) {
    $('#preview .gradient').removeClass().addClass('gradient ' + palette_class);
    $('#preview .bottomvalspecial .leg-sm-val').each(function(index) {
        $(this).text(steps[index]);
    });
}

// Event listeners
window.initGradientsListener = function(){
    document.querySelectorAll('.classification-option').forEach(option => {
        option.addEventListener('click', () => selectMethod(option.dataset.method));
    });
    document.querySelectorAll('input[name="gradient"]').forEach(input => {
        input.addEventListener('change', () => selectPalette(input.id));
    });

}


function initModifyLayer(ind_key){
    // Initialize the gradient based on the indicator name
    let thisPalette = newStyling[ind_key][0];
    $('input[name="gradient"][id="'+thisPalette+'"]').prop('checked', true);
    modifySelPalette = thisPalette;
    // Initialize the classification method
    $('.classification-option').removeClass('selected');
    classification_method = newStyling[ind_key][2];
    $('.classification-option[data-method="'+classification_method+'"]').addClass('selected');
    modifySelMethod = classification_method;
    // Update the preview
    modifySteps = newStyling[ind_key][1];
    formatted_steps = formatSteps(modifySteps, ind_key);
    updatePreview(modifySelPalette, formatted_steps);
}
