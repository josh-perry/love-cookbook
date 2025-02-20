---
title: "Shaders"
authors: [Jasper]
date: 2025-02-20
---

With **shaders** you can create fun graphical effects for your game.

There are multiple types of shaders available to be used in löve
* The **Fragment**, AKA **Pixel** shader
* The **Vertex** shader
* The **Compute** shader

A shader is a piece of code the GPU executes, like when drawing images or text.

You can make new shaders using `love.graphics.newShader` and `love.graphics.newComputeShader`.

## The Fragment shader
This shader is executed for every pixel your effect covers.
Let's make a simple fragment shader from a string to show it's functionality.

### Simple color

```lua
local shaderCode = [[
vec4 effect(vec4 color, Image tex, vec2 texture_coords, vec2 screen_coords)
{
    // Colors are returned as (Red, Green, Blue, Alpha)
    return vec4(1.0, 0.0, 0.0, 1.0); // Color or square red
}
]]

local shader = love.graphics.newShader(shaderCode)

function love.draw()
    love.graphics.setShader(shader)
    love.graphics.rectangle("fill", 100, 100, 200, 200)
end
```

### Drawing images

Let's step things up by drawing an image this time.
We'll have to change our shader a bit to allow it to draw images
We do this by telling the GPU to load the color values of our image when coloring a pixel.

```lua
local image = love.graphics.newImage("YourImage.png")

local shaderCode = [[
vec4 effect(vec4 color, Image tex, vec2 texture_coords, vec2 screen_coords)
{
    // Use Texel to sample the color of a texture at a coordinate
    vec4 imageColor = Texel(tex, texture_coords);

    // Make the image red by multiplying by our Red vec4
    return imageColor * vec4(1.0, 0.0, 0.0, 1.0);
}
]]

local shader = love.graphics.newShader(shaderCode)

function love.draw()
    love.graphics.setShader(shader)
    love.graphics.draw(image)
end
```

### Uniform values

Uniform values are a way to send data from the CPU to the GPU **Not the other way around**
Let's edit our shader to change the color of our image over time, using a uniform value.

> [!IMPORTANT]
> Uniform values can get optimised out of shader code,
> if you notice shader:send encountering an error even though you the uniform is defined,
> make sure it's contributing to the final output of your shader

```lua
local image = love.graphics.newImage("YourImage.png")

local shaderCode = [[

// Add a uniform vec4, which we can edit in lua.
uniform vec4 ColorOffset;

vec4 effect(vec4 color, Image tex, vec2 texture_coords, vec2 screen_coords)
{
    // Use Texel to sample the color of a texture at a coordinate
    vec4 imageColor = Texel(tex, texture_coords);

    // Make the image red by multiplying by our Red vec4
    return imageColor * vec4(1.0, 0.0, 0.0, 1.0) + ColorOffset;
}
]]

local shader = love.graphics.newShader(shaderCode)
local colorOffset = { 0, 0, 0, 0 }

function love.draw()
    -- Create a sin-wave [0-1], as the green color to add.
    colorOffset[2] = math.sin(love.timer.getTime()) * 0.5 + 0.5

    shader:send("ColorOffset", colorOffset)

    love.graphics.setShader(shader)
    love.graphics.draw(image)
end
```