/**
File: script.js
GUI Assignment:  Homework 4 part 2
Sarah Toth, UML C.S., Sarah_Toth@student.uml.edu
Copyright (c) 2025 by Sarah.  All rights reserved.
Updated by ST on June 15, 2025 at 11:09 PM
**/

$(document).ready(function () {
    // ===== Slider setup: initialize sliders and link them to input fields =====
    const sliders = [
        { id: 'startRow', min: -1000, max: 1000 },
        { id: 'endRow', min: -1000, max: 1000 },
        { id: 'startCol', min: -1000, max: 1000 },
        { id: 'endCol', min: -1000, max: 1000 }
    ];

    sliders.forEach(({ id, min, max }) => {
        const $input = $('#' + id);
        const $slider = $('#slider-' + id);

        // Initialize jQuery UI slider
        $slider.slider({
            range: 'min', min, max, value: 0,
            slide: function (event, ui) {
                // Update input value when slider moves and trigger input event
                $input.val(ui.value).trigger('input');
            }
        });

        // When input changes, update slider position and live update the table
        $input.on('input change', function () {
            const val = parseInt(this.value);
            if (!isNaN(val)) $slider.slider('value', val);
            liveUpdateTable();
        });
    });

    // ===== Custom validation methods for form inputs =====
    $.validator.addMethod("startLessEqualEnd", function (value, element, params) {
        // Check that start value is less than or equal to end value
        const start = parseInt($(params[0]).val());
        const end = parseInt($(params[1]).val());
        return isNaN(start) || isNaN(end) || start <= end;
    }, "Start must be <= end");

    $.validator.addMethod("maxRangeSize", function (value, element, params) {
        // Check that range size does not exceed 100
        const start = parseInt($(params[0]).val());
        const end = parseInt($(params[1]).val());
        return isNaN(start) || isNaN(end) || (end - start <= 100);
    }, "Range must be 100 or less");

    // ===== Form validation setup =====
    const validator = $('#tableForm').validate({
        rules: {
            startRow: {
                required: true, number: true, range: [-1000, 1000],
                startLessEqualEnd: ['#startRow', '#endRow'],
                maxRangeSize: ['#startRow', '#endRow']
            },
            endRow: {
                required: true, number: true, range: [-1000, 1000],
                startLessEqualEnd: ['#startRow', '#endRow'],
                maxRangeSize: ['#startRow', '#endRow']
            },
            startCol: {
                required: true, number: true, range: [-1000, 1000],
                startLessEqualEnd: ['#startCol', '#endCol'],
                maxRangeSize: ['#startCol', '#endCol']
            },
            endCol: {
                required: true, number: true, range: [-1000, 1000],
                startLessEqualEnd: ['#startCol', '#endCol'],
                maxRangeSize: ['#startCol', '#endCol']
            }
        },
        errorElement: "div",
        errorClass: "error",
        errorPlacement: function (error, element) {
            // Place validation error messages directly after inputs
            error.insertAfter(element);
        },
        submitHandler: function (form, event) {
            // On valid submit, prevent form default and create a new tab
            event.preventDefault();
            createTab();

            // Activate the "livePreview" tab after tab creation
            const index = $("#tabs a[href='#livePreview']").parent().index();
            $("#tabs").tabs("option", "active", index);
        }
    });

    // ===== Add "Delete Selected Tabs" and "Delete All Tabs" buttons before the tabs =====
    $("#tabs").before(`
        <button id="deleteSelected">Delete Selected Tabs</button>
        <button id="deleteAll">Delete All Tabs</button>
    `);

    // ===== Initialize jQuery UI tabs and handle single tab close button (x) click =====
    $("#tabs").tabs().on("click", "span.ui-icon-close", function () {
        const panelId = $(this).closest("li").remove().attr("aria-controls");
        $("#" + panelId).remove();
        $("#tabs").tabs("refresh");
    });

    // ===== Handle delete selected tabs via checkboxes =====
    $(document).on("click", "#deleteSelected", function () {
        $("#tabs ul li").each(function () {
            if ($(this).find("input.tab-checkbox").prop("checked")) {
                const panelId = $(this).attr("aria-controls");
                $(this).remove();
                $("#" + panelId).remove();
            }
        });
        $("#tabs").tabs("refresh");
    });

    // ===== Handle delete all tabs except the live preview tab =====
    $(document).on("click", "#deleteAll", function () {
        $("#tabs ul li").each(function () {
            const panelId = $(this).attr("aria-controls");
            // Protect the livePreview tab from deletion
            if (panelId !== "livePreview") {
                $(this).remove();
                $("#" + panelId).remove();
            }
        });
        $("#tabs").tabs("refresh");
    });

    // ===== Live update the main preview table if inputs are valid =====
    function liveUpdateTable() {
        if ($("#tableForm").valid()) {
            generateTable("#livePreview");
        } else {
            $("#livePreview").empty();
        }
    }

    // ===== Create a new tab with the current input ranges and generate its multiplication table =====
    function createTab() {
        const startRow = $("#startRow").val();
        const endRow = $("#endRow").val();
        const startCol = $("#startCol").val();
        const endCol = $("#endCol").val();
        const label = `(${startRow},${endRow}) x (${startCol},${endCol})`;
        const id = "tab-" + Date.now();

        // Add new tab list item with checkbox and close icon
        $("#tabs ul").append(
            `<li aria-controls="${id}"><input type='checkbox' class='tab-checkbox' /> <a href="#${id}">${label}</a> <span class='ui-icon ui-icon-close' role='presentation'></span></li>`
        );

        // Add the content div for the new tab
        $("#tabs").append(`<div id="${id}" class="tab-content"></div>`);
        $("#tabs").tabs("refresh");

        // Generate the multiplication table inside the new tab
        generateTable("#" + id);
    }

    // ===== Generate multiplication table based on input ranges and insert into specified selector =====
    function generateTable(selector) {
        const startRow = parseInt($("#startRow").val());
        const endRow = parseInt($("#endRow").val());
        const startCol = parseInt($("#startCol").val());
        const endCol = parseInt($("#endCol").val());

        if ([startRow, endRow, startCol, endCol].some(isNaN)) return;

        const table = $("<table></table>");
        const thead = $("<thead><tr><th></th></tr></thead>");
        const tbody = $("<tbody></tbody>");

        // Build table header row
        for (let c = startCol; c <= endCol; c++) {
            thead.find("tr").append(`<th>${c}</th>`);
        }

        // Build table body rows
        for (let r = startRow; r <= endRow; r++) {
            const row = $("<tr></tr>").append(`<th>${r}</th>`);
            for (let c = startCol; c <= endCol; c++) {
                row.append(`<td>${r * c}</td>`);
            }
            tbody.append(row);
        }

        table.append(thead).append(tbody);

        // Wrap the table in a div for horizontal scrolling if table is too wide
        const wrapper = $('<div class="table-wrapper"></div>').append(table);

        // Insert the wrapped table into the target container
        $(selector).html(wrapper);
    }
});