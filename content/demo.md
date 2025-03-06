---
title: "Demo"
date: 2025-03-06
authors: ["josh"]
layout: "guide.njk"
---

## This is a header
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur lorem justo, maximus ut justo non, ornare tristique urna. Suspendisse laoreet scelerisque est quis aliquet. Aliquam neque velit, hendrerit eu sollicitudin ut, commodo eu dolor. 

### This is a smaller header
Vestibulum nec dapibus lacus, et condimentum nulla. Donec placerat sit amet lorem vitae porttitor. Etiam in luctus diam.

#### Even smaller
Aenean cursus velit massa, a gravida felis pulvinar ut. Vestibulum fermentum vulputate turpis.

##### To go even smaller
Quisque placerat urna at dolor rhoncus fringilla.

##### smal
In id nulla vel velit luctus sodales vel id felis.

Nam sit amet enim tempor, laoreet velit vel, posuere magna.

###### simply ridiculously small
ahh

## Alerts!
> [!NOTE]
> This is something that is good to know.

> [!TIP]
> Here's some handy advice that isn't crucial but is nice to be aware of.

> [!IMPORTANT]
> You really need to know this.

> [!WARNING]
> You really, really need to know this!!!

> [!CAUTION]
> Something catastrophic could happen if you don't read this alert!
>
> We can also put `code` inline here if needed.


## API references
Say I wanted to refer to the function used to create quads in LOVE. I could do it inline like so: {% api "love.graphics.newQuad" %} and we get a cool link to the wiki and everything.

## Code blocks
Code block lines can be highlighted:
```lua 2
function love.draw()
    love.graphics.printf("this is how we embed code", 0, 50, love.graphics.getWidth(), "center")
end
```

## Embedded LOVE
We can embed LOVE windows with the `{% raw %}{% love %}{% endraw %}` shortcode.
{% love 300, 150 %}
function love.draw()
    love.graphics.printf("this is how we embed love.js", 0, 50, love.graphics.getWidth(), "center")
end
{% endlove %}

## Abstract
We can add hover abstract text: [local variables](./guides/fundamentals/variables#local-variables) to explain briefly explain concepts from other chapters.