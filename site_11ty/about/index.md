---
layout: layouts/post.njk
title: AI Choose Your Own Adventure Stories
templateClass: tmpl-post
date: 2022-08-08
eleventyNavigation:
  key: About
  order: 3
---

All games are pre-generated using LLMs (early ones with GPT-3). The results are loosely cherry-picked but unedited.

These early ones were generated back in the day of LLM basic completion (rather than a chat with roles etc) in one shot, and worked best with GPT-3 writing the game as a markdown table.

Example prompt (GPT3):
> The following is a table of data for a choose-your-own-adventure book set in a sandwich shop. Each row represents one page, and the book is between twenty and thirty pages long. Each page has a maximum of three choices. Each choice either leads to another page or ends the book by winning or losing. In the book there are different locations, characters to meet and things to find. Choices can involve examining things in more detail, navigating the shop, interacting with items in the shop or talking to characters. Two pages should not have very similar page text. There is at least one way to win.<br>
|Page Number|Page Title|Page Text|Choice 1 Text|Choice 1 Page Number|Choice 2 Text|Choice 2|Page Number|Choice 3 Text|Choice 3 Page Number|

Example output by GPT-3:
>|1|Start|You are in a sandwich shop. You can see a sandwich on the counter.|Examine sandwich|2|Examine counter|3|Leave shop|4|
|2|Examining the sandwich|The sandwich is a BLT.|Take sandwich|5|Leave sandwich|6|
|3|Examining the counter|The counter is made of wood.|Talk to sandwich shop employee|7|Leave shop|4|
|4|Leaving the sandwich shop|You are now outside the sandwich shop.|Walk to the left|8|Walk to the right|9|
|5|Taking the sandwich|You are now eating the sandwich.|Continue eating sandwich|10|
..........
..........
..........

Thep Burt 2022-