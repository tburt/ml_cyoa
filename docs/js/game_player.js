'use strict';

class CYOAPlayer {
    constructor(container_div, hide_choices_prompt) {
        this.container = container_div;
        this.hide_choices_prompt = hide_choices_prompt;
        this.hide_entry_ids = true;
        this.game = null
    }

    remove_from_document() {
        if (this.area_container != null) {
            this.area_container.remove();
            this.area_container = null;
        }
    }

    generate_containers() {
        this.area_container = $('<div class="game_container">');
        const num_entries = $('<div class="game_num_entries">');
        num_entries.text(`${Object.keys(this.game.entries).length} PAGES`);
        this.play_button = $('<div class="game_play_button">');
        this.play_button.text('PLAY GAME')
        this.entries_container = $('<div>');

        const this_player = this;
        this.play_button.on('click', function () {
            this_player.entries_container.empty();
            this_player.play_button.text('RESTART GAME')
            this_player.begin_game();
        });

        this.area_container.append(this.play_button);
        this.area_container.append(num_entries);
        this.area_container.append(this.entries_container);

        this.raw_button = $('<div class="game_raw_button">');
        this.raw_button.text('VIEW RAW ML OUTPUT (SPOILERS)');

        const raw_button_action = function () {
            this_player.raw_button.text("HIDE RAW OUTPUT");
            this_player.raw_button.unbind('click');
            this_player.raw_button.on('click', function () {
                this_player.raw_output.remove();
                this_player.raw_button.text('VIEW RAW ML OUTPUT (SPOILERS)');
                this_player.raw_button.unbind('click');
                this_player.raw_button.on("click", raw_button_action);
            });

            this_player.raw_output = $('<div class="raw_output">');
            const rows = [];
            for (const entry_id of Object.keys(this_player.game.entries)) {
                const entry = this_player.game.entries[entry_id];
                const this_row = [entry_id, entry.title, entry.content]
                if (entry.choices.length > 0) {
                    this_row.push(entry.choices[0].content);
                    this_row.push(entry.choices[0].entry_id);
                }
                else {
                    this_row.push("");
                    this_row.push("");
                }
                if (entry.choices.length > 1) {
                    this_row.push(entry.choices[1].content);
                    this_row.push(entry.choices[1].entry_id);
                }
                else {
                    this_row.push("");
                    this_row.push("");
                }
                if (entry.choices.length > 2) {
                    this_row.push(entry.choices[2].content);
                    this_row.push(entry.choices[2].entry_id);
                }
                else {
                    this_row.push("");
                    this_row.push("");
                }
                rows.push(this_row);
            }
            this_player.raw_output.hide();
            console.log(rows);
            this_player.raw_output.append(createTable(rows));
            this_player.area_container.append(this_player.raw_output);
            this_player.raw_output.slideDown(400);
        };
        this.raw_button.on('click', raw_button_action);
        this.area_container.append(this.raw_button);

        this.container.append(this.area_container);

        this.play_button[0].click();
    }

    set_game(json_game) {
        this.game = json_game
        this.remove_from_document()
        this.generate_containers()
    }

    begin_game() {
        if (this.game != null) {
            // if ("title" in this.game) {
            //     var game_title = $('<h2 class="game_title">');
            //     game_title.text(this.game.title);
            //     this.area_container.append(game_title);
            // }

            // if ("date" in this.game) {
            //     var game_desc = $('<div class="game_date">');
            //     game_desc.text(this.game.date);
            //     this.area_container.append(game_desc);
            // }

            // if ("description" in this.game) {
            //     var game_desc = $('<div class="game_description">');
            //     game_desc.text(this.game.description);
            //     this.area_container.append(game_desc);
            // }

            this.print_entry(this.game.start_entry_id);
        }
    }

    print_entry(entry_id) {
        var entry_div = $('<div class="entry">');

        var entry_data = this.game.entries[entry_id];

        if (!this.hide_entry_ids) {
            var entry_id_display = $('<div class="entry_id">');
            entry_id_display.text(entry_id);
            entry_div.append(entry_id_display);
        }

        if (entry_data.title != null) {
            var entry_title = $('<h2 class="entry_title">');
            entry_title.text(entry_data.title);
            entry_div.append(entry_title);
        }

        var entry_content = $('<div class="entry_content">');
        entry_content.html(entry_data.content.replace(/\n/g, '<br>'));
        entry_div.append(entry_content);

        const this_entry = this;

        if (entry_data.choices.length > 0 && !this.hide_choices_prompt) {
            var actions_text = $('<div class="entry_actions_text">');
            actions_text.text("Choices:");
            entry_div.append(actions_text);
        }

        const this_entry_div = entry_div[0];
        for (const choice of entry_data.choices) {
            var entry_choice = $('<div class="entry_action">');
            entry_choice.on('click', function () {
                removeSiblingsAfterl(this_entry_div);
                this_entry.print_entry(choice.entry_id);
            });

            if (!this.hide_entry_ids) {
                entry_choice.text(choice.content + " [" + choice.entry_id + "]");
            }
            else {
                entry_choice.text(choice.content);
            }
            
            entry_div.append(entry_choice);
        }

        if (entry_data.choices.length == 0) {
            var end_game = $('<div class="end_of_game">');
            end_game.text("END OF GAME");
            entry_div.append(end_game);
        }

        entry_div.hide();
        this.entries_container.append(entry_div);
        entry_div.slideDown(400);
    }
}

function trimAny(str, chars) {
    var start = 0,
        end = str.length;

    while (start < end && chars.indexOf(str[start]) >= 0)
        ++start;

    while (end > start && chars.indexOf(str[end - 1]) >= 0)
        --end;

    return (start > 0 || end < str.length) ? str.substring(start, end) : str;
}

function isStringNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseInt(str)) // ...and ensure strings of whitespace fail
}

function removeSiblingsAfterl(dd) {
    var ns;
    while (ns = dd.nextSibling)
        dd.parentNode.removeChild(ns);
}

function parse_text_game(text_game) {
    console.log(text_game)
    const rows = []
    const lines = text_game.split('^');
    for (const line of lines) {
        // console.log(trimAny(line," |"));
        const parts = trimAny(line, " |").split("|");
        // console.log(parts);
        if (parts.length > 0) {
            rows.push(parts)
        }
    }
    // console.log(rows);
    // return null;
    const entries = {}
    var first = null;
    for (const row of rows) {
        const entry = {}
        if (row.length > 1) {
            entry.title = row[1];
        }
        if (row.length > 2) {
            entry.content = row[2];
        }
        const choices = []
        if (row.length > 4) {
            const choice = {}
            choice.content = row[3];
            choice.entry_id = row[4];

            if (isStringNumeric(choice.entry_id)) {
                choices.push(choice);
            }
        }
        if (row.length > 6) {
            const choice = {}
            choice.content = row[5];
            choice.entry_id = row[6];
            if (isStringNumeric(choice.entry_id)) {
                choices.push(choice);
            }
        }
        if (row.length > 8) {
            const choice = {}
            choice.content = row[7];
            choice.entry_id = row[8];
            if (isStringNumeric(choice.entry_id)) {
                choices.push(choice);
            }
        }
        entry.choices = choices
        entries[row[0]] = entry
        if (first == null) {
            first = row[0];
        }
    }
    console.log(entries);
    return {
        "entries": entries,
        "start_entry_id": first
    };
}

function createTable(tableData) {
    var table = document.createElement('table');
    var tableBody = document.createElement('tbody');

    tableData.forEach(function (rowData) {
        var row = document.createElement('tr');

        rowData.forEach(function (cellData) {
            var cell = document.createElement('td');
            cell.appendChild(document.createTextNode(cellData));
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });

    table.appendChild(tableBody);
    return table;
}

// $(document).ready(function () {
//     game = new CYOAPlayer($("#content"));
//     console.log(game.container);
//     const urlSearchParams = new URLSearchParams(window.location.search);
//     const params = Object.fromEntries(urlSearchParams.entries());
//     console.debug(params);

//     // game.set_game(
//     //     {
//     //         "title" : "A Test Game",
//     //         "description" : "Is boring",
//     //         "date" : "10th of wank",
//     //         "entries" : {
//     //             "1" : {
//     //                 "title" :"Intro",
//     //                 "content" :"First page",
//     //                 "actions" : [
//     //                     {
//     //                         "content" : "to win",
//     //                         "entry_id" : "2"
//     //                     },
//     //                     {
//     //                         "content" : "to lose",
//     //                         "entry_id" : "3"
//     //                     }
//     //                 ]
//     //             },
//     //             "2" : {
//     //                 "title" :"Win Page",
//     //                 "content" :"Blah page win",
//     //                 "actions" : [
//     //                 ]
//     //             },
//     //             "3" : {
//     //                 "title" :"Lose Page",
//     //                 "content" :"Blah page lose",
//     //                 "actions" : [
//     //                 ]
//     //             }
//     //         }
//     //     }

//     // );
//     game.set_game(parse_text_game(john_wanknot_2));
// });
