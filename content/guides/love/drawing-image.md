---
title: "Drawing an image"
authors: [Sheepolution]
date: 2025-02-19
---

In this tutorial we will draw this whale. 

![](/assets/love/assets/whale.png)

Create an `assets` folder in the same directory as your `main.lua`. Then right click the image to save it in your assets folder. This way we keep scripts and assets nicely separated.

> [!NOTE]
> It is not mandatory to put your images in a folder. You can place your files wherever you like, as long as they are somewhere in your project folder.

To draw the image, we first need to load it. We do this with {% api "love.graphics.newImage(image)" %}.
```lua
local image

function love.load()
    image = love.graphics.newImage("assets/whale.png")
end
```

The variable `image` is now our {% api "Image" %} object.

We can draw the image with {% api "love.graphics.draw(image, x, y)" %}.

```lua
local image

function love.load()
    image = love.graphics.newImage("assets/whale.png")
end

function love.draw()
    -- Draw the image on position 100, 100
    love.graphics.draw(image, 100, 100)
end
```

{% love 800, 300 %}
local image

function love.load()
    image = love.graphics.newImage("assets/whale.png")
end

function love.draw()
    -- Draw the image on position 100, 100
    love.graphics.draw(image, 100, 100)
end
{% endlove %}

Whale done! ;)

## Bonus challenge

Make the whale move back and forth!

{% love 800, 300 %}
local image
local x, dir = 0, 1

function love.load()
    image = love.graphics.newImage("assets/whale.png")
    width, height = image:getDimensions()
end

function love.update(dt)
    x = x + 400 * dt * dir
    if x > 700 then
        x = 700
        dir = -1
    elseif x < 0 then
        x = 0
        dir = 1
    end
end

function love.draw()
    love.graphics.draw(image, x, 100)
end
{% endlove %}