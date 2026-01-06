
import { queryLayerGroup } from "../map-and-layers.js";
import { passQueryIndicator } from "./map-indicators.js";

window.currentTourStep = 0;
window.tourInAction = true;

export function startTour() {
    $('.tour-overlay').addClass('active');
    $('.tour-modal').addClass('active');
}

function setTourStep(stepIndex) {
    document.querySelectorAll('.tour-dot').forEach((dot, index) => {
        dot.classList.remove('active');
        if (index === stepIndex) dot.classList.add('active');
    });
}


export function closeTour(toggleTourInAction = true) {
    $('.tour-overlay').removeClass('active');
    $('.tour-modal').removeClass('active');
    $('.map-box').addClass('novis');
    $('.nav-link').removeClass('active');
    document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
    document.querySelectorAll('.tour-super-highlight').forEach(el => el.classList.remove('tour-super-highlight'));
    if (toggleTourInAction) {
        tourInAction = false;
    }
}

$('.tour-close-btn').click(function () {
    closeTour();
})

const MAIN_TOUR_DICT = {
    'pos0': 'start',
    'pos1': 'nav',
    'pos2': 'left-map-box',
    'pos3': 'leg',
    'pos4': 'left-map-box',
    'pos5': 'left-map-box',
    'pos6': 'left-map-box',
    'pos7': 'left-map-box',
}

const MAIN_TOUR = {
    0: {
        "icon": "<i class='fa-solid fa-compass'></i>",
        "large": false,
        "title": "Bienvenue sur GeoSanté",
        "content": `Cette courte visite guidée vous aidera à prendre en main GeoSanté. 
            Découvrez les outils mis à votre disposition pour explorer, comprendre et analyser les données de santé du Québec.`,
        "content-justify": false,
        "position": "start",
        "highlight": null,
        "super-highlight": null,
        "activate": null,
        "special-step": null
    },
    1: {
        "icon": "<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-mouse-pointer-click-icon lucide-mouse-pointer-click'><path d='M14 4.1 12 6'/><path d='m5.1 8-2.9-.8'/><path d='m6 12-1.9 2'/><path d='M7.2 2.2 8 5.1'/><path d='M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z'/></svg>",
        "large": true,
        "title": "Naviguer sur GeoSanté",
        "content": `<div>Utilisez la barre de navigation pour accéder aux différents outils de GeoSanté.
        Chaque icône vous permet d'explorer les données sous un angle précis.</div>
            <div class="tour-content-block">
                <div class="tour-content-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-map-plus-icon lucide-map-plus">
                        <path
                            d="m11 19-1.106-.552a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0l4.212 2.106a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619V12" />
                        <path d="M15 5.764V12" />
                        <path d="M18 15v6" />
                        <path d="M21 18h-6" />
                        <path d="M9 3.236v15" />
                    </svg>
                </div>
                <div class="tcb-text">
                    Ajoutez des indicateurs de santé directement sur la carte.
            Choisissez parmi 146 indicateurs et visualisez-les pour une année précise
            ou sous forme de séries temporelles couvrant plus de 20 ans. 
                </div>
            </div>
            <div class="tour-content-block">
                <div class="tour-content-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-chart-line-icon lucide-chart-line">
                        <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                        <path d="m19 9-5 5-4-4-3 3" />
                    </svg>
                </div>
                <div class="tcb-text">
                    Analysez l'évolution des indicateurs dans le temps selon les divisions géographiques (RLS, RTS ou RSS). Identifiez rapidement les tendances, les écarts entre les territoires et les changements structurels.
                </div>
            </div>
            <div class="tour-content-block">
                <div class="tour-content-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-chart-scatter-icon lucide-chart-scatter">
                        <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
                        <circle cx="18.5" cy="5.5" r=".5" fill="currentColor" />
                        <circle cx="11.5" cy="11.5" r=".5" fill="currentColor" />
                        <circle cx="7.5" cy="16.5" r=".5" fill="currentColor" />
                        <circle cx="17.5" cy="14.5" r=".5" fill="currentColor" />
                        <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                    </svg>
                </div>
                <div class="tcb-text">
                    Mettre du texte ici pour dispersion
                </div>
            </div>
            <div class="tour-content-block">
                <div class="tour-content-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-layers-icon lucide-layers">
                        <path
                            d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
                        <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
                        <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
                    </svg>
                </div>
                <div class="tcb-text">
                    Mettre du texte ici pour couches thématiques
                </div>
            </div>
            <div class="tour-content-block">
                <div class="tour-content-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-folder-open-icon lucide-folder-open">
                        <path
                            d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
                    </svg>
                </div>
                <div class="tcb-text">
                    Mettre du texte ici pour projets
                </div>
            </div>`,
        "content-justify": true,
        "position": "nav",
        "highlight": ".nav-col",
        "super-highlight": null,
        "activate": null,
        "special-step": null
    },
    2: {
        "icon": `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="lucide lucide-map-plus-icon lucide-map-plus">
                <path
                    d="m11 19-1.106-.552a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0l4.212 2.106a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619V12" />
                <path d="M15 5.764V12" />
                <path d="M18 15v6" />
                <path d="M21 18h-6" />
                <path d="M9 3.236v15" />
            </svg>`,
        "large": false,
        "title": "Visualisation cartographique",
        "content": `<div>Ajoutez des indicateurs sur la carte. Par exemple, cliquez sur le <span style="color:var(--primary);font-weight:600">+</span> suivant pour ajouter une couche sur la carte ou cliquez simplement sur "Suivant" et nous le ferons pour vous.</div>`,
        "content-justify": false,
        "position": "left-map-box",
        "highlight": ".map-box[data-nav='indicator']",
        "super-highlight": () => $('#indicatorList').children().first().find('.ind-plus-box'),
        "activate": ".nav-link[data-nav='indicator']"
    },
    3: {
        "icon": `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layers-icon lucide-layers"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>`,
        "large": false,
        "title": "Indicateurs actifs",
        "content": `<div>Les indicateurs ajoutés apparaitront dans la légende</div>`,
        "content-justify": false,
        "position": "leg",
        "highlight": ".legend",
        "super-highlight": null,
        "activate": null,
        "special-step": null
    },
    4: {
        "icon": `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                     class="lucide lucide-chart-line-icon lucide-chart-line">
                     <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                     <path d="m19 9-5 5-4-4-3 3" />
                 </svg>`,
        "large": false,
        "title": "Tendances",
        "content": `<div>Analysez l'évolution des indicateurs dans le temps selon les divisions géographiques.</div>
                <div>Choisissez d'abord le <strong>niveau géographique</strong> auquel vous souhaitez visualiser vos tendances.</div>
                <div>Choisissez ensuite l'<strong>indicateur de santé</strong>.</div>
                <div>Sélectionnez finalement une ou plusieurs <strong>divisions géographiques</strong> que vous souhaitez analyser.</div>`,
        "content-justify": false,
        "position": "left-map-box",
        "highlight": ".map-box[data-nav='tendency']",
        "super-highlight": null,
        "activate": ".nav-link[data-nav='tendency']",
        "special-step": () => {
            $('.legend').removeClass('open');
            queryLayerGroup.setVisible(false);
        }
    },
    5: {
        "icon": `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-chart-scatter-icon lucide-chart-scatter">
                    <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
                    <circle cx="18.5" cy="5.5" r=".5" fill="currentColor" />
                    <circle cx="11.5" cy="11.5" r=".5" fill="currentColor" />
                    <circle cx="7.5" cy="16.5" r=".5" fill="currentColor" />
                    <circle cx="17.5" cy="14.5" r=".5" fill="currentColor" />
                    <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                </svg>`,
        "large": false,
        "title": "Dispersion",
        "content": `Explorez la distribution et la dispersion des indicateurs à travers les territoires.`,
        "content-justify": false,
        "position": "left-map-box",
        "highlight": ".map-box[data-nav='dispersion']",
        "super-highlight": null,
        "activate": ".nav-link[data-nav='dispersion']",
        "special-step": null
    },
    6: {
        "icon": `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-layers-icon lucide-layers">
                    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
                    <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
                    <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
                </svg>`,
        "large": false,
        "title": "Couches thématiques",
        "content": `Ajoutez des couches thématiques supplémentaires pour enrichir votre analyse cartographique.`,
        "content-justify": false,
        "position": "left-map-box",
        "highlight": ".map-box[data-nav='layer']",
        "super-highlight": null,
        "activate": ".nav-link[data-nav='layer']",
        "special-step": null
    }, 
    7: {
        "icon": `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-folder-open-icon lucide-folder-open">
                    <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
                </svg>`,
        "large": false,
        "title": "Projets",
        "content": `Explorez les projets thématiques disponibles sur la plateforme GeoSanté.`,
        "content-justify": false,
        "position": "left-map-box",
        "highlight": ".map-box[data-nav='project']",
        "super-highlight": null,
        "activate": ".nav-link[data-nav='project']",
        "special-step": null
    }
}

const keys = Object.keys(MAIN_TOUR).map(Number);

const firstKey = Math.min(...keys);
const lastKey = Math.max(...keys);
console.log(firstKey, lastKey);

export function initTourStepContent(tourStep) {
    if (tourStep == lastKey + 1) {
        closeTour();
    } else{
        // Activate correct step
        setTourStep(tourStep);

        // Remove everything, before putting the correct things back
        document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
        document.querySelectorAll('.tour-super-highlight').forEach(el => el.classList.remove('tour-super-highlight'));
        $('.map-box').addClass('novis');
        $('#tourContent').removeClass('justify');
        $('.tour-modal').removeClass('large');
        $('.nav-link').removeClass('active');
        $('.tour-modal').removeClass(MAIN_TOUR_DICT[`pos${tourStep - 1}`]);
        $('.tour-modal').removeClass(MAIN_TOUR_DICT[`pos${tourStep + 1}`]);

        // We start activating everthing
        // Move to position
        $('.tour-modal').addClass(MAIN_TOUR[tourStep].position);
        // Change the icon
        $('.tour-modal-icon').html(MAIN_TOUR[tourStep].icon)
        // Make large if
        if (MAIN_TOUR[tourStep].large) {
            $('.tour-modal').addClass('large');
        }
        // Change title
        $('#tourTitle').html(MAIN_TOUR[tourStep].title);
        // Make justify if
        if (MAIN_TOUR[tourStep]["content-justify"]) {
            $('#tourContent').addClass('justify');
        }
        // Change content
        $('#tourContent').html(MAIN_TOUR[tourStep].content);
        // Highlight proper div
        if (MAIN_TOUR[tourStep].highlight.includes('map-box')) {
            $(`${MAIN_TOUR[tourStep].highlight}`).removeClass('novis');
        }
        $(`${MAIN_TOUR[tourStep].highlight}`).addClass('tour-highlight');
        // Super highlight if needed
        try{
            MAIN_TOUR[tourStep]["super-highlight"]().addClass('tour-super-highlight');
        } catch(err){}
        // Activate if needed
        $(`${MAIN_TOUR[tourStep].activate}`).addClass('active');
        // Special step if needed 
        // Super highlight if needed
        try{
            MAIN_TOUR[tourStep]["special-step"]();
        } catch(err){}

        if (tourStep == firstKey) {
            $('#tourPreviousBtn').addClass('hidden');
            $('#tourNextBtn').html('Démarrer');
        }
        else if (tourStep != firstKey && tourStep != lastKey) {
            $('#tourNextBtn').html('Suivant');
            $('#tourPreviousBtn').removeClass('hidden');
        }
        else if (tourStep == lastKey) {
            $('#tourNextBtn').html('Terminer');
        }
    }
}

$('#tourNextBtn').click(function () {
    currentTourStep += 1;
    if (currentTourStep == 3) {
        currentTourStep -= 1;
        passQueryIndicator('couthosp', ['couthosp.2022'], false);
        closeTour(false);
    } else {
        initTourStepContent(currentTourStep);
    }
})
$('#tourPreviousBtn').click(function () {
    currentTourStep -= 1;
    initTourStepContent(currentTourStep);
})