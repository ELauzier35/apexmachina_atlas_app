
const TYPE_TO_LIST_DICT = {
    "Indicateurs de coûts et de performance" : "indicatorCost",
    "Caractéristiques de la patientèle" : "indicatorPatient",
    "Indicateurs d'accès aux services de santé" : "indicatorAccess",
    "Indicateurs socio-économiques" : "indicatorSocio",
    "Indicateurs géospatiaux" : "indicatorGeospatial",
}

function createIndicatorsList(){
    // Clear containers if you recreate the list multiple times
    $("#indicatorCost").empty();
    $("#indicatorPatient").empty();
    $("#indicatorAccess").empty();
    $("#indicatorSocio").empty();
    $("#indicatorGeospatial").empty();



    atlas_indicators.forEach(function (indicator) {


        let ind_el = `<label for="${indicator["id"]}" class="badge indicator-badge inline-flex items-center gap-2 px-3 py-2.5 rounded-full text-slate-900 border !border-slate-200">
                <input type="checkbox" name="indicator-selection" value="${indicator["id"]}" id="${indicator["id"]}" data-title="${indicator["title"]}">
                <span>${indicator["title"]}</span>
            </label>`;

        $(`#${TYPE_TO_LIST_DICT[indicator['category']]}`).append(ind_el);
    })
}

function updateIndicatorsOnMap() {
    // Listen for checkbox changes on indicators
    $(document).on('change', 'input[name="indicator-selection"]', function() {
        let indicatorId = $(this).val();
        let indicatorTitle = $(this).data('title');

        if ($(this).is(':checked')) {
            // Remove "Aucun indicateur choisi" message if present
            $('#indicatorOnMap .no-ind').remove();

            // Add checkbox badge to indicatorOnMap
            let checkboxBadge = `<label for="onmap-${indicatorId}" class="badge indicator-badge inline-flex items-center gap-2 px-3 py-2.5 rounded-full text-slate-900 border !border-slate-200" data-indicator="${indicatorId}">
                <input type="checkbox" name="indicator-on-map" value="${indicatorId}" id="onmap-${indicatorId}">
                <span>${indicatorTitle}</span>
            </label>`;

            $('#indicatorOnMap').append(checkboxBadge);
        } else {
            // Remove the checkbox badge from indicatorOnMap
            $(`#indicatorOnMap label[data-indicator="${indicatorId}"]`).remove();

            // Show "Aucun indicateur choisi" if no indicators left
            if ($('#indicatorOnMap label').length === 0) {
                $('#indicatorOnMap').html('<span class="no-ind">Aucun indicateur choisi</span>');
            }
        }
    });
}


let tourStepCount = 0;

function createTourStepHtml(stepNum) {
    return `
        <div class="tour-step-box border !border-slate-200" data-step="${stepNum}">
            <div class="tour-step-header">
                <span class="tour-step-title">Étape ${stepNum}</span>
                <button type="button" class="tour-step-delete"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="tour-step-body">
                <span class="pre">Position :</span>
                <div class="flex-row-badge position-radios">
                    <label for="start-${stepNum}" class="badge position-badge inline-flex items-center gap-2 px-3 py-2.5 rounded-full text-slate-900 border !border-slate-200">
                        <input type="radio" name="tour-position-${stepNum}" value="start" id="start-${stepNum}">
                        <span>Départ</span>
                    </label>
                    <label for="legend-${stepNum}" class="badge position-badge inline-flex items-center gap-2 px-3 py-2.5 rounded-full text-slate-900 border !border-slate-200">
                        <input type="radio" name="tour-position-${stepNum}" value="legend" id="legend-${stepNum}">
                        <span>Légende</span>
                    </label>
                    <label for="navigation-${stepNum}" class="badge position-badge inline-flex items-center gap-2 px-3 py-2.5 rounded-full text-slate-900 border !border-slate-200">
                        <input type="radio" name="tour-position-${stepNum}" value="navigation" id="navigation-${stepNum}">
                        <span>Navigation</span>
                    </label>
                    <label for="left-map-box-${stepNum}" class="badge position-badge inline-flex items-center gap-2 px-3 py-2.5 rounded-full text-slate-900 border !border-slate-200">
                        <input type="radio" name="tour-position-${stepNum}" value="left-map-box" id="left-map-box-${stepNum}">
                        <span>Boîte de gauche</span>
                    </label>
                </div>

                <label for="tour-title-${stepNum}">Titre :</label>
                <input type="text" name="tour-title-${stepNum}" id="tour-title-${stepNum}" placeholder="Entrez le titre de l'étape">

                <label for="tour-text-${stepNum}">Texte :</label>
                <input type="text" name="tour-text-${stepNum}" id="tour-text-${stepNum}" placeholder="Entrez la description de l'étape">
            </div>
        </div>
    `;
}

function renumberTourSteps() {
    $('.tour-step-box').each(function(index) {
        let newNum = index + 1;
        let $step = $(this);

        // Update data attribute
        $step.attr('data-step', newNum);

        // Update header title
        $step.find('.tour-step-title').text('Étape ' + newNum);

        // Update position radio buttons
        let positions = ['start', 'legend', 'navigation', 'left-map-box'];
        positions.forEach(function(pos) {
            let $radio = $step.find(`input[value="${pos}"]`);
            let $label = $radio.closest('label');
            $radio.attr('name', 'tour-position-' + newNum);
            $radio.attr('id', pos + '-' + newNum);
            $label.attr('for', pos + '-' + newNum);
        });

        // Update title input
        let $titleInput = $step.find('input[name^="tour-title"]');
        let $titleLabel = $titleInput.prev('label');
        $titleInput.attr('name', 'tour-title-' + newNum);
        $titleInput.attr('id', 'tour-title-' + newNum);
        $titleLabel.attr('for', 'tour-title-' + newNum);

        // Update text input
        let $textInput = $step.find('input[name^="tour-text"]');
        let $textLabel = $textInput.prev('label');
        $textInput.attr('name', 'tour-text-' + newNum);
        $textInput.attr('id', 'tour-text-' + newNum);
        $textLabel.attr('for', 'tour-text-' + newNum);
    });

    // Update the counter
    tourStepCount = $('.tour-step-box').length;
}

$('.add-tour-step').click(function(){
    tourStepCount++;
    $('#tourStepList').append(createTourStepHtml(tourStepCount));
});

// Delete tour step
$(document).on('click', '.tour-step-delete', function() {
    $(this).closest('.tour-step-box').fadeOut(200, function() {
        $(this).remove();
        renumberTourSteps();
    });
});


function validateForm() {
    let isValid = true;
    let errors = [];

    // Clear previous error alert
    $('.error-alert').remove();

    // Check text inputs (not radio/checkbox)
    const requiredInputs = [
        { selector: '#short-title', name: 'Titre court' },
        { selector: '#long-title', name: 'Titre long' },
        { selector: '#short-description', name: 'Description courte' },
        { selector: '#long-description', name: 'Description longue' },
        { selector: '#publication-citation', name: 'Publication - Citation' },
        { selector: '#publication-doi', name: 'Publication - DOI' },
        { selector: '#publication-url', name: 'Publication - URL' }
    ];

    requiredInputs.forEach(function(input) {
        if ($(input.selector).val().trim() === '') {
            errors.push(input.name + ' est requis');
            isValid = false;
        }
    });

    // Check badge color selection
    if ($('input[name="badge-color"]:checked').length === 0) {
        errors.push('Veuillez sélectionner une couleur de badge');
        isValid = false;
    }

    // Check at least 1 indicator is selected
    if ($('input[name="indicator-selection"]:checked').length === 0) {
        errors.push('Veuillez sélectionner au moins un indicateur');
        isValid = false;
    }

    // Check default indicator on map is selected (only if indicators are selected)
    if ($('input[name="indicator-selection"]:checked').length > 0 &&
        $('input[name="indicator-on-map"]:checked').length === 0) {
        errors.push('Veuillez sélectionner un indicateur par défaut sur la carte');
        isValid = false;
    }

    // Validate tour steps if any exist
    $('.tour-step-box').each(function(index) {
        let stepNum = index + 1;
        let $step = $(this);

        // Check position radio
        if ($step.find('input[type="radio"]:checked').length === 0) {
            errors.push('Étape ' + stepNum + ' : Veuillez sélectionner une position');
            isValid = false;
        }

        // Check title
        let $title = $step.find('input[name^="tour-title"]');
        if ($title.val().trim() === '') {
            errors.push('Étape ' + stepNum + ' : Le titre est requis');
            isValid = false;
        }

        // Check text
        let $text = $step.find('input[name^="tour-text"]');
        if ($text.val().trim() === '') {
            errors.push('Étape ' + stepNum + ' : Le texte est requis');
            isValid = false;
        }
    });

    // Show error alert if validation failed
    if (!isValid) {
        let alertHtml = `
            <div class="error-alert">
                <div class="error-alert-header">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <span>Formulaire incomplet</span>
                    <button type="button" class="alert-close"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <ul class="error-alert-list">
                    ${errors.map(e => '<li>' + e + '</li>').join('')}
                </ul>
            </div>
        `;
        $('#main form').prepend(alertHtml);

        // Scroll to top of form
        $('html, body').animate({
            scrollTop: $('#main form').offset().top - 20
        }, 300);
    }

    return isValid;
}

function generateRandomSeries(length) {
    const characters = '0123456789';
    let series = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        const randomCharacter = characters.charAt(randomIndex);
        series += randomCharacter;
    }
    return series;
}

function buildProjectData() {
    let projectData = {
        "id": generateRandomSeries(12),
        "short-title": $('#short-title').val().trim(),
        "long-title": $('#long-title').val().trim(),
        "short-description": $('#short-description').val().trim(),
        "long-description": $('#long-description').val().trim(),
        "badge-color": $('input[name="badge-color"]:checked').val(),
        "publication": {
            "citation": $('#publication-citation').val().trim(),
            "DOI": $('#publication-doi').val().trim(),
            "URL": $('#publication-url').val().trim()
        },
        "indicators": [],
        "indicators-on-map": [],
        "guided-tour": {}
    };

    // Collect selected indicators
    $('input[name="indicator-selection"]:checked').each(function() {
        projectData["indicators"].push($(this).val());
    });

    // Collect indicators to show on map by default
    $('input[name="indicator-on-map"]:checked').each(function() {
        projectData["indicators-on-map"].push($(this).val());
    });

    // Collect tour steps
    $('.tour-step-box').each(function(index) {
        let stepNum = index + 1;
        let $step = $(this);

        projectData["guided-tour"][stepNum] = {
            "position": $step.find('input[type="radio"]:checked').val(),
            "title": $step.find('input[name^="tour-title"]').val().trim(),
            "text": $step.find('input[name^="tour-text"]').val().trim()
        };
    });

    return projectData;
}

function showSuccessAlert(message) {
    $('.success-alert').remove();
    $('.error-alert').remove();

    let alertHtml = `
        <div class="success-alert">
            <div class="success-alert-header">
                <i class="fa-solid fa-circle-check"></i>
                <span>${message}</span>
                <button type="button" class="alert-close"><i class="fa-solid fa-xmark"></i></button>
            </div>
        </div>
    `;
    $('#main form').prepend(alertHtml);

    $('html, body').animate({
        scrollTop: $('#main form').offset().top - 20
    }, 300);
}

function showErrorAlert(message) {
    $('.success-alert').remove();
    $('.error-alert').remove();

    let alertHtml = `
        <div class="error-alert">
            <div class="error-alert-header">
                <i class="fa-solid fa-circle-exclamation"></i>
                <span>${message}</span>
                <button type="button" class="alert-close"><i class="fa-solid fa-xmark"></i></button>
            </div>
        </div>
    `;
    $('#main form').prepend(alertHtml);

    $('html, body').animate({
        scrollTop: $('#main form').offset().top - 20
    }, 300);
}

// Scroll-based navigation active state
function initScrollNavigation() {
    const sections = document.querySelectorAll('.form-card');
    const navLinks = document.querySelectorAll('.nav-link');

    // Smooth scroll on nav link click
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-section');
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 100;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Update active state on scroll
    function updateActiveNav() {
        let currentSection = '';
        const scrollPosition = window.scrollY + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === currentSection) {
                link.classList.add('active');
            }
        });
    }

    // Throttle scroll event
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateActiveNav();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Initial call
    updateActiveNav();
}

$(document).ready(function () {
    createIndicatorsList();
    updateIndicatorsOnMap();
    initScrollNavigation();

    // Close alert on click
    $(document).on('click', '.alert-close', function() {
        $(this).closest('.error-alert, .success-alert').fadeOut(200, function() {
            $(this).remove();
        });
    });

    // Form submit validation
    $('#main form').on('submit', function(e) {
        e.preventDefault();

        if (validateForm()) {
            let projectData = buildProjectData();

            fetch('/admin/new_project/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(projectData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showSuccessAlert('Projet créé avec succès !');
                } else {
                    showErrorAlert(data.message || 'Erreur lors de la création du projet');
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                showErrorAlert('Erreur de connexion au serveur');
            });
        }
    });
})