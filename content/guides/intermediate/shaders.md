---
title: "Shaders"
authors: [Jasper]
date: 2025-02-20
---

> [!CAUTION]
> This guide is made for LÖVE 12.0!

With **shaders** we can create fun graphical effects for our games.

There are multiple types of shaders available to be used in LÖVE
* The **Fragment**, AKA **Pixel** shader
* The **Vertex** shader
* The **Compute** shader

A shader is a piece of code the GPU executes, like when drawing images or text.

Shaders can be created using `love.graphics.newShader` and `love.graphics.newComputeShader`.
Compute shaders won't be covered here.

## Syntax

LÖVE shaders are written in GLSL, which is quite a bit different to lua.
Some notable difference are that GLSL is statically typed, semicolon line breaks, curly brackets to define code blocks instead of `then / do`, `end`.       

There are some limitations to take in to consideration when writing shader code, the main one is that, due to the way GPUs work the entire register usage needs to be known beforehand, meaning dynamic memory allocations like these:
```glsl
uniform int IntCount;
uniform int[IntCount] UniformIntegers
```
aren't allowed.     
Which leads to another limitation, recursive code is not allowed either, use a stack and a while loop instead.

### Types

Scalar types:
* `float`: 32-bit floating point number, for storing fractional values
* `int`: 32-bit integer value
* `uint`: unsigned version of int, meaning it can't be negative, allowing for twice the range of values
* `bool`: boolean value (`true` or `false`)

Vector types:
* `vecn`: float type vector
* `ivecn`: integer type vector
* `uvecn`: unsigned integer type vector
* `bvecn`: boolean type vector

Matrix types:
* mat*n*x*m*: n columns, m rows (column major) 

>[!IMPORTANT]
> When doing math in shaders, make sure to use the correct literal number formatting        
> `1 / 2 = 0` Values without type suffixes will be interpreted as integers      
> `1.0 / 2.0 = 0.5` Floating point division

Type suffixes
* `float`: *x*.;*x*.0;*x*.f (1. ; 1.0 ; 1.f)
* `int`: *x* ( 1 )
* `uint` *x*u ( 1u )

[This](https://learnwebgl.brown37.net/12_shader_language/glsl_mathematical_operations.html) page explains operators.

## The Fragment shader
This shader is executed for every pixel the effect covers.
Let's make a simple fragment shader from a string to show it's functionality.

During this guide, we will be creating new shader files, usually with the `.fs`, `.vs` or `.glsl` extension.
However, if needed, shaders can be created from a string (`love.graphics.newShader(yourCodeString)`) as well. 

---

### Simple color

`solidColor.fs`
```glsl
vec4 effect(vec4 color, Image tex, vec2 texture_coords, vec2 screen_coords)
{
    // Colors are returned as (Red, Green, Blue, Alpha)
    return vec4(1.0, 0.0, 0.0, 1.0); // Color the square red
}
```

`main.lua`
```lua
local shader = love.graphics.newShader("solidColor.fs")

function love.draw()
    love.graphics.setShader(shader)
    love.graphics.rectangle("fill", 100, 100, 200, 200)
end
```

---

### Drawing images

Let's step things up by drawing an image this time.
We'll have to change our shader a bit to allow it to draw images.
We do this by telling the GPU to load the color values of our image when coloring a pixel.

`drawImage.fs`
```glsl
vec4 effect(vec4 color, Image tex, vec2 texture_coords, vec2 screen_coords)
{
    // Use Texel to sample the color of a texture at a coordinate
    vec4 imageColor = Texel(tex, texture_coords);

    // Make the image red by multiplying by our Red vec4
    return imageColor * vec4(1.0, 0.0, 0.0, 1.0);
}
```

`main.lua`
```lua
local image = love.graphics.newImage("YourImage.png")

local shader = love.graphics.newShader("drawImage.fs")

function love.draw()
    love.graphics.setShader(shader)
    love.graphics.draw(image)
end
```

---

### Uniform values

Uniform values are a way to send data from the CPU to the GPU **Not the other way around!**     
Let's edit our shader to change the color of our image over time, using a uniform value.

> [!NOTE]
> Uniform values can get optimised out of shader code,      
> if shader:send is encountering an error even though the uniform is defined,
> make sure it's contributing to the final output of the shader.

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

---

### Box blur

Let's step things up again by creating a multi pass shader and by moving it to another file.
Start by creating a file called `boxBlur.fs` (fs = fragment shader)

Blurring a picture works by sampling the values of all other nearby pixels within a certain radius and averaging those results.      
However, because of how this effect scales, larger blur radiuses become really computationally expensive.       
Due to the way this effect works, we can do it in two passes, one on the x-axis and one on the y-axis, effectively changing the amount of pixels to so sample per pixel from Count^2 to Count * 2

`boxBlur.fs`:
```glsl
uniform vec2 Offset;
uniform int SampleCount;
uniform Image SourceTexture;

vec4 effect(vec4 color, Image tex, vec2 texture_coords, vec2 screen_coords)
{
    // Keep a sum of all samples
    vec3 sum = vec3(0.0);

    // Type conversions are not done automatically in GLSL ES 
    // Knowing when they happen can help understanding our code better and improve compatability
    vec2 texel_size = 1.0 / vec2(love_ScreenSize.xy);

    for (int sample = 0; sample < SampleCount; sample++)
    {
        sum += Texel(SourceTexture, texture_coords + (Offset * float(sample)) * texel_size).rgb;
    }

    sum /= float(SampleCount);

    return vec4(sum, 1.0);
}
```

`main.lua`:
```lua
local image = love.graphics.newImage("YourImage.png")
local shader = love.graphics.newShader("boxBlur.fs")
local mainCanvas = love.graphics.newCanvas()

-- Since we are applying the shader twice, we need to store the image in between passes
local blurCanvas = love.graphics.newCanvas()
-- Size of the entire box will be (n * 2 + 1) x (n * 2 + 1) (n to each side + center)
shader:send("SampleCount", 16)


-- Quick helper function to draw a 1x1 image full-screen
-- Which avoids having to create a mesh with uv's, since images have that by default
local img = love.graphics.newImage(love.image.newImageData(1, 1))
function drawFullscreen()
    love.graphics.draw(img, 0, 0, 0, love.graphics.getDimensions())
end

function love.draw()
    love.graphics.setCanvas(mainCanvas)
    love.graphics.clear()
    love.graphics.draw(image)

    love.graphics.setCanvas(blurCanvas)
    love.graphics.clear()
    love.graphics.setShader(shader)

    -- Blur on the X-axis
    shader:send("Offset", { 1.0, 0.0 })
    shader:send("SourceTexture", mainCanvas)

    drawFullscreen()
    love.graphics.setCanvas(mainCanvas)

    -- Blur on the Y-axis
    shader:send("Offset", { 0.0, 1.0 })
    shader:send("SourceTexture", blurCanvas)
    drawFullscreen()

    love.graphics.setCanvas()
    love.graphics.setShader()
    love.graphics.draw(mainCanvas)
end
```

## Vertex shaders

Vertex shaders are small programs which calculate the final position of a vertex on screen.     
The output of a vertex shader is in NDC-space (Normalised Device Coordinates),          
which is just a fancy name for [-1 to 1], though it is important to keep in mind.       
As a post processing step to the vertex shader, the gpu divides the output vertex coordinates by the w component and brings the coordinates to [0 to 1], which is the final position of the vertex on-screen.

Let's start with the standard shader LÖVE uses and break it down.

```glsl
varying vec4 vpos;

vec4 position( mat4 transform_projection, vec4 vertex_position )
{
    vpos = vertex_position;
    return transform_projection * vertex_position;
}
```

`varying` is a keyword which defines a variable that will be shared between the vertex and fragment shader stage.       
By default, these values are interpolated, meaning halfway between, for example, pure red and green, the final value will be [0.5, 0.5, 0.0]

{% love 200, 200, true %}
local PI13 = math.pi * 2 / 3
local mesh = love.graphics.newMesh({
    { 100 + math.cos(PI13 * 2 + math.pi / 6) * 100, 120 + math.sin(PI13 * 2 + math.pi / 6) * 100, 0, 0, 1, 0, 0 },
    { 100 + math.cos(PI13 * 3 + math.pi / 6) * 100, 120 + math.sin(PI13 * 3 + math.pi / 6) * 100, 0, 0, 0, 1, 0 },
    { 100 + math.cos(PI13 + math.pi / 6) * 100,     120 + math.sin(PI13 + math.pi / 6) * 100,     0, 1, 0, 0, 1 },
}, "triangles", "static")

function love.draw()
    love.graphics.draw(mesh)
end

{% endlove %}

`mat4 transform_projection` is the variable which is doing all of the hard work,        
it's the matrix which stores the current coordinate system transform, so translation, rotation and scale and the projection matrix.         
By default LÖVE uses an orthographic projection matrix which goes [-10, 10] on the z-axis, meaning if objects are outside of that range, they won't be visible anymore.        
This is because the z values of the pixels will lie outside of the [-1 to 1] range and the gpu will "clip" the fragments.

`vec4 vertex_position` is the input vertex's position, by default `w = 1`, any time a position is multiplied with a projection matrix, it should be `1` otherwise it will cause issues.

Let's do some shader magic and create a vertex shader which automatically covers the entire screen with a single triangle, instead of having to create a 1x1 image like we did before.

## Fullscreen triangle

This shader uses an entry point which is introduced in 12.0, it allows us to completely skip LÖVEs default inputs and outputs

`fullscreenTriangle.vs`
```glsl
// Store UV-Coordinates to be used in the fragment shader
varying vec2 VarVertexCoord;
#ifdef VERTEX
void vertexmain() {
    // We want a triangle which covers the entire screen, so we need to generate a triangle with vertices at the positions:
    // [0, 0], [0, 2], [2, 0]
    
    // Bit shifting magic to create these coordinates
    VarVertexCoord = vec2((love_VertexID << 1) & 2, love_VertexID & 2);

    vec4 VarScreenPosition = vec4(VarVertexCoord.xy * vec2(2.0) + vec2(-1.0), 0.0, 1.0);

    gl_Position = VarScreenPosition;
}
#endif
```

## Effects

### Nearest color

To lock the colors we can have in our image, and still have artistic control over those colors, we're going to create an image with all possible colors our output can be, then use a fragment shader to select one which fits the best using a simple approximation.

`paletteShader.fs`
```glsl
uniform sampler2D Palette;

vec4 effect(vec4 color, Image tex, vec2 texture_coords, vec2 screen_coords) {
    ivec2 size = textureSize(Palette, 0);

    // Store the color our image was originally going to be
    vec4 defaultColor = color * Texel(tex, texture_coords);
    // Store the "Distance" To the current closest color
    vec4 closestColor = vec4(1.0);

    // In LDR (Low Dynamic Range), the maximum distance is 1.0
    float closestDist = 1.0;

    // Loop over all colors in the palette
    for (int i = 0; i < size.x; i++) {
        vec4 paletteColor = texelFetch(Palette, ivec2(i, 0), 0);

        // FYI, this is a very simple color distance calculation
        // The visual difference between colors is not linear
        // and not all channels are equal

        float dist = distance(paletteColor.rgb, defaultColor.rgb);

        // If this color is closer than the previous closest, use it
        if (dist < closestDist) {
            closestDist = dist;
            closestColor = paletteColor;
        }
    }

    // Then just return the color
    return closestColor;
}
```

`main.lua`
```lua
local shader = love.graphics.newShader("paletteShader.fs")

-- Calculate a palette with some colors
local channels = 4
local paletteData = love.image.newImageData(channels * channels * channels, 1)

for red = 0, channels - 1 do
    for green = 0, channels - 1 do
        for blue = 0, channels - 1 do
            local x = red + green * channels + blue * channels * channels
            paletteData:setPixel(x, 0, red / (channels - 1), green / (channels - 1), blue / (channels - 1), 1)
        end
    end
end

local palette = love.graphics.newImage(paletteData)
shader:send('Palette', palette)
local image = love.graphics.newImage('YourImage.png')

function love.draw()
    love.graphics.setShader(shader)
    love.graphics.draw(image, 0, 0)
    love.graphics.setShader()
end
```

### Pixelation

To achieve a pixelation effect, we basically want to increase the amount of pixels a pixel in our game covers,

For this effect we'll run a shader to average the results of every 2x2 block, effectively halving the resolution of our game.      
We can use a trick to improve the memory efficiency of our effect by storing the results of that average in a half resolution image, since all pixels in that 2x2 block will have the same average.     
To increase the amount of pixelation our effect allows for we can keep downscaling like that until we achieve our desired resolution.

`pixelationShader.fs`
```glsl
vec4 effect(vec4 color, Image tex, vec2 texture_coords, vec2 screen_coords) {
    // This shader will run on a half-resolution canvas
    // meaning the texture_coords are in the center of a 2x2 pixel block
    /*
    |---|---|
    | 0 | 1 |
    |---X---|
    | 2 | 3 |
    |---|---|
    */

    ivec2 size = textureSize(tex, 0); // Full-resolution size
    vec2 texelSize = 1.0 / size; // Size of a texel

    // Size we're offset 0.5 texels in each direction
    vec2 offset = vec2(0.5) * texelSize;

    // Calculate the positions on the Full-resolution canvas
    vec2 samplePosition0 = texture_coords + offset * vec2(-1.0, -1.0);
    vec2 samplePosition1 = texture_coords + offset * vec2( 1.0, -1.0);
    vec2 samplePosition2 = texture_coords + offset * vec2(-1.0,  1.0);
    vec2 samplePosition3 = texture_coords + offset * vec2( 1.0,  1.0);

    // Half-resolution size, converted to vec2, so we skip a few automatic conversions
    vec2 outputSize = vec2(love_ScreenSize.xy);

    vec4 average = vec4(0.0);

    // The gpu has something called a FMAD instruction, which is a Fused Multiply-Add
    // Meaning we can multiply and add at the same time for no extra cost!

    average = 0.25 * texelFetch(tex, ivec2(samplePosition0 * size), 0) + average;
    average = 0.25 * texelFetch(tex, ivec2(samplePosition1 * size), 0) + average;
    average = 0.25 * texelFetch(tex, ivec2(samplePosition2 * size), 0) + average;
    average = 0.25 * texelFetch(tex, ivec2(samplePosition3 * size), 0) + average;

    return average;
}
```

`main.lua`
```lua
local pixelationShader = love.graphics.newShader("pixelationShader.fs")

-- pixelScale must be an integer and a power of two
-- pixelationCanvases can just be a table we define outside of our main loop
-- the function will use this table to store the half-resultion canvases, it's a parameter
-- because we need to release them when resizing "gameCanvas" or when changing the format
function pixelate(gameCanvas, pixelScale, pixelationCanvases)
    -- Will try to avoid doing anything if the scale is 1
    -- Because then previousCanvas will be `gameCanvas` and a canvas can't be drawn to itself.
    if pixelScale == 1 then
        return
    end

    local width, height = gameCanvas:getDimensions()

    -- Make sure we don't try to create a 0x0 canvas later
    assert(math.floor(width / pixelScale) > 0, "Pixel scale is too high for the canvas width")
    assert(math.floor(height / pixelScale) > 0, "Pixel scale is too high for the canvas height")

    -- Though this is probably not used, it's good to have it here
    -- So this code doesn't need to be edited if we change the format of our game canvas
    local format = gameCanvas:getFormat()
    local settings = { format = format }

    -- Keep track of the full-size canvas relative to the one we're working on.
    local previousCanvas = gameCanvas

    local mode, alphaMode = love.graphics.getBlendMode()
    -- Disable any blending for the pixelation
    love.graphics.setBlendMode("none")
    love.graphics.setShader(pixelationShader)

    local scale = 2

    -- Create a canvas for each power of two scale if they don't exist yet
    -- and draw the previous canvas to it.
    while scale <= pixelScale do
        if not pixelationCanvases[scale] then
            pixelationCanvases[scale] = love.graphics.newCanvas(width / scale, height / scale, settings)
            pixelationCanvases[scale]:setFilter("nearest", "nearest")
        end

        local canvas = pixelationCanvases[scale]

        love.graphics.setCanvas(canvas)
        love.graphics.draw(previousCanvas, 0, 0, 0, 0.5, 0.5)

        previousCanvas = canvas

        scale = scale * 2
    end

    -- Draw the final canvas to the game canvas
    love.graphics.setCanvas(gameCanvas)
    love.graphics.setShader()
    love.graphics.draw(previousCanvas, 0, 0, 0, scale / 2, scale / 2)

    -- Clean up
    love.graphics.setCanvas()
    love.graphics.setBlendMode(mode, alphaMode)
end
```

### Outlines

There are almost an infinite amount of ways to create an outline shader but we'll cover two simple ones here.

The first implementation requires that objects with an outline are drawn to a black canvas, which a shader then calculates the outlines for and overlays over the game.

`outlineShader.fs`
```glsl
// radius in pixels of the outline
uniform float radius;
uniform vec4 OutlineColor;

// Increasing the bias will change how dark a pixel needs to be to be considered outside
// 0.0 is the darkest possible color, 1.0 is the lightest possible color
const float bias = 0.01;

bool outside(Image tex, vec2 texture_coords)
{
    vec3 color = Texel(tex, texture_coords).rgb;
    return color.r <= bias && color.g <= bias && color.b <= bias;
}

vec4 effect(vec4 color, Image tex, vec2 texture_coords, vec2 screen_coords) {
    // Make sure we only color outside of the shape
    if (!outside(tex, texture_coords))
        return vec4(0.0, 0.0, 0.0, 0.0);

    // Size of the outline in pixels
    int size = int(radius);

    vec2 texelSize = 1.0 / vec2(love_ScreenSize.xy);

    // Loop over all pixels within the radius of the outline
    // If any are inside the shape, color the pixel
    for (int x = -size; x <= size; x++)
    {
        for (int y = -size; y <= size; y++)
        {
            if (x * x + y * y <= size * size && !(x == 0 && y == 0))
            {
                vec2 offset = vec2(x, y) * texelSize;
                if (!outside(tex, texture_coords + offset))
                    return OutlineColor;
            }
        }
    }

    return vec4(0.0, 0.0, 0.0, 0.0);
}
```

`main.lua`
```lua
local outlineShader = love.graphics.newShader("outlineShader.fs")

function outline(gameCanvas)
    love.graphics.setShader(outlineShader)
    local mode, alphaMode = love.graphics.getBlendMode()
    love.graphics.setBlendMode("alpha", "premultiplied")

    -- Set the shader's uniform variables
    outlineShader:send("radius", 2)
    outlineShader:send("OutlineColor", { 1, 0, 0, 1 })

    -- Draw the game canvas
    love.graphics.draw(gameCanvas)

    -- Clean up
    love.graphics.setShader()
    love.graphics.setBlendMode(mode, alphaMode)
end
```

The next method does not need a contrast between our image and pure black to work.
This one works by calculating the average of the difference in color around the center pixel
and applying the outline color if it crosses a certain threshold.

`outlineShader.fs`
```glsl
// radius in pixels of the outline
uniform float radius;
uniform vec4 OutlineColor;
uniform float Threshold;

float difference(Image tex, vec2 texture_coords, vec4 color)
{
    vec3 sampleColor = Texel(tex, texture_coords).rgb;
    return distance(sampleColor, color.rgb);
}

vec4 effect(vec4 color, Image tex, vec2 texture_coords, vec2 screen_coords) {
    // Size of the outline in pixels
    int size = int(radius);

    vec2 texelSize = 1.0 / vec2(love_ScreenSize.xy);

    vec4 texColor = Texel(tex, texture_coords);

    float diffSum = 0.0;
    float count = 0.0;

    // Loop over all pixels within the radius of the outline
    // If any are inside the shape, color the pixel
    for (int x = -size; x <= size; x++)
    {
        for (int y = -size; y <= size; y++)
        {
            if (x * x + y * y <= size * size && !(x == 0 && y == 0))
            {
                vec2 offset = vec2(x, y) * texelSize;

                float diff = difference(tex, texture_coords + offset, texColor);

                diffSum += diff;
                count++;
            }
        }
    }

    if (diffSum / count >= Threshold)
    {
        return OutlineColor;
    }

    return vec4(0.0, 0.0, 0.0, 0.0);
}
```

```lua
local outlineShader = love.graphics.newShader("outlineShader.fs")
local outlineColor = { 1, 0, 0, 0.7 }

function outline(gameCanvas)
    love.graphics.setShader(outlineShader)
    local mode, alphaMode = love.graphics.getBlendMode()
    love.graphics.setBlendMode("alpha", "alphamultiply")

    -- Set the shader's uniform variables
    outlineShader:send("radius", 2.5)
    outlineShader:send("OutlineColor", outlineColor)
    outlineShader:send("Threshold", 0.35)

    -- Draw the game canvas
    love.graphics.draw(gameCanvas)

    -- Clean up
    love.graphics.setShader()
    love.graphics.setBlendMode(mode, alphaMode)
end
```

## Shader optimisation

While shader optimisation is an incredibly advanced topic, these are still some useful tips to keep in mind while creating stunning effects!

* Try to minimise texture samples, and try to keep the position consistent and close to the source.
* The gpu is great at doing a lot of small tasks at the same time, so try to avoid really long for loops or huge shaders.
* Implicit conversions, while doing a multiplication two different types is fine, try to avoid it in a for loop if possible, converting an int to a float once is better than 100x!
* Precision qualifiers, these don't do anything on desktop gpus but mobile devices do calculations a lot faster at lower precisions.

These are also useful but might not be as relevant when creating normal effects.
* Data packing, instead of using 4 32-bit integers to store 4 8-bit integer values, if the size is known beforehand, they can be packed before writing and unpacked before reading.
* Register usage, using more registers (determined by the maximum amount of values used at any point in a shader) *can* cause the shader to run slower.
