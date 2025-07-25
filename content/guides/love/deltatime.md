---
title: "Deltatime"
authors: [Sheepolution]
date: 2025-02-19
---

Some computers are faster than others. This means that two computers can run our code at different speeds. With the code below, for example, the rectangle will move at different speeds on different computers. This is troublesome, because it could mean that our player character runs a lot faster or slower than intended. To fix this, we use a number called **deltatime**.

{% love 800,200,true %}
local x = 0

function love.update(dt)
    x = x + 10

    if x > 750 then
        x = 0
    end
end

function love.draw()
    love.graphics.rectangle("fill", x, 100, 50, 50)
end
{% endlove %}


Deltatime, or `dt` for short, is the time it took to process the last frame. More specifically, it's the duration between the start of the last frame and the start of the current frame.

We can get deltatime by adding it as a parameter to `love.update`. When LÖVE calls `love.update`, it will pass `dt`. By multiplying a number with `dt`, we can make our rectangle move with the same speed for everyone.

> [!NOTE]
> With a frame we mean a single cycle of both calling love.update and love.draw. Inside these functions you have all sorts of operations happening, from calculating collision and drawing images. These operations take time. For a game to run smoothly, it needs to run 60 frames per seconds (fps). This equals to `1 / 60` seconds, meaning 0.016667 seconds.
>
> In a normal scenario the speed a computer takes to process a single frame constantly changes each frame. In this chapter we'll use a constant deltatime to make it easier to explain.

Frames are fast, and therefore deltatime is generally a low number. When you print `dt` you'll get a different decimal number every frame. To explain deltatime, let's use an extreme example of very slow computers.

* On computer A, our game runs with 20 fps
* On computer B, our game runs with 4 fps.

Because `dt` is the time between two frames, and computer A runs our game with 20 frames per second, we can calculate the average deltatime with `1 / 20`. This gives us `0.05` seconds. In other words: when running a game with 20 fps, each frame takes about `0.05` seconds to process.

For computer B, which runs with 4 fps, the calculation is `1 / 4`, which is `0.2` seconds.

We can use the earlier example of the rectangle. By multiplying its movement with deltatime, the rectangle will move equally as fast on both computer A and B.

* After 1 second, computer A will have multiplied `10` (speed) by `0.05` (dt) for `20` (fps) times. The calculation is `10 * 0.05 * 20`, which results to `10`.
* After 1 second, computer B will have multiplied `10` (speed) by `0.25` (dt) for `4` (fps) times. The calculation is `10 * 0.25 * 4`, which results to `10`.

|Computer| Speed | FPS  | dt | Calculation | Result |
|---|---|---|---|---|---|
| A | 10 | 20 fps | 0.05 | 10 * 20 * 0.05 | 10 |
| B | 10 | 4 fps | 0.25 | 10 * 4 * 0.25 | 10 |


```lua
function love.update(dt)
    x = x + 10 * dt

    if x > 750 then
        x = 0
    end
end
```

{% love 800,200 %}
local x = 0

function love.update(dt)
    x = x + 10 * dt
    if x > 750 then
        x = 0
    end
end

function love.draw()
    love.graphics.rectangle("fill", x, 100, 50, 50)
end
{% endlove %}

## When to use deltatime?

So now we know how deltatime works, and that we can use it to make updates in our game equal among all computers. But as a beginner it can be confusing when exactly to use deltatime. It's tempting to use it everywhere. 

```lua 7-10
local x = 0
local score = 0

function love.update(dt)
    x = x + 500 * dt -- Changed to 500

    if x > 750 then
        x = 0
        score = score + 1
    end
end

function love.draw()
    love.graphics.print(score, 10, 10)
    love.graphics.rectangle("fill", x, 100, 50, 50)
end
```
{% love 800,200 %}
local x = 0
local score = 0

function love.update(dt)
    x = x + 500 * dt -- Changed to 500

    if x > 750 then
        x = 0
        score = score + 1
    end
end

function love.draw()
    love.graphics.print(score, 10, 10)
    love.graphics.rectangle("fill", x, 100, 50, 50)
end
{% endlove %}

In the example above I don't use deltatime when adding to the score. This is because it's an event that is <ins>not frame-dependent</ins>. It is an action that is triggered by a one-frame event (`x` being higher than `750`). In comparison, the rectangle moving is a continious event happening over multiple frames.

Here are some more examples:

| Scenario  | Use deltatime?  |
|---|---|
| Moving upwards when holding the up arrow key  | ✅ |
| Clicking on a button to increase your score | ❌ |
| Decrease health when player touches a spike  | ❌ |
| Slowly decrease health while player is standing in lava  | ✅ |