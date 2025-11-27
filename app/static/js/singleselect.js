function initSelect() {
    $('.dropdown-button').click(function (e) {
        e.stopPropagation(); // Prevent click from bubbling up

        const dropdown = $(this).closest('.dropdown');
        const content = dropdown.find('.dropdown-content');
        const chevron = dropdown.find('.chevron-toggle');

        // Toggle only this dropdown
        const isOpen = content.hasClass('show');
        $('.dropdown-content').removeClass('show');
        $('.chevron-toggle').removeClass('show');

        if (!isOpen) {
            content.addClass('show');
            chevron.addClass('show');
        }
    });

    // Generic handler for any dropdown radio change
    $('.dropdown-content input[type="radio"]').on('change', function () {
        const dropdown = $(this).closest('.dropdown');
        const selectedOption = dropdown.find('input[type="radio"]:checked');
        const label = selectedOption.data('name') || 'Sélectionner';

        dropdown.find('.dropdown-button span').text(label);
        dropdown.find('.dropdown-content').removeClass('show');
        dropdown.find('.chevron-toggle').removeClass('show');
    });

    // Prevent clicks inside dropdown from closing it
    $('.dropdown-content').click(function (event) {
        event.stopPropagation();
    });

    // Close all dropdowns on outside click
    $(document).on('click', function () {
        $('.dropdown-content').removeClass('show');
        $('.chevron-toggle').removeClass('show');
    });

    // Listen for change on all radios with name="year-sel"
    document.querySelectorAll('input[name="year-sel"]').forEach(input => {
        input.addEventListener('change', event => {
            selected_year = event.target.value;
        });
    });

    document.querySelectorAll('input[name="ts1-year-sel"]').forEach(input => {
        input.addEventListener('change', event => {
            selected_year_ts1 = event.target.value;
        });
    });

    document.querySelectorAll('input[name="ts2-year-sel"]').forEach(input => {
        input.addEventListener('change', event => {
            selected_year_ts2 = event.target.value;
        });
    });
}