/**
 * GeoSanté - Formulaire de demande d'analyse
 */

(function() {
    'use strict';

    // ===========================================
    // Configuration
    // ===========================================

    const CONFIG = {
        totalSections: 6,
        toastDuration: 4000,
        categoryMapping: {
            "Indicateurs de coûts et de performance": "indicatorCost",
            "Caractéristiques de la patientèle": "indicatorPatient",
            "Indicateurs d'accès aux services de santé": "indicatorAccess",
            "Indicateurs socio-économiques": "indicatorSocio",
            "Indicateurs géospatiaux": "indicatorGeospatial"
        },
        labels: {
            profile: {
                'etudiant': 'Étudiant',
                'chercheur': 'Chercheur en santé publique',
                'clinicien': 'Clinicien',
                'gestionnaire': 'Gestionnaire',
                'industrie': 'Industrie pharmaceutique',
                'actuaire': 'Actuaire / Économiste'
            },
            support: {
                'niveau1': 'Niveau 1 – Support minimal',
                'niveau2': 'Niveau 2 – Accompagnement guidé',
                'niveau3': 'Niveau 3 – Co-construction'
            }
        },
        // Validation rules per section
        validation: {
            1: {
                radios: ['profile'],
                fields: ['organization']
            },
            2: {
                fields: ['titleLong', 'issue', 'objective']
            },
            3: {
                // Optional section
            },
            4: {
                // Optional section
            },
            5: {
                radios: ['support']
            },
            6: {
                fields: ['firstName', 'lastName', 'email']
            }
        },
        errorMessages: {
            radio: 'Veuillez sélectionner une option',
            field: 'Ce champ est requis'
        }
    };

    // ===========================================
    // State
    // ===========================================

    let currentSection = 1;

    // ===========================================
    // DOM Helpers
    // ===========================================

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);
    const $id = (id) => document.getElementById(id);

    // ===========================================
    // Validation
    // ===========================================

    function validateSection(sectionNum) {
        const rules = CONFIG.validation[sectionNum];
        if (!rules) return true;

        let isValid = true;
        const section = $(`[data-section="${sectionNum}"]`);

        // Clear previous errors
        section.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        section.querySelectorAll('.error-message').forEach(el => el.remove());

        // Validate radio groups
        if (rules.radios) {
            rules.radios.forEach(radioName => {
                const isChecked = $(`input[name="${radioName}"]:checked`);

                // Special case: profile radio is optional if "other" field is filled
                if (radioName === 'profile') {
                    const otherField = $id('profileOther');
                    if (!isChecked && !otherField?.value.trim()) {
                        isValid = false;
                        markRadioGroupError(radioName, section);
                    }
                } else if (!isChecked) {
                    isValid = false;
                    markRadioGroupError(radioName, section);
                }
            });
        }

        // Validate text/textarea fields
        if (rules.fields) {
            rules.fields.forEach(fieldId => {
                const field = $id(fieldId);
                if (field && !field.value.trim()) {
                    isValid = false;
                    markFieldError(field);
                }
            });
        }

        // Scroll to first error if validation failed
        if (!isValid) {
            const firstError = section.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        return isValid;
    }

    function markFieldError(field) {
        field.classList.add('error');

        // Add error message directly after the field if not exists
        if (!field.nextElementSibling?.classList.contains('error-message')) {
            const errorMsg = document.createElement('span');
            errorMsg.className = 'error-message';
            errorMsg.textContent = CONFIG.errorMessages.field;
            field.insertAdjacentElement('afterend', errorMsg);
        }

        // Remove error on input
        field.addEventListener('input', function onInput() {
            if (field.value.trim()) {
                clearFieldError(field);
                field.removeEventListener('input', onInput);
            }
        });
    }

    function clearFieldError(field) {
        field.classList.remove('error');
        const errorMsg = field.nextElementSibling;
        if (errorMsg?.classList.contains('error-message')) {
            errorMsg.remove();
        }
    }

    function markRadioGroupError(radioName, section) {
        // Find the container (option-grid or support-grid)
        const firstRadio = section.querySelector(`input[name="${radioName}"]`);
        if (!firstRadio) return;

        const container = firstRadio.closest('.option-grid, .support-grid');
        if (container) {
            container.classList.add('error');

            // Add error message
            const parent = container.parentElement;
            if (!parent.querySelector('.error-message')) {
                const errorMsg = document.createElement('span');
                errorMsg.className = 'error-message';
                errorMsg.textContent = CONFIG.errorMessages.radio;
                container.insertAdjacentElement('afterend', errorMsg);
            }
        }
    }

    function clearRadioGroupError(radioName) {
        const firstRadio = $(`input[name="${radioName}"]`);
        if (!firstRadio) return;

        const container = firstRadio.closest('.option-grid, .support-grid');
        if (container) {
            container.classList.remove('error');
            const errorMsg = container.parentElement?.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        }
    }

    // ===========================================
    // Navigation
    // ===========================================

    function updateProgress() {
        const progress = ((currentSection - 1) / (CONFIG.totalSections - 1)) * 100;
        $id('progressLine').style.width = `${progress-1}%`;

        $$('.step').forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');

            if (stepNum === currentSection) {
                step.classList.add('active');
            } else if (stepNum < currentSection) {
                step.classList.add('completed');
            }
        });
    }

    function showSection(sectionNum) {
        $$('.form-section').forEach(section => section.classList.remove('active'));
        $(`[data-section="${sectionNum}"]`).classList.add('active');

        currentSection = sectionNum;
        updateProgress();
        updateSummary();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function nextSection() {
        // Validate current section before proceeding
        if (!validateSection(currentSection)) {
            return;
        }

        if (currentSection < CONFIG.totalSections) {
            showSection(currentSection + 1);
        }
    }

    function prevSection() {
        if (currentSection > 1) {
            showSection(currentSection - 1);
        }
    }

    function initStepNavigation() {
        $$('.step').forEach(step => {
            step.addEventListener('click', () => {
                const stepNum = parseInt(step.dataset.step);

                // Going back is always allowed
                if (stepNum < currentSection) {
                    showSection(stepNum);
                    return;
                }

                // Going forward requires validation of all sections in between
                if (stepNum > currentSection) {
                    let canProceed = true;
                    for (let i = currentSection; i < stepNum; i++) {
                        if (!validateSection(i)) {
                            canProceed = false;
                            break;
                        }
                    }
                    if (canProceed) {
                        showSection(stepNum);
                    }
                }
            });
        });
    }

    // ===========================================
    // Form Controls
    // ===========================================

    function selectOption(element, groupName) {
        const parent = element.closest('.option-grid, .support-grid');

        parent.querySelectorAll('.option-card, .support-card').forEach(card => {
            card.classList.remove('selected');
        });

        element.classList.add('selected');
        element.querySelector('input').checked = true;

        // Clear error when option is selected
        clearRadioGroupError(groupName);
    }

    function toggleCheckbox(element) {
        const input = element.querySelector('input');
        input.checked = !input.checked;
        element.classList.toggle('selected', input.checked);
    }

    function toggleCategory(header) {
        header.classList.toggle('open');
        header.nextElementSibling.classList.toggle('open');
    }

    // ===========================================
    // Indicators
    // ===========================================

    function createIndicatorsList() {
        // Clear all containers
        Object.values(CONFIG.categoryMapping).forEach(containerId => {
            const container = $id(containerId);
            if (container) container.innerHTML = '';
        });

        // Populate indicators
        if (typeof atlas_indicators === 'undefined') return;

        atlas_indicators.forEach(indicator => {
            const containerId = CONFIG.categoryMapping[indicator.category];
            const container = $id(containerId);

            if (container) {
                const label = document.createElement('label');
                label.className = 'indicator-item inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-slate-900 border !border-slate-200';
                label.innerHTML = `
                    <input type="checkbox" name="indicators" value="${indicator.id}">
                    <span>${indicator.title}</span>
                `;
                container.appendChild(label);
            }
        });
    }

    function updateIndicatorCount(checkbox) {
        const category = checkbox.closest('.indicator-category');
        const count = category.querySelectorAll('input:checked').length;
        category.querySelector('.count').textContent = `${count} sélectionné(s)`;
        updateSelectedTags();
    }

    function updateSelectedTags() {
        const container = $id('selectedIndicators');
        const checkedInputs = $$('input[name="indicators"]:checked');

        if (checkedInputs.length > 0) {
            container.style.display = 'flex';
            container.innerHTML = '';

            checkedInputs.forEach(input => {
                const labelText = input.closest('.indicator-item').querySelector('span').textContent;
                const tag = document.createElement('span');
                tag.className = 'tag';
                tag.innerHTML = `
                    ${labelText}
                    <button type="button" data-value="${input.value}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                `;
                container.appendChild(tag);
            });
        } else {
            container.style.display = 'none';
        }
    }

    function removeTag(value) {
        const checkbox = $(`input[name="indicators"][value="${value}"]`);
        if (checkbox) {
            checkbox.checked = false;
            updateIndicatorCount(checkbox);
        }
    }

    function filterIndicators(query) {
        const lowerQuery = query.toLowerCase();

        $$('.indicator-item').forEach(item => {
            const matches = item.textContent.toLowerCase().includes(lowerQuery);
            item.style.display = matches ? 'flex' : 'none';
        });

        // Auto-open categories with visible items
        if (query.length > 0) {
            $$('.indicator-category').forEach(category => {
                const hasVisibleItems = Array.from(category.querySelectorAll('.indicator-item'))
                    .some(item => item.style.display !== 'none');

                if (hasVisibleItems) {
                    category.querySelector('.category-header').classList.add('open');
                    category.querySelector('.category-content').classList.add('open');
                }
            });
        }
    }

    function initIndicatorEvents() {
        // Delegate indicator checkbox changes
        document.addEventListener('change', (e) => {
            if (e.target.matches('input[name="indicators"]')) {
                updateIndicatorCount(e.target);
            }
        });

        // Delegate tag removal clicks
        $id('selectedIndicators')?.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-value]');
            if (button) {
                removeTag(button.dataset.value);
            }
        });

        // Search input
        $id('indicatorSearch')?.addEventListener('input', (e) => {
            filterIndicators(e.target.value);
        });
    }

    // ===========================================
    // Summary
    // ===========================================

    function updateSummary() {
        // Profile
        const profileRadio = $('input[name="profile"]:checked');
        $id('summaryProfile').textContent = profileRadio
            ? CONFIG.labels.profile[profileRadio.value]
            : 'Non spécifié';

        // Organization
        const org = $id('organization')?.value || '';
        $id('summaryOrg').textContent = org || 'Non spécifiée';

        // Title
        const title = $id('titleLong')?.value || '';
        $id('summaryTitle').textContent = title || 'Non spécifié';

        // Indicators count
        const indicatorCount = $$('input[name="indicators"]:checked').length;
        $id('summaryIndicators').textContent = indicatorCount;

        // Support level
        const supportRadio = $('input[name="support"]:checked');
        $id('summarySupport').textContent = supportRadio
            ? CONFIG.labels.support[supportRadio.value]
            : 'Non spécifié';
    }

    function initSummaryListeners() {
        $id('organization')?.addEventListener('input', updateSummary);
        $id('titleLong')?.addEventListener('input', updateSummary);
    }

    // ===========================================
    // Form Submission
    // ===========================================

    function showToast() {
        const toast = $id('toast');
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, CONFIG.toastDuration);
    }

    function initFormSubmission() {
        $id('geoSanteForm')?.addEventListener('submit', (e) => {
            e.preventDefault();

            // Validate last section before submission
            if (!validateSection(currentSection)) {
                return;
            }

            showToast();
            // TODO: Add actual form submission logic here
        });
    }

    // ===========================================
    // Initialization
    // ===========================================

    function init() {
        createIndicatorsList();
        initStepNavigation();
        initIndicatorEvents();
        initSummaryListeners();
        initFormSubmission();
        updateProgress();
    }

    // Expose necessary functions globally for inline handlers
    window.nextSection = nextSection;
    window.prevSection = prevSection;
    window.selectOption = selectOption;
    window.toggleCheckbox = toggleCheckbox;
    window.toggleCategory = toggleCategory;

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
