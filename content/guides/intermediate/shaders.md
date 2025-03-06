---
title: "Shaders"
authors: [Jasper]
date: 2025-03-05
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

## Object Management
When providing shaders with objects, like `Textures` and `Buffers`
we provide the reference to the data already stored in VRAM. 

Meaning if we for example, send a canvas to a shader and render to it with a `setCanvas` call, the memory in VRAM will have changed.
So when using that canvas later, the contents will be different from when you sent the image, as it's just a reference.
Sending images and buffers to the gpu is expensive (Using newTexture, newBuffer or similar), but sending the reference (Using shader:send) is not.

## The Fragment shader
This shader is executed for every pixel the effect covers.
Let's make a simple fragment shader from a string to show it's functionality.

During this guide, we will be creating new shader files, usually with the `.fs`, `.vs` or `.glsl` extension.
However, if needed, shaders can be created from a string (`love.graphics.newShader(yourCodeString)`) as well. 

We start by defining the output, `vec4`.        
`vec4 color` is the color we provide with `love.graphics.setColor`.      
`Image tex` is the texture of our draw call, like the image from `love.graphics.draw(image)`.        
`vec2 texture_coords` are the uv-coordinates defined by the vertices of our mesh or automatically by LÖVE for images and similar [0-1].     
`vec2 screen_coords` are the coordinates on screen, [0.5 to love_ScreenSize.xy-0.5].      

### Simple color

`solidColor.fs`
```glsl

// This is one of the "entry points" supported by LÖVE.
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

## Shader optimisation

While shader optimisation is an incredibly advanced topic, these are still some useful tips to keep in mind while creating stunning effects!

* Try to minimise texture samples, and try to keep the position consistent and close to the source.
* The gpu is great at doing a lot of small tasks at the same time, so try to avoid really long for loops or huge shaders.
* Implicit conversions, while doing a multiplication two different types is fine, try to avoid it in a for loop if possible, converting an int to a float once is better than 100x!
* Precision qualifiers, these don't do anything on desktop gpus but mobile devices do calculations a lot faster at lower precisions.

These are also useful but might not be as relevant when creating normal effects.
* Data packing, instead of using 4 32-bit integers to store 4 8-bit integer values, if the size is known beforehand, they can be packed before writing and unpacked before reading.
* Register usage, using more registers (determined by the maximum amount of values used at any point in a shader) *can* cause the shader to run slower.
