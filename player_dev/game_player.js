'use strict';

class CYOAPlayer {
    constructor(container_div) {
        this.container = container_div;
        this.game = null
        this.generate_containers()
    }

    remove_from_document() {
        this.area_container.remove();
    }

    generate_containers() {
        this.area_container = $('<div class="game_container">');
        this.container.append(this.area_container);
    }

    set_game(json_game) {
        this.game = json_game
        this.remove_from_document()
        this.generate_containers()
        this.begin_game()
    }

    begin_game() {
        if (this.game != null) {
            if ("title" in this.game) {
                var game_title = $('<div class="game_title">');
                game_title.text(this.game.title);
                this.area_container.append(game_title);
            }

            if ("date" in this.game) {
                var game_desc = $('<div class="game_date">');
                game_desc.text(this.game.date);
                this.area_container.append(game_desc);
            }

            if ("description" in this.game) {
                var game_desc = $('<div class="game_description">');
                game_desc.text(this.game.description);
                this.area_container.append(game_desc);
            }

            this.print_entry("1")
        }
    }

    print_entry(entry_id) {
        var entry_div = $('<div class="entry">');

        var entry_data = this.game.entries[entry_id];

        var entry_id_display = $('<div class="entry_id">');
        entry_id_display.text(entry_id);
        entry_div.append(entry_id_display);

        var entry_title = $('<div class="entry_title">');
        entry_title.text(entry_data.title);
        entry_div.append(entry_title);

        var entry_content = $('<div class="entry_content">');
        entry_content.text(entry_data.content);
        entry_div.append(entry_content);

        const this_entry = this;

        if (entry_data.actions.length > 0) {
            var actions_text = $('<div class="entry_actions_text">');
            actions_text.text("You may:");
            entry_div.append(actions_text);
        }
        for (const action of entry_data.actions) { 
            var entry_action = $('<div class="entry_action">');
            entry_action.on('click', function(){ 
                this_entry.print_entry(action.entry_id);
            });
            entry_action.text(action.content + " ["+ action.entry_id +"]");
            entry_div.append(entry_action);
        }

        this.area_container.append(entry_div);
    }
}

function trimAny(str, chars) {
    var start = 0, 
        end = str.length;

    while(start < end && chars.indexOf(str[start]) >= 0)
        ++start;

    while(end > start && chars.indexOf(str[end - 1]) >= 0)
        --end;

    return (start > 0 || end < str.length) ? str.substring(start, end) : str;
}

function parse_text_game(text_game) {
    const rows = []
    const lines = text_game.split('\n');
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
    for (const row of rows) {
        const entry = {}
        if (row.length > 1) {
            entry.title = row[1];
        }
        if (row.length > 2) {
            entry.content = row[2];
        }
        const actions = []
        if (row.length > 4) {
            const action = {}
            action.content = row[3];
            action.entry_id = row[4];
            actions.push(action);
        }
        if (row.length > 6) {
            const action = {}
            action.content = row[5];
            action.entry_id = row[6];
            actions.push(action);
        }
        if (row.length > 8) {
            const action = {}
            action.content = row[7];
            action.entry_id = row[8];
            actions.push(action);
        }
        entry.actions = actions
        entries[row[0]] = entry
    }
    game = {
        "game_description":"Unknown",
        "game_title":"Unknown",
        "game_date":"Unknown",
        "entries":entries
    }
    console.log(game);
    return game;
}


const dept_store_game = "|1|The Department Store|You are in a large department store. You see aisles and aisles of merchandise as well as a few people milling about. You also see a large desk near the entrance.|Examine the desk|2|Examine the merchandise|3|Talk to a person|4|\n" +
"|2|The Desk|You approach the desk and see that it is empty. You also see a sign that reads \"Information\".|Examine the sign|5|Leave|1|\n" +
"|3|The Merchandise|You approach one of the aisles and see that it is full of clothes. You also see a few people browsing the racks.|Examine the clothes|6|Talk to a person|7|Leave|1|\n" +
"|4|The People|You approach a group of people and see that they are talking to each other. You also see a few people walking by.|Join the conversation|8|Walk away|1|\n" +
"|5|The Sign|You examine the sign and see that it has a phone number on it.|Call the number|9|Leave|1|\n" +
"|6|The Clothes|You examine the clothes and see that they are all new. You also see a few people browsing the racks.|Try on a shirt|10|Leave|3|\n" +
"|7|The People|You approach a group of people and see that they are talking to each other. You also see a few people walking by.|Join the conversation|11|Walk away|3|\n" +
"|8|The Conversation|You join the conversation and see that it is about the new clothes that just arrived. You also see a few people walking by.|Leave|4|\n" +
"|9|The Phone Number|You call the number and see that it is a recording. You also see a few people walking by.|Leave|5|\n" +
"|10|The Shirt|You try on the shirt and see that it is too small. You also see a few people walking by.|Leave|6|\n" +
"|11|The Conversation|You join the conversation and see that it is about the new clothes that just arrived. You also see a few people walking by.|Leave|7|\n";

const sandwich_game = "|1|The Sandwich Shop|You're in a sandwich shop. You see a sandwich on the counter.|Pick up the sandwich.|2|Leave the sandwich.|3|\n" +
"|2|The Sandwich Shop - With Sandwich|You're in a sandwich shop. You have a sandwich in your hand.|Take a bite of the sandwich.|4|Put the sandwich down.|5|\n" +
"|3|The Sandwich Shop - Without Sandwich|You're in a sandwich shop. You see a sandwich on the counter.|Pick up the sandwich.|2|Leave the sandwich.|3|\n" +
"|4|The Sandwich Shop - Tasty Sandwich|You're in a sandwich shop. You have a sandwich in your hand. It's a really good sandwich. You're full.|Put the sandwich down.|5|\n" +
"|5|The Sandwich Shop - Bored Now|You're in a sandwich shop. You see a sandwich on the counter.|Pick up the sandwich.|2|Leave the sandwich.|3|";

const chocolate_game = "|1|The Chocolate Factory|You find yourself in a chocolate factory. You see a chocolate river and a conveyor belt with chocolate bars on it. You also see a sign that says \"Do not touch the chocolate.\" What do you do?|Investigate the conveyor belt|2|Investigate the chocolate river|3|Read the sign|4|\n" +
"|2|The Conveyor Belt|You walk over to the conveyor belt and see that the chocolate bars are moving. You also see a sign that says \"Do not touch the chocolate.\" What do you do?|Investigate the chocolate bars|5|Read the sign|4|\n" +
"|3|The Chocolate River|You walk over to the chocolate river and see that it is flowing. You also see a sign that says \"Do not touch the chocolate.\" What do you do?|Investigate the chocolate river|6|Read the sign|4|\n" +
"|4|The Sign|You walk over to the sign and read it. It says \"Do not touch the chocolate.\" What do you do?|Go back to the conveyor belt|2|Go back to the chocolate river|3|\n" +
"|5|The Chocolate Bars|You walk over to the chocolate bars and see that they are moving. You also see a sign that says \"Do not touch the chocolate.\" What do you do?|Touch the chocolate|7|Read the sign|4|\n" +
"|6|The Chocolate River|You walk over to the chocolate river and see that it is flowing. You also see a sign that says \"Do not touch the chocolate.\" What do you do?|Touch the chocolate|8|Read the sign|4|\n" +
"|7|You Win!|You touch the chocolate and a door opens. You walk through the door and find yourself in a room full of chocolate. You eat some chocolate and then leave the room.|\n" +
"|8|You Lose!|You touch the chocolate and a door opens. You walk through the door and find yourself in a room full of chocolate. You eat some chocolate and then you are sick.";
const sandwich_game_2 = "|1|The Sandwich Shop|You're in a sandwich shop. It smells amazing in here. You see a counter with a register and a line of people waiting to order. You also see a few tables with people eating. What do you do?|Order a sandwich|2|Sit down and eat|3|Leave the shop|4|\n" +
"|2|Ordering a Sandwich|You walk up to the counter and see a menu. You can order a sandwich, a salad, or soup. What do you do?|Order a sandwich|5|Order a salad|6|Order soup|7|\n" +
"|3|Eating a Sandwich|You sit down at a table and start to eat your sandwich. It's really good. You notice that somebody left their phone on the table. What do you do?|Pick up the phone and look at it|8|Ignore the phone and keep eating|9|\n" +
"|4|Leaving the Sandwich Shop|You decide to leave the sandwich shop. As you're walking out, you see a homeless person begging for money. What do you do?|Give the homeless person some money|10|Ignore the homeless person and keep walking|11|\n" +
"|5|Your Sandwich|You order a sandwich and pay for it. The sandwich is really good. You notice that somebody left their phone on the table. What do you do?|Pick up the phone and look at it|8|Ignore the phone and keep eating|9|\n" +
"|6|Your Salad|You order a salad and pay for it. The salad is really good. You notice that somebody left their phone on the table. What do you do?|Pick up the phone and look at it|8|Ignore the phone and keep eating|9|\n" +
"|7|Your Soup|You order soup and pay for it. The soup is really good. You notice that somebody left their phone on the table. What do you do?|Pick up the phone and look at it|8|Ignore the phone and keep eating|9|\n" +
"|8|Looking at the Phone|You pick up the phone and look at it. The screen is locked. What do you do?|Try to unlock the phone|12|Put the phone back on the table|9|\n" +
"|9|Finishing Your Meal|You finish your meal and leave the sandwich shop. As you're walking out, you see a homeless person begging for money. What do you do?|Give the homeless person some money|10|Ignore the homeless person and keep walking|11|\n" +
"|10|Giving Money to the Homeless Person|You give the homeless person some money. They say thank you and wish you a good day. You continue walking and see a manhole cover in the sidewalk. What do you do?|Lift the manhole cover|13|Walk around the manhole cover|14|\n" +
"|11|Ignoring the Homeless Person|You ignore the homeless person and keep walking. You see a manhole cover in the sidewalk. What do you do?|Lift the manhole cover|13|Walk around the manhole cover|14|\n" +
"|12|Unlocking the Phone|You try to unlock the phone, but you can't figure it out. You put the phone back on the table and leave the sandwich shop. As you're walking out, you see a homeless person begging for money. What do you do?|Give the homeless person some money|10|Ignore the homeless person and keep walking|11|\n" +
"|13|Lifting the Manhole Cover|You lift the manhole cover and jump into the sewer. You land in a pool of sewage and die.|-|-|-|\n" +
"|14|Walking around the Manhole Cover|You walk around the manhole cover and continue down the street. You see a cat in a tree. What do you do?|Climb the tree and rescue the cat|15|Ignore the cat and keep walking|16|\n" +
"|15|Rescuing the Cat|You climb the tree and rescue the cat. The cat is very grateful and follows you home. You win!|-|-|-|\n" +
"|16|Ignoring the Cat|You ignore the cat and keep walking. You see a manhole cover in the sidewalk. What do you do?|Lift the manhole cover|13|Walk around the manhole cover|14|";

const fruit_game = "|1|The Fruit Warehouse|You find yourself in a huge fruit warehouse. Rows upon rows of shelves stretch out in every direction, filled with all kinds of fruit. You see a ladder leading up to a loft. What do you do?|Climb the ladder|2|Explore the warehouse|3|Leave the warehouse|4|\n" +
"|2|The Loft|You climb the ladder and find yourself in a loft overlooking the warehouse. You see a door leading out to the roof. What do you do?|Go out onto the roof|5|Explore the loft|6|Go back down the ladder|1|\n" +
"|3|Exploring the Warehouse|You start walking down one of the rows of shelves, looking at all the different kinds of fruit. Suddenly, you hear a noise coming from the other end of the row. What do you do?|Hide behind a shelf|7|Investigate the noise|8|Run away|9|\n" +
"|4|Leaving the Warehouse|You walk to the door and find that it's locked. You try rattling the handle, but it's no use. It looks like you're stuck here.|-|-|-|\n" +
"|5|The Roof|You step out onto the roof and find yourself surrounded by a sea of fruit. You see a helicopter landing in the distance. What do you do?|Wave your arms to signal the helicopter|10|Jump into the fruit|11|Go back inside|2|\n" +
"|6|Exploring the Loft|You start looking around the loft and find a trapdoor in the floor. What do you do?|Open the trapdoor|12| ignore the trapdoor|-|\n" +
"|7|Hiding Behind a Shelf|You hide behind a shelf and wait to see what made the noise. After a few moments, a man walks around the corner. He doesn't see you. What do you do?|Call out to the man|13|Wait for him to leave|14|Attack the man|15|\n" +
"|8|Investigating the Noise|You start walking towards the noise. As you get closer, you see that it's coming from a large cage. Inside the cage is a tiger. What do you do?|Try to open the cage|16|Talk to the tiger|17|Run away|18|\n" +
"|9|Running Away|You start running away from the noise. You run down one aisle, then another, but you can't shake the feeling that someone is following you. Suddenly, you hear a voice behind you. \"Stop right there!\" it says. What do you do?|Stop and turn around|19|Keep running|20|\n" +
"|10|Signaling the Helicopter|You wave your arms and yell, but the helicopter doesn't seem to see you. It's getting closer and closer. What do you do?|Jump into the fruit|21|Climb onto the helicopter|22|\n" +
"|11|Jumping into the Fruit|You jump into the fruit and start sinking. You try to swim to the surface, but the fruit is too dense. You start to feel yourself running out of air.|-|-|-|\n" +
"|12|Opening the Trapdoor|You open the trapdoor and find a ladder leading down into darkness. What do you do?|Climb down the ladder|23|Close the trapdoor|6|\n" +
"|13|Calling out to the Man|You call out to the man, but he doesn't hear you. He's getting closer and closer. What do you do?|Jump out and surprise him|24|Wait for him to leave|14|\n" +
"|14|Waiting for the Man to Leave|You wait for the man to leave, but he doesn't. He's just standing there, looking around. What do you do?|Attack the man|15|Wait for him to leave|14|\n" +
"|15|Attacking the Man|You jump out and attack the man. He's too strong for you and he easily overpowers you.|-|-|-|\n" +
"|16|Trying to Open the Cage|You try to open the cage, but it's locked. You rattle the door, but it's no use. What do you do?|Talk to the tiger|25|Give up and walk away|18|\n" +
"|17|Talking to the Tiger|You start talking to the tiger. He seems friendly enough. After a while, he starts to pace back and forth in his cage. What do you do?|Try to open the cage|16|Give up and walk away|18|\n" +
"|18|Walking Away|You turn and walk away from the cage. You hear the tiger start to pace back and forth. What do you do?|Try to open the cage|16|Give up and walk away|18|\n" +
"|19|Stopping and Turning Around|You stop and turn around. You see the man who was following you. He's holding a gun. What do you do?|Raise your hands and surrender|20|Run away|20|\n" +
"|20|Running Away|You start running away from the man with the gun. You run down one aisle, then another, but you can't shake the feeling that he's still following you. Suddenly, you hear a gunshot. What do you do?|-|-|-|\n" +
"|21|Jumping into the Fruit|You jump into the fruit and start sinking. You try to swim to the surface, but the fruit is too dense. You start to feel yourself running out of air.|-|-|-|\n" +
"|22|Climbing onto the Helicopter|You climb onto the helicopter and find yourself surrounded by crates of fruit. The helicopter takes off and you're free!|-|-|-|\n" +
"|23|Climbing Down the Ladder|You start climbing down the ladder. You climb and climb, but it seems like it's never going to end. Suddenly, you hear someone coming down the ladder behind you. What do you do?|Climb faster|26|Wait for the person to catch up|27|\n" +
"|24|Jumping out and Surprising the Man|You jump out and surprise the man. He's so startled that he drops his gun. What do you do?|Pick up the gun and shoot the man|28|Run away|29|\n" +
"|25|Talking to the Tiger|You start talking to the tiger. He seems friendly enough. After a while, he starts to pace back and forth in his cage. What do you do?|Try to open the cage|16|Give up and walk away|18|\n" +
"|26|Climbing Faster|You start climbing faster, but your hands are getting tired. You can hear the person behind you getting closer and closer. Suddenly, you feel a hand on your foot. What do you do?|Kick the person|30|Climb even faster|31|\n" +
"|27|Waiting for the Person to Catch Up|You wait for the person to catch up. It's taking too long. You can hear them getting closer and closer. Suddenly, you feel a hand on your foot. What do you do?|Kick the person|30|Climb even faster|31|\n" +
"|28|Picking up the Gun and Shooting the Man|You pick up the gun and shoot the man. He falls to the ground, dead. What do you do?|Run away|29|Stay and wait for the police|32|\n" +
"|29|Running Away|You start running away from the man with the gun. You run down one aisle, then another, but you can't shake the feeling that he's still following you. Suddenly, you hear a gunshot. You are dead.\n" +
"|30|Kicking the Person|You kick the person and they fall off the ladder. You keep climbing until you reach the top. You find yourself in a small room. What do you do?|Look for a way out|33|Go back down the ladder|23|\n" +
"|31|Climbing Even Faster|You start climbing even faster, but your hands are getting tired. You can hear the person behind you getting closer and closer. Suddenly, you feel a hand on your foot. What do you do?|Kick the person|30|Climb even faster|31|\n" +
"|32|Staying and Waiting for the Police|You stay and wait for the police. They arrive and arrest you.|-|-|-|\n" +
"|33|Looking for a Way Out|You start looking for a way out of the room. You find a door leading outside. You're free!|-|-|-|";
var shitulator_game = "|1|The park entrance|You walk through the gates of the park. You see a map of the park. To your left is a row of fast food restaurants and to your right is the Shitulator. In front of you is a long queue.|Go to the Shitulator|2|Get some food|3|Look at the map|4|\n" +
"|2|The Shitulator queue|You join the queue for the Shitulator. You wait in line for a while. The queue moves slowly. You begin to feel impatient.|Wait in line|5|Leave the queue|6|\n" +
"|3|Fast food restaurants|You walk to the fast food restaurants. You see a McDonalds, a Burger King and a KFC.|Go to McDonalds|7|Go to Burger King|8|Go to KFC|9|\n" +
"|4|The map|You look at the map. You see that the Shitulator is in the middle of the park. You also see that there is a shortcut to the Shitulator. The shortcut goes through the gift shop.|Take the shortcut|10|\n" +
"|5|The Shitulator queue|You wait in line for a while. The queue moves slowly. You begin to feel impatient.|Wait in line|11|Leave the queue|12|\n" +
"|6|The park entrance|You walk out of the park.|Leave the park|13|\n" +
"|7|McDonalds|You buy a McDonalds meal. You eat your meal. You feel sick.|Leave McDonalds|14|\n" +
"|8|Burger King|You buy a Burger King meal. You eat your meal. You feel sick.|Leave Burger King|15|\n" +
"|9|KFC|You buy a KFC meal. You eat your meal. You feel sick.|Leave KFC|16|\n" +
"|10|The gift shop|You walk to the gift shop. You see a shirt that you like. You buy the shirt. You put on the shirt. You walk to the Shitulator.|Go to the Shitulator|17|\n" +
"|11|The Shitulator queue|You wait in line for a while. The queue moves slowly. You begin to feel impatient.|Wait in line|18|Leave the queue|19|\n" +
"|12|The park entrance|You walk out of the park.|Leave the park|20|\n" +
"|13|Outside the park|You walk home.|-||\n" +
"|14|Outside the park|You walk home.|-||\n" +
"|15|Outside the park|You walk home.|-||\n" +
"|16|Outside the park|You walk home.|-||\n" +
"|17|The Shitulator|You get on the Shitulator. You ride the Shitulator. You vomit.|-||\n" +
"|18|The Shitulator queue|You wait in line for a while. The queue moves slowly. You begin to feel impatient.|Wait in line|21|Leave the queue|22|\n" +
"|19|The park entrance|You walk out of the park.|Leave the park|23|\n" +
"|20|Outside the park|You walk home.|-||\n" +
"|21|The Shitulator queue|You wait in line for a while. The queue moves slowly. You begin to feel impatient.|Wait in line|24|Leave the queue|25|\n" +
"|22|The park entrance|You walk out of the park.|Leave the park|26|\n" +
"|23|Outside the park|You walk home.|-||\n" +
"|24|The Shitulator queue|You wait in line for a while. The queue moves slowly. You begin to feel impatient.|Wait in line|27|Leave the queue|28|\n" +
"|25|The park entrance|You walk out of the park.|Leave the park|29|\n" +
"|26|Outside the park|You walk home.|-||\n" +
"|27|The Shitulator queue|You wait in line for a while. The queue moves slowly. You begin to feel impatient.|Wait in line|30|Leave the queue|31|\n" +
"|28|The park entrance|You walk out of the park.|Leave the park|32|\n" +
"|29|Outside the park|You walk home.|-||\n" +
"|30|The Shitulator queue|You wait in line for a while. The queue moves slowly. You begin to feel impatient.|Wait in line|33|Leave the queue|34|\n" +
"|31|The park entrance|You walk out of the park.|Leave the park|35|\n" +
"|32|Outside the park|You walk home.|-||\n" +
"|33|The Shitulator queue|You wait in line for a while. The queue moves slowly. You begin to feel impatient.|Wait in line|36|Leave the queue|37|\n" +
"|34|The park entrance|You walk out of the park.|Leave the park|38|\n" +
"|35|Outside the park|You walk home.|-||\n" +
"|36|The Shitulator queue|You wait in line for a while. The queue moves slowly. The queue moves slowly. You begin to feel impatient. You vomit.|-||\n" +
"|37|The park entrance|You walk out of the park.|Leave the park|39|\n" +
"|38|Outside the park|You walk home.|-||\n" +
"|39|Outside the park|You walk home.|-||";

var lionel_richie_game_1 = "|1|The Street|You are standing outside the shop. You have been looking for the new Lionel Richie CD all day, but every shop seems to be sold out. You check your watch. It is getting late and the shops will be closing soon. You need to find the CD before the shops close for the evening. What do you do?|Go into the shop|2|Check other shops|3|Go home|4|\n" +
"|2|The Shop|You walk into the shop and head for the music section. The CD is not on the shelves. You ask the shop assistant if they have any in stock. They say they are all sold out. What do you do?|Leave the shop|1|Search the shelves|2|\n" +
"|3|The Street|You check the other shops but they are all sold out. You check your watch. It is getting late and the shops will be closing soon. You need to find the CD before the shops close for the evening. What do you do?|Go into the shop|2|Check other shops|3|Go home|4|\n" +
"|4|Your House|You go home and search for the CD. You find it on your bedside table. You put it on and listen to it. You are happy. You have won.|\n";


var lionel_richie_game_2 = "|1|The Street|You have been looking for the new Lionel Richie CD all day, but every shop seems to be sold out. You check your watch. It is getting late and the shops will be closing soon. You need to find the CD before the shops close for the evening. What do you do?|Look in shop windows|2|Talk to the shopkeepers|3|Walk around the town|4|\n" +
"|2|The Shop Windows|You look in the shop windows, but you can't see the CD anywhere. What do you do?|Leave and look for the CD elsewhere|1|\n" +
"|3|The Shopkeepers|You talk to the shopkeepers, but they all say that they don't have the CD in stock. What do you do?|Leave and look for the CD elsewhere|1|\n" +
"|4|Walking around the town|You walk around the town, but you can't find the CD anywhere. What do you do?|Check the shops one last time|5|\n" +
"|5|The shops|You check the shops one last time, but you can't find the CD anywhere. The shops are about to close. What do you do?|Give up and go home|6|\n" +
"|6|Home|You go home. You don't have the CD, but you had a fun day looking for it.";

var lionel_richie_game_3 = "|1|The shops are all closing!|It's 5 o'clock and the shops are closing. You've been looking everywhere for the new Lionel Richie CD, but you can't find it anywhere. What do you do?|Go to the last shop|2|Go home|5|\n" +
"|2|The last shop|You go to the last shop. The shopkeeper is just about to close up. What do you do?|Buy something else|3|Ask about the CD|4|\n" +
"|3|You buy something else|You buy something else. As you're paying, the shopkeeper says, \"I'm sorry, we're all out of the new Lionel Richie CD.\"|Leave the shop|5|\n" +
"|4|Asking about the CD|The shopkeeper says, \"I'm sorry, we're all out of the new Lionel Richie CD.\"|Leave the shop|5|\n" +
"|5|You go home|You go home. You can't believe you didn't find the new Lionel Richie CD. You'll just have to wait until tomorrow.|-||-||-||";
var game;

var lionel_richie_game_4 = "|1|The Shopkeeper's Greeting|You enter the shop and the jingle of the bell alerts the shopkeeper. He's an older man, with a big beard. He looks up from his newspaper and greets you. \"What can I do ya for?\" he asks.|Ask about the new Lionel Richie CD|2|Leave the shop|10| | |\n" +
"|2|Asking about the new Lionel Richie CD|\"Oh, that new Lionel Richie CD? Everyone's been asking for that. I'm sorry to say we're all sold out. I could order one in for you, but it'll be a few days.\"|Ask to order the CD|3|Leave the shop|10| | |\n" +
"|3|Order the new Lionel Richie CD|\"Alright, I'll put an order in for you. It should be here in a few days.\" The shopkeeper takes your name and address.|Leave the shop|4| | |\n" +
"|4|Walking down the street|You leave the shop and walk down the street, looking for the new Lionel Richie CD. You see a group of teenagers hanging out near the corner, and one of them has a CD player. You hear the opening notes of Lionel Richie's new song, \"Hello\".|Approach the teenagers and ask to buy the CD|5|Keep walking|6| |\n" +
"|5|Asking to buy the CD|You approach the teenagers and ask to buy the CD. The teenager with the CD player looks at you and says, \"I'm sorry, but this is the only copy we have and we're not selling it.\"|Keep walking|6| | |\n" +
"|6|Walking down the street|You keep walking down the street, looking for the new Lionel Richie CD. You see a sign in the window of the local grocery store that says \"New Lionel Richie CD - $19.99\".|Enter the grocery store|7|Keep walking|8| |\n" +
"|7|In the grocery store|You enter the grocery store and head to the music section. You see the new Lionel Richie CD on the shelf, and you reach for it. Suddenly, a hand grabs your wrist and you hear a voice say, \"That will be $19.99\". You turn to see the store manager.|Pay for the CD|9|Try to run out of the store|11| |\n" +
"|8|Walking down the street|You keep walking down the street, looking for the new Lionel Richie CD. You see a sign in the window of the local record store that says \"New Lionel Richie CD - $21.99\".|Enter the record store|12|Keep walking|13| |\n" +
"|9|Paying for the CD|You pay for the CD and the store manager lets you go. You take the CD and head for the door.|Exit the store|14| | |\n" +
"|10|Leaving the first shop|You leave the shop and walk down the street, looking for the new Lionel Richie CD. You see a group of teenagers hanging out near the corner, and one of them has a CD player. You hear the opening notes of Lionel Richie's new song, \"Hello\".|Approach the teenagers and ask to buy the CD|5|Keep walking|6| |\n" +
"|11|Trying to run out of the store|You try to run for the door, but the store manager grabs you and pulls you back. \"I'm sorry, but you're not going anywhere until you pay for that CD.\"|Pay for the CD|9| | |\n" +
"|12|In the record store|You enter the record store and head to the music section. You see the new Lionel Richie CD on the shelf, and you reach for it. Suddenly, a hand grabs your wrist and you hear a voice say, \"That will be $21.99\". You turn to see the store manager.|Pay for the CD|15|Try to run out of the store|16| |\n" +
"|13|Walking down the street|You keep walking down the street, looking for the new Lionel Richie CD. You see a sign in the window of the local pawn shop that says \"New Lionel Richie CD - $25.00\".|Enter the pawn shop|17|Keep walking|18| |\n" +
"|14|Exiting the grocery store|You exit the grocery store and head for home, the new Lionel Richie CD in hand. You can't wait to listen to it!| | | |\n" +
"|15|Paying for the CD|You pay for the CD and the store manager lets you go. You take the CD and head for the door.|Exit the store|19| | |\n" +
"|16|Trying to run out of the store|You try to run for the door, but the store manager grabs you and pulls you back. \"I'm sorry, but you're not going anywhere until you pay for that CD.\"|Pay for the CD|15| | |\n" +
"|17|In the pawn shop|You enter the pawn shop and head to the music section. You see the new Lionel Richie CD on the shelf, and you reach for it. Suddenly, a hand grabs your wrist and you hear a voice say, \"That will be $25.00\". You turn to see the store manager.|Pay for the CD|20|Try to run out of the store|21| |\n" +
"|18|Walking down the street|You keep walking down the street, looking for the new Lionel Richie CD. You see a sign in the window of the local library that says \"New Lionel Richie CD - $0.00\".|Enter the library|22|Keep walking|23| |\n" +
"|19|Exiting the record store|You exit the record store and head for home, the new Lionel Richie CD in hand. You can't wait to listen to it!| | | |\n" +
"|20|Paying for the CD|You pay for the CD and the store manager lets you go. You take the CD and head for the door.|Exit the store|24| | |\n" +
"|21|Trying to run out of the store|You try to run for the door, but the store manager grabs you and pulls you back. \"I'm sorry, but you're not going anywhere until you pay for that CD.\"|Pay for the CD|20| | |\n" +
"|22|In the library|You enter the library and head to the music section. You see the new Lionel Richie CD on the shelf, and you reach for it. Suddenly, a hand grabs your wrist and you hear a voice say, \"That will be $0.00\". You turn to see the store manager.|Pay for the CD|25|Try to run out of the store|26| |\n" +
"|23|Walking down the street|You keep walking down the street, looking for the new Lionel Richie CD. You see a sign in the window of the local bookstore that says \"New Lionel Richie CD - $22.99\".|Enter the bookstore|27|Keep walking|28| |\n" +
"|24|Exiting the pawn shop|You exit the pawn shop and head for home, the new Lionel Richie CD in hand. You can't wait to listen to it!| | | |\n" +
"|25|Paying for the CD|You pay for the CD and the store manager lets you go. You take the CD and head for the door.|Exit the store|29| | |\n" +
"|26|Trying to run out of the store|You try to run for the door, but the store manager grabs you and pulls you back. \"I'm sorry, but you're not going anywhere until you pay for that CD.\"|Pay for the CD|25| | |\n" +
"|27|In the bookstore|You enter the bookstore and head to the music section. You see the new Lionel Richie CD on the shelf, and you reach for it. Suddenly, a hand grabs your wrist and you hear a voice say, \"That will be $22.99\". You turn to see the store manager.|Pay for the CD|30|Try to run out of the store|31| |\n" +
"|28|Walking down the street|You keep walking down the street, looking for the new Lionel Richie CD. You see a sign in the window of the local electronics store that says \"New Lionel Richie CD - $24.99\".|Enter the electronics store|32|Keep walking|33| |\n" +
"|29|Exiting the library|You exit the library and head for home, the new Lionel Richie CD in hand. You can't wait to listen to it!| | | |\n" +
"|30|Paying for the CD|You pay for the CD and the store manager lets you go. You take the CD and head for the door.|Exit the store|34| | |\n" +
"|31|Trying to run out of the store|You try to run for the door, but the store manager grabs you and pulls you back. \"I'm sorry, but you're not going anywhere until you pay for that CD.\"|Pay for the CD|30| | |\n" +
"|32|In the electronics store|You enter the electronics store and head to the music section. You see the new Lionel Richie CD on the shelf, and you reach for it. Suddenly, a hand grabs your wrist and you hear a voice say, \"That will be $24.99\". You turn to see the store manager.|Pay for the CD|35|Try to run out of the store|36| |\n" +
"|33|Walking down the street|You keep walking down the street, looking for the new Lionel Richie CD. You see a sign in the window of the local drug store that says \"New Lionel Richie CD - $23.99\".|Enter the drug store|37|Keep walking|38| |\n" +
"|34|Exiting the bookstore|You exit the bookstore and head for home, the new Lionel Richie CD in hand. You can't wait to listen to it!| | | |\n" +
"|35|Paying for the CD|You pay for the CD and the store manager lets you go. You take the CD and head for the door.|Exit the store|39| | |\n" +
"|36|Trying to run out of the store|You try to run for the door, but the store manager grabs you and pulls you back. \"I'm sorry, but you're not going anywhere until you pay for that CD.\"|Pay for the CD|35| | |\n" +
"|37|In the drug store|You enter the drug store and head to the music section. You see the new Lionel Richie CD on the shelf, and you reach for it. Suddenly, a hand grabs your wrist and you hear a voice say, \"That will be $23.99\". You turn to see the store manager.|Pay for the CD|40|Try to run out of the store|41| |\n" +
"|38|Walking down the street|You keep walking down the street, looking for the new Lionel Richie CD. You see a sign in the window of the local department store that says \"New Lionel Richie CD - $26.99\".|Enter the department store|42|Keep walking|43| |\n" +
"|39|Exiting the electronics store|You exit the electronics store and head for home, the new Lionel Richie CD in hand. You can't wait to listen to it!| | | |\n" +
"|40|Paying for the CD|You pay for the CD and the store manager lets you go. You take the CD and head for the door.|Exit the store|44| | |\n" +
"|41|Trying to run out of the store|You try to run for the door, but the store manager grabs you and pulls you back. \"I'm sorry, but you're not going anywhere until you pay for that CD.\"|Pay for the CD|40| | |\n" +
"|42|In the department store|You enter the department store and head to the music section. You see the new Lionel Richie CD on the shelf, and you reach for it. Suddenly, a hand grabs your wrist and you hear a voice say, \"That will be $26.99\". You turn to see the store manager.|Pay for the CD|45|Try to run out of the store|46| |\n" +
"|43|Walking down the street|You keep walking down the street, looking for the new Lionel Richie CD. You see a sign in the window of the local toy store that says \"New Lionel Richie CD - $27.99\".|Enter the toy store|47|Keep walking|48| |\n" +
"|44|Exiting the drug store|You exit the drug store and head for home, the new Lionel Richie CD in hand. You can't wait to listen to it!| | | |\n" +
"|45|Paying for the CD|You pay for the CD and the store manager lets you go. You take the CD and head for the door.|Exit the store|49| | |\n" +
"|46|Trying to run out of the store|You try to run for the door, but the store manager grabs you and pulls you back. \"I'm sorry, but you're not going anywhere until you pay for that CD.\"|Pay for the CD|45| | |\n" +
"|47|In the toy store|You enter the toy store and head to the music section. You see the new Lionel Richie CD on the shelf, and you reach for it. Suddenly, a hand grabs your wrist and you hear a voice say, \"That will be $27.99\". You turn to see the store manager.|Pay for the CD|50|Try to run out of the store|51| |\n" +
"|48|Walking down the street|You keep walking down the street, looking for the new Lionel Richie CD. You see a sign in the window of the local video store that says \"New Lionel Richie CD - $28.99\".|Enter the video store|52|Keep walking|53| |\n" +
"|49|Exiting the department store|You exit the department store and head for home, the new Lionel Richie CD in hand. You can't wait to listen to it!| | | |\n" +
"|50|Paying for the CD|You pay for the CD and the store manager lets you go. You take the CD and head for the door.|Exit the store|54| | |\n" +
"|51|Trying to run out of the store|You try to run for the door, but the store manager grabs you and pulls you back. \"I'm sorry, but you're not going anywhere until you pay for that CD.\"|Pay for the CD|50| | |\n" +
"|52|In the video store|You enter the video store and head to the music section. You see the new Lionel Richie CD on the shelf, and you reach for it. Suddenly, a hand grabs your wrist and you hear a voice say, \"That will be $28.99\". You turn to see the store manager.|Pay for the CD|55|Try to run out of the store|56| |\n" +
"|53|The end of the street|You've reached the end of the street. There are no more shops selling the new Lionel Richie CD. You'll have to try again tomorrow.| | | |\n" +
"|54|Exiting the toy store|You exit the toy store and head for home, the new Lionel Richie CD in hand. You can't wait to listen to it!| | | |\n" +
"|55|Paying for the CD|You pay for the CD and the store manager lets you go. You take the CD and head for the door.|Exit the store|57| | |\n" +
"|56|Trying to run out of the store|You try to run for the door, but the store manager grabs you and pulls you back. \"I'm sorry, but you're not going anywhere until you pay for that CD.\"|Pay for the CD|55| | |\n" +
"|57|Exiting the video store|You exit the video store and head for home, the new Lionel Richie CD in hand. You can't wait to listen to it!Congratulations, you've won! The game is over.| | | |";

var chris_middlemans_party_game_1 = "|1|The Party|You hear that Chris Middleman is having a party this weekend and you really want to go. You know that if you don't get an invite you won't be able to get in. What do you do?|Call Chris|2|Wait by his locker|3|Start a petition|4|\n" +
"|2|Asking Chris|You nervously approach Chris as he talks to his friends by his locker. You clear your throat to get his attention. He looks at you with a raised eyebrow. What do you say?|I heard you're having a party this weekend. Can I come?|5|Can I borrow your notes from last period?|6|Your breath smells bad. Have you been eating garlic again?|7|\n" +
"|3|Waiting by the Locker|You wait by Chris's locker for a while but he doesn't show up. You start to feel a bit silly. What do you do?|Go home|8|Wait a bit longer|9|\n" +
"|4|Starting a Petition|You start a petition to try and get Chris to let everyone into his party. You get lots of signatures. What do you do next?|Give the petition to Chris|10|Post it online|11|\n" +
"|5|Chris's Response|Chris looks surprised that you would ask him such a thing. He looks you up and down then speaks.|You're not cool enough to come to my party.|12|\n" +
"|6|Chris's Response|Chris looks at you like you're an idiot.|I don't have time for this.|13|\n" +
"|7|Chris's Response|Chris steps away from you and holds his nose.|Ew, gross! No way!|14|\n" +
"|8|The End|You go home and sulk. You lose.| | | | | |\n" +
"|9|Chris's Response|Chris finally shows up and looks at you.|What are you doing here?|15|\n" +
"|10|Chris's Response|Chris looks at the petition and then looks at you. He seems touched.|Okay, you can come.|16|\n" +
"|11|Chris's Response|Chris sees the petition online and gets mad. He calls you.|You're not invited anymore!|17|\n" +
"|12|The End|You go home and sulk. You lose.| | | | | |\n" +
"|13|The End|You go home and sulk. You lose.| | | | | |\n" +
"|14|The End|You go home and sulk. You lose.| | | | | |\n" +
"|15|Chris's Response|Chris looks at you for a minute then sighs.|Fine, you can come.|18|\n" +
"|16|The End|You win! You're invited to the party!| | | | | |\n" +
"|17|The End|You go home and sulk. You lose.| | | | | |\n" +
"|18|The End|You win! You're invited to the party!";

var interrogation_game_1 = "|1|The Arrest|You have just arrested David Weener for the murder of his wife. He is being held in the interrogation room. You enter the room and sit down across from him.|\"So you didn't do it?\"|4|\"We have evidence that you did it.\"|2|\"Why would you kill your wife?\"|3|\n" +
"|2|The Evidence|\"What evidence do you have?\" David asks. You pull out the evidence from the case and lay it out on the table.|\"The murder weapon was found in your house.\"|5|\"Your fingerprints are all over the murder weapon.\"|6|\"Your wife's blood is on your clothes.\"|7|\n" +
"|3|The Motive|\"I didn't kill her. I loved her.\" David says. You lean forward, looking him in the eyes.|\"Then why would you kill her?\"|8|\"We have evidence that you did it.\"|2|\"Your fingerprints are all over the murder weapon.\"|6|\n" +
"|4|The Alibi|\"I was at work when it happened.\" David says. You pull out his work schedule and lay it on the table.|\"Your boss says you left work early that day.\"|9|\"There is CCTV footage of you at the crime scene.\"|10|\"Your wife's blood is on your clothes.\"|7|\n" +
"|5|The Murder Weapon|\"I didn't kill her. I loved her.\" David says. You lean forward, looking him in the eyes.|\"Then why would you kill her?\"|8|\"Your fingerprints are all over the murder weapon.\"|6|\"Your wife's blood is on your clothes.\"|7|\n" +
"|6|The Fingerprints|\"I didn't kill her. I loved her.\" David says. You lean forward, looking him in the eyes.|\"Then why would you kill her?\"|8|\"We have evidence that you did it.\"|2|\"Your wife's blood is on your clothes.\"|7|\n" +
"|7|The Bloodstained Clothes|\"I didn't kill her. I loved her.\" David says. You lean forward, looking him in the eyes.|\"Then why would you kill her?\"|8|\"We have evidence that you did it.\"|2|\"Your fingerprints are all over the murder weapon.\"|6|\n" +
"|8|The Motive Revealed|\"I was having an affair.\" David says. You lean back in your chair, crossing your arms.|\"You killed her because she found out about the affair.\"|11|\"You killed her because she was going to leave you.\"|12|\"You killed her for the insurance money.\"|13|\n" +
"|9|The Alibi Checked|\"I was at work when it happened.\" David says. You pull out his work schedule and lay it on the table.|\"Your boss says you left work early that day.\"|9|\"There is CCTV footage of you at the crime scene.\"|10|\"Your wife's blood is on your clothes.\"|7|\n" +
"|10|The Alibi Broken|\"I was at work when it happened.\" David says. You pull out his work schedule and lay it on the table.|\"Your boss says you left work early that day.\"|9|\"There is CCTV footage of you at the crime scene.\"|10|\"Your wife's blood is on your clothes.\"|7|\n" +
"|11|The Confession|\"I killed her because she found out about the affair.\" David says. You lean back in your chair, crossing your arms.|\"Why did you kill her?\"|14|\"How did you kill her?\"|15|\"Where did you kill her?\"|16|\n" +
"|12|The Confession|\"I killed her because she was going to leave me.\" David says. You lean back in your chair, crossing your arms.|\"Why did you kill her?\"|17|\"How did you kill her?\"|18|\"Where did you kill her?\"|19|\n" +
"|13|The Confession|\"I killed her for the insurance money.\" David says. You lean back in your chair, crossing your arms.|\"Why did you kill her?\"|20|\"How did you kill her?\"|21|\"Where did you kill her?\"|22|\n" +
"|14|The Details|\"I was having an affair with my secretary.\" David says. You lean back in your chair, crossing your arms.|\"Why did you kill her?\"|23|\"How did you kill her?\"|15|\"Where did you kill her?\"|16|\n" +
"|15|The Details|\"I hit her over the head with a vase.\" David says. You lean back in your chair, crossing your arms.|\"Why did you kill her?\"|14|\"How did you kill her?\"|15|\"Where did you kill her?\"|16|\n" +
"|16|The Details|\"I killed her in our bedroom.\" David says. You lean back in your chair, crossing your arms.|\"Why did you kill her?\"|14|\"How did you kill her?\"|15|\"Where did you kill her?\"|16|\n" +
"|17|The Details|\"She was going to leave me for another man.\" David says. You lean back in your chair, crossing your arms.|\"Why did you kill her?\"|17|\"How did you kill her?\"|18|\"Where did you kill her?\"|19|\n" +
"|18|The Details|\"I stabbed her with a kitchen knife.\" David says. You lean back in your chair, crossing your arms.|\"Why did you kill her?\"|17|\"How did you kill her?\"|18|\"Where did you kill her?\"|19|\n" +
"|19|The Details|\"I killed her in the living room.\" David says. You lean back in your chair, crossing your arms.|\"Why did you kill her?\"|17|\"How did you kill her?\"|18|\"Where did you kill her?\"|19|\n" +
"|20|The Details|\"The life insurance policy was about to expire.\" David says. You lean back in your chair, crossing your arms.|\"Why did you kill her?\"|20|\"How did you kill her?\"|21|\"Where did you kill her?\"|22|\n" +
"|21|The Details|\"I poisoned her.\" David says. You lean back in your chair, crossing your arms.|\"Why did you kill her?\"|20|\"How did you kill her?\"|21|\"Where did you kill her?\"|22|\n" +
"|22|The Details|\"I killed her in the garage.\" David says. You lean back in your chair, crossing your arms.|\"Why did you kill her?\"|20|\"How did you kill her?\"|21|\"Where did you kill her?\"|22|\n" +
"|23|The Details|\"She was going to tell my wife about the affair.\" David says. You lean back in your chair, crossing your arms.|\"Why did you kill her?\"|23|\"How did you kill her?\"|15|\"Where did you kill her?\"|16|\n";

const john_wanknot_1 = "|1|The Beginning|You are John Wanknot a time traveller. You were on your way home to your own time, when you were suddenly transported to the year 2134. The first thing you notice is the lack of people. You see a man walking towards you. He looks confused and scared. What do you do?|Scream|2|Run Away|3|Talk to him|4|\n" +
"|2|Screaming Your Head Off|You start screaming as loud as you can. The man looks at you funny and then starts running away from you. You keep screaming until you are out of breath. You feel tired and decide to sit down and rest. You fall asleep. When you wake up it is dark and you are surrounded by people with guns. They look angry. What do you do?|Surrender|5|Attack|6|Run Away|7|\n" +
"|3|Running Away|You start running away from the man. He follows you. You run for a while but he is faster than you and catches up to you. He grabs you and won't let you go. What do you do?|Struggle|8|Talk to him|4|\n" +
"|4|Talking to the man|You approach the man and introduce yourself. His name is David. He is from the year 2134. He tells you that there was a war and that everyone is dead. He has been living in the ruins of the city for years. He is the only one left. He asks you to help him. What do you do?|Help him|9|Leave him|10|\n" +
"|5|Surrendering|You put your hands up and surrender. The people surround you and take you to their leader. He asks you who you are and what you are doing here. You tell him your story. He believes you and decides to help you. He gives you a map and tells you to go to the city. What do you do?|Follow the map|11|\n" +
"|6|Attacking|You attack the man. He is stronger than you and easily overpowers you. He ties you up and takes you to the city. You are put in a cell. What do you do?|Wait for an opportunity to escape|12|\n" +
"|7|Running Away 2|You start running away from the man. He follows you. You run for a while but he is faster than you and catches up to you. He grabs you and won't let you go. What do you do?|Struggle|8|Talk to him|4|\n" +
"|8|Struggling|You struggle to get away from the man but he is too strong. He ties you up and takes you to the city. You are put in a cell. What do you do?|Wait for an opportunity to escape|12|\n" +
"|9|Helping David|You decide to help David. You go with him to the city. He shows you around and introduces you to the other people. They are all from different time periods. You meet a woman named Sarah. She is from the year 2034. She is the leader of the group. She tells you that you can stay with them and help them try to find a way back to your own time. What do you do?|Stay with the group|13|\n" +
"|10|Leaving David|You decide to leave David. You go to the city. You meet a woman named Sarah. She is from the year 2034. She is the leader of the group. She tells you that you can stay with them and help them try to find a way back to your own time. What do you do?|Stay with the group|13|\n" +
"|11|Following the Map|You follow the map to the city. You meet a woman named Sarah. She is from the year 2034. She is the leader of the group. She tells you that you can stay with them and help them try to find a way back to your own time. What do you do?|Stay with the group|13|\n" +
"|12|Waiting for an Opportunity to Escape|You wait for an opportunity to escape. After a few days, you are able to escape. You go to the city. You meet a woman named Sarah. She is from the year 2034. She is the leader of the group. She tells you that you can stay with them and help them try to find a way back to your own time. What do you do?|Stay with the group|13|\n" +
"|13|Staying with the Group|You stay with the group and help them try to find a way back to your own time. You search the city for anything that might help. You find a strange device. You have no idea how it works but Sarah says it might be a way to get back to your own time. You decide to use it. It transports you to a different time period. You are separated from the group. What do you do?|Look for the group|14|\n" +
"|14|Looking for the Group|You search for the group but you can't find them. You are lost and don't know what to do. You wander the streets for days. You are getting tired and hungry. You see a building that looks familiar. You go inside and find yourself in your own time. You are reunited with your family. You win!|\n" ;

const john_wanknot_2 = "|1|The Journey Begins|You are sitting in your time machine, it is a hot day in July and the year is 2037. You have been travelling through time for years, exploring different time periods and cultures. But now you want to go home, to your own time. You enter the coordinates for your home time period, 21st century England, and press the button to start your journey. Suddenly, there is a loud bang and the time machine shakes. You look out the window to see that you are in a strange place, a forest that you have never seen before. You see a man walking towards you.|Talk to the man|2|Get out of the time machine and explore|3|Stay in the time machine|4|\n" +
"|2|A Friendly Stranger|The man introduces himself as David. He is wearing strange clothes, like nothing you have seen before. He tells you that you are in the year 1215, in the middle of the Battle of Runnymede. He offers to help you find your way home, but first you need to help him with something.|Help David|5|Try to find your own way home|6|\n" +
"|3|Exploring the Forest|You step out of the time machine and start to walk around. Suddenly, you hear a noise in the bushes. You see a large, furry creature standing in front of you. It looks friendly, but you don't know what it is.|pet the creature|7|run away from the creature|8|\n" +
"|4|Staying in the Time Machine|You decide to stay in the time machine. You sit down and wait, but nothing happens. You wait for hours, but still nothing happens. You start to feel hungry and thirsty. You see a water bottle on the floor of the time machine. You know that you should ration your food and water, but you are so thirsty. You decide to drink some of the water.|Drink some of the water|9|Don't drink the water|10|\n" +
"|5|Helping David|David tells you that he needs your help to find a lost sword. He says that the sword is very important and will help him win the Battle of Runnymede. He asks you to come with him to look for the sword.|Go with David to look for the sword|11|Try to find your own way home|6|\n" +
"|6|Trying to Find Your Way Home|You start to walk through the forest, but you have no idea where you are going. You see a path leading through the trees and decide to follow it. Suddenly, you hear a noise behind you. You turn around and see a large, furry creature standing in front of you. It looks friendly, but you don't know what it is.|pet the creature|7|run away from the creature|8|\n" +
"|7|Petting the Creature|You reach out and pet the creature. It is soft and cuddly. You start to feel tired and decide to lie down and take a nap. You fall asleep and have a strange dream. You dream that you are in a battle, fighting against an army of creatures like the one you just petted. You are losing the battle and about to be killed when you wake up. You see the creature standing over you, looking at you with a sad expression. You realize that the creature is trying to help you, but you don't know how.|Follow the creature|12|\n" +
"|8|Running Away from the Creature|You start to run away from the creature, but you trip and fall. The creature is getting closer and closer to you. You see a large rock nearby and decide to pick it up and throw it at the creature. The rock hits the creature and it falls to the ground, unconscious. You get up and start to run away, but you hear a noise behind you. The creature is getting up and it is angry. It starts to chase you. You see a tree with a low branch and decide to climb it. The creature is too big to climb the tree, so it gives up and goes away. You climb down from the tree and start to walk through the forest. You see a path leading through the trees and decide to follow it.|Follow the path|13|\n" +
"|9|Drinking the Water|You unscrew the cap and start to drink the water. Suddenly, you feel a sharp pain in your stomach. You fall to the ground, clutching your stomach in agony. You see the water bottle lying on the ground next to you. The label on the bottle says \"Do not drink\". You realize that the water was poisoned. You start to feel dizzy and your vision starts to fade. You know that you are going to die.|\n" +
"|10|Not Drinking the Water|You decide not to drink the water. You sit down and wait, but nothing happens. You wait for hours, but still nothing happens. You start to feel hungry and thirsty. You see a water bottle on the floor of the time machine. You know that you should ration your food and water, but you are so thirsty. You decide to drink some of the water.|Drink some of the water|9|Don't drink the water|10|\n" +
"|11|Looking for the Sword|You and David start to look for the sword. You search for hours, but you can't find it. You are about to give up when you see a glint of metal in the bushes. You part the bushes and see the sword lying on the ground. You pick it up and hand it to David. He is very grateful and offers to take you home.|Go with David|14|\n" +
"|12|Following the Creature|You follow the creature through the forest. You come to a clearing and see a strange machine. The creature goes into the machine and you follow. Suddenly, you are back in your own time. You are home! You are reunited with your family and live happily ever after.|\n" +
"|13|Following the Path|You follow the path and come to a clearing. You see a strange machine. You go into the machine and suddenly, you are back in your own time. You are home! You are reunited with your family and live happily ever after.|\n" +
"|14|Going with David|You go with David and he takes you to his home. He introduces you to his wife and children. They all seem very happy to meet you. You sit down to have dinner with them, but something doesn't feel right. Suddenly, you realize that they are going to kill you and eat your flesh. You jump up from the table and run towards the door, but it is too late. They catch you and kill you.|";

$(document).ready(function () {
    game = new CYOAPlayer($("#content"));
    console.log(game.container);
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    console.debug(params);

    // game.set_game(
    //     {
    //         "title" : "A Test Game",
    //         "description" : "Is boring",
    //         "date" : "10th of wank",
    //         "entries" : {
    //             "1" : {
    //                 "title" :"Intro",
    //                 "content" :"First page",
    //                 "actions" : [
    //                     {
    //                         "content" : "to win",
    //                         "entry_id" : "2"
    //                     },
    //                     {
    //                         "content" : "to lose",
    //                         "entry_id" : "3"
    //                     }
    //                 ]
    //             },
    //             "2" : {
    //                 "title" :"Win Page",
    //                 "content" :"Blah page win",
    //                 "actions" : [
    //                 ]
    //             },
    //             "3" : {
    //                 "title" :"Lose Page",
    //                 "content" :"Blah page lose",
    //                 "actions" : [
    //                 ]
    //             }
    //         }
    //     }

    // );
    game.set_game(parse_text_game(john_wanknot_2));
});
