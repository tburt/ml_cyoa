---
title: Sandwich Shop Adventure I
description: The following is a table of data for a choose-your-own-adventure book set in a sandwich shop.
date: 2022-08-10
order: 999
tags: 
- raw experience
- infinite loop
- GPT-3
layout: layouts/game.njk
prompt: The following is a table of data for a choose-your-own-adventure book set in a sandwich shop. Each row represents one page, and the book is between twenty and thirty pages long. Each page has a maximum of three choices. Each choice either leads to another page or ends the book by winning or losing. In the book there are different locations, characters to meet and things to find. Choices can involve examining things in more detail, navigating the shop, interacting with items in the shop or talking to characters. Two pages should not have very similar page text. There is at least one way to win.
raw_output: '|1|Start|You are in a sandwich shop. You can see a sandwich on the counter.|Examine sandwich|2|Examine counter|3|Leave shop|4|^
|2|Examining the sandwich|The sandwich is a BLT.|Take sandwich|5|Leave sandwich|6|^
|3|Examining the counter|The counter is made of wood.|Talk to sandwich shop employee|7|Leave shop|4|^
|4|Leaving the sandwich shop|You are now outside the sandwich shop.|Walk to the left|8|Walk to the right|9|^
|5|Taking the sandwich|You are now eating the sandwich.|Continue eating sandwich|10|^
|6|Leaving the sandwich|The sandwich is now gone.|Walk to the left|8|^
|7|Talking to the sandwich shop employee|The sandwich shop employee is a woman.|Ask about the sandwich|11|Ask about the counter|12|Leave shop|4|^
|8|Walking to the left|You are now in the park.|Walk to the playground|13|^
|9|Walking to the right|You are now in the library.|Check out a book|14|^
|10|Eating the sandwich|You are now full.|Walk to the left|8|^
|11|Asking about the sandwich|The sandwich is a BLT.|Take sandwich|5|Leave sandwich|6|^
|12|Asking about the counter|The counter is made of wood.|Ask about the sandwich|11|Leave shop|4|^
|13|Walking to the playground|You are now at the playground.|Climb on the monkey bars|15|^
|14|Checking out a book|You are now holding a book.|Read the book|16|^
|15|Climbing on the monkey bars|You are now on the monkey bars.|Climb down|17|^
|16|Reading the book|You are now reading the book.|Continue reading|18|^
|17|Climbing down|You are now on the ground.|Walk to the left|8|^
|18|Continuing to read|You are now finished reading the book.|Walk to the right|9|^'
---