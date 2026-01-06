/**
 * project.js
 * -------------------------
 * Functions regarding project
 * 
 *
**/
import { addAlert } from "../utils.js";
import { createIndicatorList, passQueryIndicator } from "./map-indicators.js";
import { queryLayerGroup } from "../map-and-layers.js";
import { MAIN_URL } from "../global.js";

function waitForQueryToFinish(interval = 50) {
    return new Promise(resolve => {
        const check = () => {
            if (!isQueryInProgress) {
                resolve();
            } else {
                setTimeout(check, interval);
            }
        };
        check();
    });
}

function initProjectSidePanel(project_object){
    $('#prj-short-title').html(project_object['short-title']);
    $('#prj-short-title').removeClass();
    $('#prj-short-title').addClass('prj-badge');
    $('#prj-short-title').addClass(project_object['badge-type']);
    $('#prj-long-title').html(project_object['long-title']);
    $('#prj-long-description').html(project_object['long-description']);
    $('#prj-citation').html(`
        <a href="${project_object['publication']['DOI']}">
            ${project_object['publication']['citation']}
        </a>
    `);
}

export function initProjectList(){
    for (let project_el of all_projects) {
        let project_div = `
            <div class="project-box">
                <div class="ind-top-row">
                    <div class="ind-badge ${project_el['badge-type']}">${project_el['short-title']}</div>
                    <div class="you-are-here" data-id="${project_el['id']}">
                        <i class="fa-solid fa-location-dot"></i>
                        <span>Vous êtes ici</span>
                    </div>
                </div>
                <div class="ind-main-section">
                    <div class="ind-main-top">
                        <div class="ind-title">${project_el['long-title']}</div>
                        <div class="ind-subtitle">${project_el['long-description']}</div>
                    </div>
                    <div class="project-consult-btn hidden" data-id="${project_el['id']}">
                        <span>Consulter ce projet</span>
                        <i class="fa-solid fa-arrow-right-long"></i>
                    </div>
                </div>
            </div>`;
        $('#projectList').append(project_div);
    }
}

export async function initProject() {
    pageInit = false;
    $('.project-consult-btn').removeClass('hidden');
    $('.you-are-here').addClass('hidden');

    if (project != null) {
        let projectId = project['id']

        // Updates the project side-panel
        initProjectSidePanel(project);

        // Updates the projet-map-box
        $(`.project-consult-btn[data-id="${projectId}"]`).addClass('hidden');
        $(`.you-are-here[data-id="${projectId}"]`).removeClass('hidden');

        await waitForQueryToFinish();
        $('.legend').removeClass('open');
        $('.project-sp').addClass('open');
        document.querySelector('.map-box[data-nav="tendency"]').style.gridTemplateRows = "auto auto auto 1fr auto";
    } else {
        $('.project-sp').addClass('hidden');
        $('.project-sp-btn').addClass('hidden');

        // Updates the projet-map-box
        $('.project-consult-btn[data-id="999"]').addClass('hidden');
        $('.you-are-here[data-id="999"]').removeClass('hidden');
    }
}

function reinitProject(projectId) {
    addAlert('loading', 'Nous préparons votre projet');

    // Removes all layers from map
    $("#query-layers").empty();
    $("#thematic-layers").empty();
    queryLayerGroup.getLayers().clear();
    layersOnMap = [];

    $('.map-box').addClass('novis');
    $('.nav-link').removeClass('active');

    $('.project-consult-btn').removeClass('hidden');
    $('.you-are-here').addClass('hidden');

    // Let the browser render the loading alert first
    setTimeout( async () => {

        if (projectId == 999) {
            // Hides the project side-panel
            $('.project-sp').addClass('hidden');
            $('.project-sp-btn').addClass('hidden');

            // Change the CSS of tendency map-box
            document.querySelector('.map-box[data-nav="tendency"]')
                .style.gridTemplateRows = "auto auto 1fr 1fr auto";

            // Recreate indicator list
            await createIndicatorList();

            // Updates the URL
            let newUrl = `${MAIN_URL}?inds=+&base=satLayer`;
            window.history.replaceState(null, "", newUrl);

            // Update the project map-box
            $('.project-consult-btn[data-id="999"]').addClass('hidden');
            $('.you-are-here[data-id="999"]').removeClass('hidden');

            addAlert("success", "Préparation terminée");

        } else{
            project = all_projects.find(p => p.id === String(projectId));

            // Unhides and updates the project side-panel
            initProjectSidePanel(project);
            $('.project-sp').removeClass('hidden');
            $('.project-sp-btn').removeClass('hidden');

            // Reset the CSS
            document.querySelector('.map-box[data-nav="tendency"]')
                .style.gridTemplateRows = "auto auto auto 1fr auto";

            // Recreate indicator list
            await createIndicatorList(project.indicators);

            // Add the map-indicators of the project to map
            for (const element of project["indicators-on-map"]) {
                passQueryIndicator(element.split('.')[0], [element], true);
            }

            // Updates the URL
            let url_inds = project["indicators-on-map"].join("+") + "+";
            let newUrl = `${MAIN_URL}${projectId}/?inds=${url_inds}&base=satLayer`
            window.history.replaceState(null, "", newUrl);

            // Updates the projet-map-box
            $(`.project-consult-btn[data-id="${projectId}"]`).addClass('hidden');
            $(`.you-are-here[data-id="${projectId}"]`).removeClass('hidden');

            // Wait for the query to be finished and opens project side-panel
            await waitForQueryToFinish();
            $('.legend').removeClass('open');
            $('.project-sp').addClass('open');

            addAlert("success", "Préparation terminée");

        }
    }, 50);
}

$('.project-sp-btn').click(function (e) {
    e.stopPropagation();
    if ($('.project-sp').hasClass('open')) {
        $('.project-sp').removeClass('open');
        if (layersOnMap.length > 0) {
            $('.legend').addClass('open');
        }
    } else {
        $('.project-sp').addClass('open');
        if (layersOnMap.length > 0) {
            $('.legend').removeClass('open');
        }
    }
})
$('.project-sp').click(function (e) {
    e.stopPropagation();
})
$(document).on('click', '.project-consult-btn', function () {
    reinitProject($(this).data('id'))
});

