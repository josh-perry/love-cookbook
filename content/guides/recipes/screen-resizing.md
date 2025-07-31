---
title: "Screen resizing"
authors: [Sheepolution]
date: 2025-07-28
---

Most games allow the screen to be resized. We can do this in LÖVE by enabling `t.window.resizable = true`.

```lua
function love.conf(t)
    t.version = "12.0"
    t.window.title = "My game"
    t.window.width = 960
    t.window.height = 540
    t.window.resizable = true
end
```

But what you will notice is that as you resize your game's window, it won't resize the game with it. What you draw on the screen is not influenced by the size of the window. But, with a canvas and basic math, we can make this happen.

Create a new file called `screen.lua`. In this file we create a new local table. We'll give it a function to initalize a new `Canvas` and a `Transform`.

```lua
local screen = {}

function screen.init(width, height)
    screen.width = width
    screen.height = height
    screen.canvas = love.graphics.newCanvas(width, height)
    screen.transform = love.math.newTransform()
end

return screen
```

In your `main.lua`, require the file, and call `screen.init`.

```lua
local screen = require "screen"

screen.init(960, 540)
```

The width and height you pass are the width and height of your game. In our case, if the window was at resolution *1920x1080*, the game should be drawn twice as big.

Back to our `screen.lua` we need to write some more functions. We want to capture everything that needs to be resized in our canvas. Finally, after everything has been drawn, we draw our canvas.

```lua
function screen.capture()
    -- Push the current state (including the main canvas) onto the stack.
    love.graphics.push("all")
    -- Set our canvas. From now on everything will be drawn on our canvas.
    love.graphics.setCanvas(screen.canvas)
    love.graphics.clear()
end

function screen.draw()
    -- Pop the state, back to the main canvas.
    love.graphics.pop()
    -- Draw our canvas using the transform.
    love.graphics.draw(screen.canvas, screen.transform)
end

return screen
```

Now all that's left is to change the transform (the scaling and translation) based on the size of our window. Let's create a new function that we will call when the window has resized.

We can resize our window in any way we like, meaning we can have a different aspect ratio than 16:9. Because of this, we need to calculate the smallest ratio. Do we change the scaling of our game based on the width or height of our window?

Next will use this scaling to shift the position of our canvas, because want our game to be drawn in the center of the window. We will apply this information to our transform.

```lua
function screen.resize(w, h)
    local scale = math.min(w / screen.width, h / screen.height)
    local x = (w - screen.width * scale) / 2
    local y = (h - screen.height * scale) / 2

    screen.transform:setTransformation(x, y, 0, scale, scale)
end

return screen
```

Back in main.lua we need to call our new functions.

```lua
local screen = require "screen"

screen.init(960, 540)

function love.draw()
    screen.capture()
    -- Draw your game
    screen.draw()
end

function love.resize(w, h)
    -- Upon resizing the window, pass the new width and height.
    screen.resize(w, h)
end
```

Now our game will be resized along with our window. There is a slight problem, however. When we draw something based on the position of our mouse, you will see that it doesn't match your mouse's position.

```lua
function love.draw()
    screen.capture()

    local x, y = love.mouse.getPosition()
    love.graphics.circle("fill", x, y, 10)

    screen.draw()
end
```

This is because originally it is drawn on our mouse position, but then as the window resizes and shifts, so does the circle we drew. To fix this, we can add a function to get our actual mouse position, or rather what would be the mouse position after the scaling and translating is applied.

```lua
function screen.getMousePosition()
    local x, y = love.mouse.getPosition()
    return screen.transform:inverseTransformPoint(x, y)
end
```

The function `inverseTransformPoint` inverses the transformation we apply. The `x` and `y` it gives us are where we need to draw our circle if we want it to appear at the original `x` and `y` after the transformation has been applied.

```lua
function love.draw()
    screen.capture()

    local x, y = screen.getMousePosition()
    love.graphics.circle("fill", x, y, 10)

    screen.draw()
end
```

Now our circle draws on the correct position!

## Pixel art

You might notice that your game looks fuzzy when you scale it. This is especially noticable with *pixel art*. To fix this, we can change the <ins>filtering</ins> to `nearest`. Let's do this based on a third parameter, `pixelArt`.

```lua
function screen.init(width, height, pixelArt)
    screen.width = width
    screen.height = height
    screen.canvas = love.graphics.newCanvas(width, height)
    if pixelArt then
        screen.canvas:setFilter("nearest")
        screen.pixelArt = true -- We will use this in a moment.
    end
    screen.transform = love.math.newTransform()
end
```

Another thing you might want to add is add flooring to our scaling. This way we will only scale whole numbers (2x, 3x, etc.). This way our pixel art stays looking proper.

```lua
function screen.resize(w, h)
    local scale = math.min(w / screen.width, h / screen.height)

    if screen.pixelArt then
        scale = math.floor(scale)
    end

    local x = (w - screen.width * scale) / 2
    local y = (h - screen.height * scale) / 2

    screen.transform:setTransformation(x, y, 0, scale, scale)
end
```

If we make a pixel art game, we can now init the screen with passing `true` as third argument.

```lua
screen.init(960, 540, true)
```

## Libraries

For more advanced options, check out the libraries [push](https://github.com/Ulydev/push) and [shove](https://github.com/Oval-Tutu/shove).

## Full code

```lua
local screen = {}

function screen.init(width, height, pixelArt)
    screen.width = width
    screen.height = height
    screen.canvas = love.graphics.newCanvas(width, height)

    if pixelArt then
        screen.canvas:setFilter("nearest")
        screen.pixelArt = true
    end

    screen.transform = love.math.newTransform()
end

function screen.capture()
    -- Push the current state (including the main canvas) onto the stack.
    love.graphics.push("all")
    -- Set our canvas. From now on everything will be drawn on our canvas.
    love.graphics.setCanvas(screen.canvas)
    love.graphics.clear()
end

function screen.draw()
    -- Pop the state, back to the main canvas.
    love.graphics.pop()
    -- Draw our canvas using the transform.
    love.graphics.draw(screen.canvas, screen.transform)
end

function screen.resize(w, h)
    local scale = math.min(w / screen.width, h / screen.height)

    if screen.pixelArt then
        scale = math.floor(scale)
    end

    local x = (w - screen.width * scale) / 2
    local y = (h - screen.height * scale) / 2

    screen.transform:setTransformation(x, y, 0, scale, scale)
end

function screen.getMousePosition()
    local x, y = love.mouse.getPosition()
    return screen.transform:inverseTransformPoint(x, y)
end

return screen
```