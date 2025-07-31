---
title: "AABB"
authors: [ellraiser]
date: 2025-07-31
---

AABB stands for "Axis Aligned Bounding Box", and is a way of checking whether two objects are overlapping.

For game development, it can be used for a whole host of things, from checking if the cursor is hovering over a specific UI element, to deciding if a player has collided with a solid object, or whether an enemy attack has hit the player.

## Bounding Boxes
A bounding box is simply a square or rectangle that represents the boundary of a given thing. By using a bounding box you can seperate collision logic from the size of the sprites being drawn.

A simple representation of a bounding box could look like this, shortened to `bbox` in the table:
```lua
-- button 'object'
local button = {
  x = 10,
  y = 20,
  w = 100,
  h = 32,
  bbox = {
    x1 = -4,
    x2 = 104,
    y1 = -4,
    y2 = 36
  }
}

-- draw button + bounding box
love.draw = function()
  love.graphics.setColor(1, 0, 0, 1)
  love.graphics.rectangle('fill', button.x, button.y, button.w, button.h)
  love.graphics.setColor(1, 1, 1, 1)
  local bbox = button.bbox
  love.graphics.rectangle('line', button.x+bbox.x1, button.y+bbox.y1, bbox.x2-bbox.x1, bbox.y2-bbox.y1)
end
```

If you ran the code above you'd see the the following:   
{% love 800, 600 %}
local button = {
  x = 10,
  y = 20,
  w = 100,
  h = 32,
  bbox = {
    x1 = -4,
    x2 = 104,
    y1 = -4,
    y2 = 36
  }
}
love.draw = function()
  love.graphics.setColor(1, 0, 0, 1)
  love.graphics.rectangle('fill', button.x, button.y, button.w, button.h)
  love.graphics.setColor(1, 1, 1, 1)
  local bbox = button.bbox
  love.graphics.rectangle('line', button.x+bbox.x1, button.y+bbox.y1, bbox.x2-bbox.x1, bbox.y2-bbox.y1)
end
{% endlove %}

The idea here is we have a 100px x 32px 'button', but we want to make it a bit easier for a player to click it as it's quite small.   
Our bounding box is defined as being 4px bigger in all directions, related to the button's own x + y position.

We could have defined the bbox with exact co-ordinates relative to our x=10, y=20, i.e.:
```lua
bbox = {
  x1 = 6, -- x = 10, -4
  x2 = 114, -- x = 10, +100, +4
  y1 = 16, -- y = 20, -4
  y2 = 56 -- y = 20, +32, +4
}
```
However if your button get's moved (for example, when the window is resized), these bounding box values would be wrong and need updating.   
By storing relative bounding box values, we can easily calculate the bounding box's actual values when needed.

If you wanted you could even make a function for it:
```lua
-- button 'object'
local button = { 
  x = 10, y = 20, w = 100, h = 32,
  bbox = { 
    x1 = -4, 
    x2 = 104, 
    y1 = -4, 
    y2 = 36 
  }
}

-- get bbox for an object
function getBbox(obj)
  return {
    x1 = obj.x + obj.bbox.x1,
    x2 = obj.x + obj.bbox.x1 + obj.bbox.x2,
    y1 = obj.y + obj.bbox.y1,
    y2 = obj.y + obj.bbox.y1 + obj.bbox.y2,
    w = obj.bbox.x2 - obj.bbox.x1,
    h = obj.bbox.y2 - obj.bbox.y1
  }
end

-- draw button + it's bbox
love.draw = function()
  love.graphics.setColor(1, 0, 0, 1)
  love.graphics.rectangle('fill', button.x, button.y, button.w, button.h)
  love.graphics.setColor(1, 1, 1, 1)
  local bbox = getBbox(button)
  love.graphics.rectangle('line', bbox.x1, bbox.y1, bbox.w, bbox.h)
end
```
This means that even if our button position got moved around it would still be accurate.

Now we have a bounding box, we can use it to check for collisions - whether that's with a point or with another bounding box.


## Point Collision
To check if a given point is inside a bounding box, we can simply check that the point falls 'inside' the box.   
We can do this by simply check all four points:
```lua
function inBounds(px, py, bx1, bx2, by1, by2)
  return px >= bx1 and px <= bx2 and py >= by1 and py <= by2
end
```
Essentially we're checking first if the point's x position is between the bounding box's left and right planes.  
Then we're checking if the point's y position is between the top and bottom planes.

If a point is inside the bounding box, all four conditions would be true.

Let's use our button from earlier, but now introduce a check using the mouse position:
```lua
-- button 'object'
local button = { 
  x = 10, y = 20, w = 100, h = 32,
  highlighted = false,
  bbox = { 
    x1 = -4, 
    x2 = 104, 
    y1 = -4, 
    y2 = 36 
  }
}

-- get bbox for an object
function getBbox(obj)
  return {
    x1 = obj.x + obj.bbox.x1,
    x2 = obj.x + obj.bbox.x1 + obj.bbox.x2,
    y1 = obj.y + obj.bbox.y1,
    y2 = obj.y + obj.bbox.y1 + obj.bbox.y2,
    w = obj.bbox.x2 - obj.bbox.x1,
    h = obj.bbox.y2 - obj.bbox.y1
  }
end

-- check if point is in a bbox bounding
function inBounds(px, py, bbox)
  return px >= bbox.x1 and px <= bbox.x2 and py >= bbox.y1 and py <= bbox.y2
end

-- draw button
love.draw = function()
  if button.highlighted then
    love.graphics.setColor(1, 0, 0, 1)
  else
    love.graphics.setColor(0, 1, 0, 1)
  end
  love.graphics.rectangle('fill', button.x, button.y, button.w, button.h)
  love.graphics.setColor(1, 1, 1, 1)
end

-- check mouse position overlapping button
love.update = function()
  button.highlighted = inBounds(love.mouse.getX(), love.mouse.getY(), getBbox(button))
end
```
Now when you hover the mouse position over the button, it changes from green to red!

You also might have noticed we stopped drawing the bounding box in the last example - it's useful to draw it when you're in development so you can sense-check your collisions, but once they're working you probably don't want to draw them!

As we now know when the button is highlighted, we could then run some logic in a mouse press event to handle the button being 'clicked!'   
If we add some additional code like:
```lua
love.mousepressed = function()
  -- if button is selected
  if button.highlighted == true then
    -- move button to another position on the screen (screen size is 800x600)
    -- need to account for the button size so we dont move it offscreen
    button.x = love.math.random(0, 800-100)
    button.y = love.math.random(0, 600-32)
  end
end
```
Then anytime we click the button it'll move! You can try it out below:   
{% love 800, 600 %}
-- button 'object'
local button = { 
  x = 10, y = 20, w = 100, h = 32,
  highlighted = false,
  bbox = { 
    x1 = -4, 
    x2 = 104, 
    y1 = -4, 
    y2 = 36 
  }
}

-- get bbox for an object
function getBbox(obj)
  return {
    x1 = obj.x + obj.bbox.x1,
    x2 = obj.x + obj.bbox.x1 + obj.bbox.x2,
    y1 = obj.y + obj.bbox.y1,
    y2 = obj.y + obj.bbox.y1 + obj.bbox.y2,
    w = obj.bbox.x2 - obj.bbox.x1,
    h = obj.bbox.y2 - obj.bbox.y1
  }
end

-- check if point is in a bbox bounding
function inBounds(px, py, bbox)
  return px >= bbox.x1 and px <= bbox.x2 and py >= bbox.y1 and py <= bbox.y2
end

-- draw button + it's bbox
love.draw = function()
  if button.highlighted then
    love.graphics.setColor(1, 0, 0, 1)
  else
    love.graphics.setColor(0, 1, 0, 1)
  end
  love.graphics.rectangle('fill', button.x, button.y, button.w, button.h)
  love.graphics.setColor(1, 1, 1, 1)
end

-- check mouse position overlapping button
love.update = function()
  button.highlighted = inBounds(love.mouse.getX(), love.mouse.getY(), getBbox(button))
end

love.mousepressed = function()
  -- if button is selected
  if button.highlighted == true then
    -- move button to another position on the screen (screen size is 800x600)
    -- need to account for the button size so we dont move it offscreen
    button.x = love.math.random(0, 800-100)
    button.y = love.math.random(0, 600-32)
  end
end
{% endlove %}

Checking point collision is the cornerstone of any game UI, as all your UI elements will have their own bounding box that may or may not match the sprite drawn.  
You can then go through all your UI elements checking the mouse position to find out which is currently highlighted for interaction.


## Box Collision
Say we don't have a point but instead we have two bounding boxes, say a player and a wall.  
We don't have a single point to check anymore, instead we have four points!

Of course, we could simply just check each of the four points of the other bounding box in the same way we checked a single one:
```lua
function inBounds(px, py, bbox)
  return px >= bbox.x1 and px <= bbox.x2 and py >= bbox.y1 and py <= bbox.y2
end

local bbox1 = { x1 = 10, y1 = 10, x2 = 42, y1 = 42}
local bbox2 = { x1 = 20, y1 = 20, x2 = 52, y1 = 52}

local check_tl = inBounds(bbox2.x1, bbox2.y1, bbox1)
local check_tr = inBounds(bbox2.x2, bbox2.y1, bbox1)
local check_bl = inBounds(bbox2.x1, bbox2.y2, bbox1)
local check_br = inBounds(bbox2.x2, bbox2.y2, bbox1)

if check_tl or check_tr or check_bl or checkbr then
  print('boxes overlap!')
end
```
This would work fine, however there is an easier formula we can use to save having to check all the points in that way.

We can do this by simplfying the checks we do by considering the following:
- If Box #1's left edge (b1.x1) is to the right of Box #2's right edge (b2.x2) - then Box #1 is on the right of Box #2  
- If Box #1's right edge (b1.x2) is to the left of Box #2's left edge (b2.x1) - then Box #1 is on the left of Box #2  

Similarly for the y co-ordinates:
- If Box #1's top edge (b1.y1) is below Box #2's bottom edge (b2.y2) - then Box #1 is below Box #2  
- If Box #1's bottom edge (b1.y2) is below Box #2's top edge (b2.y1) - then Box #1 is above Box #2  

All four of these statements would mean that an overlap is impossible, so any one of these checks being true means the boxes are not overlapping:
```lua
local bbox1 = { x1 = 10, y1 = 10, x2 = 42, y2 = 42}
local bbox2 = { x1 = 20, y1 = 20, x2 = 52, y2 = 52}

function not_overlapping(b1, b2)
  return b1.x1 >= b2.x2 or b1.x2 <= b2.x1 or b1.y1 >= b2.y2 or b1.y2 <= b2.y1
end

print(not_overlapping(bbox1, bbox2)) -- false, the boxes ARE overlapping
```

We can use the inverse of these statements to make a formula for overlapping:
```lua
local bbox1 = { x1 = 10, y1 = 10, x2 = 42, y2 = 42}
local bbox2 = { x1 = 20, y1 = 20, x2 = 52, y2 = 52}

function overlapping(b1, b2)
  return b1.x1 < b2.x2 and b1.x2 > b2.x1 and b1.y1 < b2.y2 and b1.y2 > b2.y1
end

print(overlapping(bbox1, bbox2)) -- true, the boxes are overlapping
```

Let's make a quick example to see that in action - we'll make a bunch of boxes on screen each with different positions and sizes.

Then we'll check all the boxes that are overlapping with another box and change their color.
```lua
-- check overlapping
function overlapping(b1, b2)
  return b1.x1 < b2.x2 and b1.x2 > b2.x1 and b1.y1 < b2.y2 and b1.y2 > b2.y1
end

-- make 100 random boxes
local boxes = {}
function makeBoxes()
  boxes = {} -- clear
  for i=1,100 do
    -- random boxes in screen bounds
    local x = love.math.random(0, 800-32)
    local y = love.math.random(0, 600-32)
    local w = love.math.random(16, 32)
    local h = love.math.random(16, 32)
    table.insert(boxes, {
      x1 = x,
      y1 = y,
      x2 = x+w,
      y2 = y+h,
      w = w,
      h = h,
      overlapping = false,
    })
  end
end

-- for each box, check every other box if overlapping
function checkBoxes()
  for b=1,#boxes do
    for o=1,#boxes do
      if boxes[b] ~= boxes[o] and overlapping(boxes[b], boxes[o]) then
        boxes[b].overlapping = true
      end
    end
  end
end

-- make boxes and check on load
love.load = function()
  makeBoxes()
  checkBoxes()
end

-- draw boxes
love.draw = function()
  for b=1,#boxes do
    local box = boxes[b]
    love.graphics.setColor(0.1, 0.1, 0.1, 1)
    if box.overlapping then
      love.graphics.setColor(1, 0, 1, 1)
    end
    love.graphics.rectangle('fill', box.x1, box.y1, box.w, box.h)
    love.graphics.setColor(1, 1, 1, 1)
    love.graphics.rectangle('line', box.x1, box.y1, box.w, box.h)
  end
end

-- make new boxes if pressing space
love.keypressed = function(k)
  if k == 'space' then
    makeBoxes()
    checkBoxes()
  end
end
```

You can try it out below! Press 'Space' to re-create the boxes in new positions.  
Any boxes that overlap will be rendered in pink - the bounding box lines are also drawn to make things clearer.

{% love 800, 600 %}
-- check overlapping
function overlapping(b1, b2)
  return b1.x1 < b2.x2 and b1.x2 > b2.x1 and b1.y1 < b2.y2 and b1.y2 > b2.y1
end

-- make 100 random boxes
local boxes = {}
function makeBoxes()
  boxes = {} -- clear
  for i=1,100 do
    -- random boxes in screen bounds
    local x = love.math.random(0, 800-32)
    local y = love.math.random(0, 600-32)
    local w = love.math.random(16, 32)
    local h = love.math.random(16, 32)
    table.insert(boxes, {
      x1 = x,
      y1 = y,
      x2 = x+w,
      y2 = y+h,
      w = w,
      h = h,
      overlapping = false,
    })
  end
end

-- for each box, check every other box if overlapping
function checkBoxes()
  for b=1,#boxes do
    for o=1,#boxes do
      if boxes[b] ~= boxes[o] and overlapping(boxes[b], boxes[o]) then
        boxes[b].overlapping = true
      end
    end
  end
end

-- make boxes and check on load
love.load = function()
  makeBoxes()
  checkBoxes()
end

-- draw boxes
love.draw = function()
  for b=1,#boxes do
    local box = boxes[b]
    love.graphics.setColor(0.1, 0.1, 0.1, 1)
    if box.overlapping then
      love.graphics.setColor(1, 0, 1, 1)
    end
    love.graphics.rectangle('fill', box.x1, box.y1, box.w, box.h)
    love.graphics.setColor(1, 1, 1, 1)
    love.graphics.rectangle('line', box.x1, box.y1, box.w, box.h)
  end
end

-- make new boxes if pressing space
love.keypressed = function(k)
  if k == 'space' then
    makeBoxes()
    checkBoxes()
  end
end
{% endlove %}

For an even more advanced example, let's have all the boxes moving around and then when they're colliding they can light up.

For our movement, we'll simply give each box an angle and a speed, and have them bounce when they hit the boundaries of the window.  
Then every frame we can check each box agaisnt all over boxes for whether it's overlapping with something or not:

```lua
-- check overlapping
function overlapping(b1, b2)
  return b1.x1 < b2.x2 and b1.x2 > b2.x1 and b1.y1 < b2.y2 and b1.y2 > b2.y1
end

-- make boxes
local boxes = {}
love.load = function()
  for i=1,100 do
    -- random boxes in screen bounds
    local x = love.math.random(0, 800-32)
    local y = love.math.random(0, 600-32)
    table.insert(boxes, {
      x1 = x,
      y1 = y,
      x2 = x+16,
      y2 = y+16,
      w = 16,
      h = 16,
      angle = math.rad(love.math.random(0, 360)),
      speed = 1,
      overlapping = false,
    })
  end
end

-- update boxes
love.update = function()
  for b=1,#boxes do
    local box = boxes[b]
    -- calculate delta based on angle
    local vy = math.sin(box.angle) * box.speed
    local vx = math.cos(box.angle) * box.speed
    box.x1 = box.x1 + vx
    box.y1 = box.y1 + vy
    -- update x2/y2 as our box has moved so our bounding box has too
    box.x2 = box.x1 + box.w
    box.y2 = box.y1 + box.h
    -- check overlap with other boxes
    local overlap = false
    for o=1,#boxes do
      if boxes[b] ~= boxes[o] and overlapping(boxes[b], boxes[o]) then
        overlap = true
        break
      end
    end
    box.overlapping = overlap
    -- bounce if we hit the edge of the screen
    if box.x1 <= 0 or box.x2 >= 800 then
      box.angle = box.angle * math.pi
    end
    if box.y1 <= 0 or box.y2 >= 600 then
      box.angle = box.angle * (2*math.pi)
    end
  end
end

-- draw boxes
love.draw = function()
  for b=1,#boxes do
    local box = boxes[b]
    love.graphics.setColor(0.1, 0.1, 0.1, 1)
    if box.overlapping then
      love.graphics.setColor(1, 0, 1, 1)
    end
    love.graphics.rectangle('fill', box.x1, box.y1, box.w, box.h)
    love.graphics.setColor(1, 1, 1, 1)
    love.graphics.rectangle('line', box.x1, box.y1, box.w, box.h)
  end
end
```

You can try it out below here:  
{% love 800, 600 %}
-- check overlapping
function overlapping(b1, b2)
  return b1.x1 < b2.x2 and b1.x2 > b2.x1 and b1.y1 < b2.y2 and b1.y2 > b2.y1
end

-- make boxes
local boxes = {}
love.load = function()
  for i=1,100 do
    -- random boxes in screen bounds
    local x = love.math.random(0, 800-32)
    local y = love.math.random(0, 600-32)
    table.insert(boxes, {
      x1 = x,
      y1 = y,
      x2 = x+16,
      y2 = y+16,
      w = 16,
      h = 16,
      angle = math.rad(love.math.random(0, 360)),
      speed = 1,
      overlapping = false,
    })
  end
end

-- update boxes
love.update = function()
  for b=1,#boxes do
    local box = boxes[b]
    -- calculate delta based on angle
    local vy = math.sin(box.angle) * box.speed
    local vx = math.cos(box.angle) * box.speed
    box.x1 = box.x1 + vx
    box.y1 = box.y1 + vy
    -- update x2/y2 as our box has moved so our bounding box has too
    box.x2 = box.x1 + box.w
    box.y2 = box.y1 + box.h
    -- check overlap with other boxes
    local overlap = false
    for o=1,#boxes do
      if boxes[b] ~= boxes[o] and overlapping(boxes[b], boxes[o]) then
        overlap = true
        break
      end
    end
    box.overlapping = overlap
    -- bounce if we hit the edge of the screen
    if box.x1 <= 0 then
      box.angle = box.angle * math.pi
      box.x1 = 0
    end
    if box.x2 >= 800 then
      box.angle = box.angle * math.pi
      box.x1 = 800-16
    end
    if box.y1 <= 0 then
      box.angle = box.angle * (2*math.pi)
      box.y1 = 0
    end
    if box.y2 >= 600 then
      box.angle = box.angle * (2*math.pi)
      box.y2 = 600-16
    end
  end
end

-- draw boxes
love.draw = function()
  for b=1,#boxes do
    local box = boxes[b]
    love.graphics.setColor(0.1, 0.1, 0.1, 1)
    if box.overlapping then
      love.graphics.setColor(1, 0, 1, 1)
    end
    love.graphics.rectangle('fill', box.x1, box.y1, box.w, box.h)
    love.graphics.setColor(1, 1, 1, 1)
    love.graphics.rectangle('line', box.x1, box.y1, box.w, box.h)
  end
end
{% endlove %}

You may be thinking that it's a lot for you to be checking potentially 100 boxes per box every frame - however computers are very fast.  
That being said, if you start having a lot of different objects, then it'll be better to start looking into ways to group them together into areas or chunks, or exlude some objects from checks (like say if they were offscreen). That way you can reduce the number of checks that are needed per box by reducing the number of possible boxes it can collide with.

AABB is great for some basic collision checking (say for a top-down game), or for handling your GUI elements and interacting with them, but when it comes to more complex physics, you should look more at the `love.physics` module which uses something called Box2D to model physics. 

This will give you a lot more control over the types of collisions and you can better handle things colliding and reacting 'realistically'.
