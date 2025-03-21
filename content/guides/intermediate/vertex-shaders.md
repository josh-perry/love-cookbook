---
title: "Vertex Shaders"
authors: [Jasper]
date: 2025-03-21
---
> [!CAUTION]
> This guide is made for LÖVE 12.0!

Vertex shaders are programs which calculate the final position of a vertex on screen.

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
it's the [matrix](#Matrices) which stores the current coordinate system transform, so translation, rotation and scale and the [projection matrix](#Projection-Matrix).         
By default LÖVE uses an [orthographic](#Orthographic) [projection matrix](#Projection-Matrix) which goes [-10, 10] on the z-axis, meaning if objects are outside of that range, they won't be visible anymore.        
This is because the z values of the pixels will lie outside of the [-1 to 1] range and GLSL will skip drawing those.

`vec4 vertex_position` is the input vertex's position, by default `w = 1`, any time a position is multiplied with a [projection matrix](#Projection-Matrix), it should be `1` otherwise it will cause issues.

Let's do some shader magic and create a vertex shader which automatically covers the entire screen with a single triangle, instead of having to create a 1x1 image like we did before.

## Fullscreen triangle

One thing to note is that this shader is written with `void vertexmain` instead of `vec4 position`, because we don't need the parameters it provides us.

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