---
title: "Tables and For-loops"
authors: [Sheepolution]
date: 2025-02-20
---

**Tables** are a type of value in which you can store multiple values. We create a table by using curly braces.

```lua
local fruits = {}
```

Now that we have a table, we can fill it with values. There are multiple ways to do this. We can put in the values as we create the table.

```lua
local fruits = { "apple", "pear", "tomato" }
```

Or we can use `table.insert(table, value)`. The first argument we pass is the table, and the second argument is the value you want to insert.

```lua
local fruits = {}

table.insert(fruits, "apple")
table.insert(fruits, "pear")
table.insert(fruits, "tomato")
```

If you print `fruits`, you will see something like this:

```lua
local fruits = { "apple", "pear", "tomato" }
print(fruits) -- Output: table: 0x02b857e46f68
```

`table: 0x02b857e46f68` tells us that this is a table, and where in your memory it is located. That is not very useful to us. We want to know what is *inside* the table.

Our table is like a sequence, or a list. Instead of printing the entire table, let's print the first item in the list. We can do this by using square brackets.

```lua
local fruits = { "apple", "pear", "tomato" }
print(fruits[1]) -- Output: "apple"
```

The number at which an item is stored is called the <ins>index</ins>. So `"apple"` is on the first index.

If we want to print all the values, we *could* print them one by one.

```lua
local fruits = { "apple", "pear", "tomato" }
print(fruits[1]) -- Output: "apple"
print(fruits[2]) -- Output: "pear"
print(fruits[3]) -- Output: "tomato"
```

But this is very inefficient. Imagine if we had a hundred items. Luckily, there is a better way.

## For-loops

A **for-loop** is a type of statement that allows you to repeat certain code a number of times.

```lua
for i = 1, 10 do
    print("Hello!") -- Output: Hello! (x10)
end
```

This for-loop repeats 10 times. A single repetition is called an <ins>iteration</ins>.

An if-statement asks for one parameter, a condition. A for-loop asks for two parameters, separated by a comma.

> [!NOTE]
> "Parameter" here is not to be confused with function parameters. In this context it means what we provide to the statement.

* With `i = 1`, the `i` is the variable we will be using, and `1` is the starting number.
* `10` is the number up to which the for-loop will repeat.

The variable `i` will increase by 1 for each iteration

```lua
for i = 1, 3 do
    print(i) -- Output: 1, 2, 3
end
```

Because `i` is a variable, we can name it whatever we want.

```lua
for whale = 4, 8 do
    print(whale) -- Output: 4, 5, 6, 7, 8
end
```

> [!TIP]
> There is a third, optional parameter. This sets by how much the variable `i` increases.
> ```lua
> for i = -5, 20, 5 do
>     print(i) -- Output: -5, 0, 5, 10, 15, 20
> end

The variable is only available inside the for-loop.

```lua
for i = 1, 5 do
    print(i) -- Output: 1, 2, 3, 4, 5
end

print(i) -- Output: nil
```

### While-loops

Besides the for-loops there is also a **while-loop**. It's like an if-statement and for-loop combined.

```lua
local a = 0

while a < 5 do
    a = a + 1
    print(a) -- Output: 1, 2, 3, 4, 5
end
```

The loop repeats as long as the condition is true.

> [!WARNING]
> Be careful! If the condition never becomes false, the while-loop will repeat indefintely, causing LÖVE to hang.

It is possible to exit a loop early by using a `break`. It's somewhat similar to how you exit a function with `return`.

```lua
local a = 0

while true do
    a = a + 1
    print(a) -- Output: 1, 2, 3, 4, 5

    if a > 5 then
        break
    end
end

print("Escaped the infinite loop!")
```

A for-loop is useful when you know how many steps to take. A while-loop is useful when you know the end condition. For example, what if we want to calculate the power-of-2-sequence up to a million? We don't know how many steps it will take, but we do know when we want to end it.

```lua
local a = 1

while a < 1000000 do
    a = a * 2
    print(a) -- Output: 2, 4, 8, 16, 32, .... 524288, 1048576
end
```

There is one more type of loop. A **repeat-until loop**.

```lua
local x = 0

repeat
    x = x + 1
until x > 5
```

It's similar to a while loop, except it always executes what's inside the loop at least once.

> [!NOTE]
> Even if we won't use these alternative loops as much, it's good to know of their existence.

## Looping through tables

Now that we understand for-loops, we can use them to loop through our table.

```lua
local fruits = { "apple", "pear", "tomato" }

for i = 1, 3 do
    print(fruits[i]) -- Output: apple, pear, tomato
end
```

Now, even if we have a hundred items, we can go over them with ease.

We can get the number of items in our table by using a number sign. We can use this to dynamically set how often the for-loop should repeat.

```lua
local fruits = { "apple", "pear", "tomato" }

print(#fruits) -- Output: 3

for i = 1, #fruits do
    print(fruits[i]) -- Output: apple, pear, tomato
end
```

### ipairs

Because looping through a table is so common, Lua provides a shortcut for this. Using a <ins>for-in</ins> loop, and the standard function `ipairs` we can do the following:

```lua
local fruits = { "apple", "pear", "tomato" }

for i, v in ipairs(fruits) do
    print(i, v)
end

-- Output:
-- 1, apple
-- 2, pear
-- 3, tomato
```

This is the equivalent to:

```lua
local fruits = { "apple", "pear", "tomato" }

for i = 1, #fruits do
    local v = fruits[i]
    print(i, v)
end
```

The variable `i` becomes the index of that iteration, and the variable `v` becomes the value on that index.

> [!TIP]
> Again, `i` and `v` are variables, so we can name them whatever we want.
> ```lua
> for index, value of ipairs(fruits) do
> ```

## Editing tables

We have already learned that we can use `table.insert(table, value)` to insert a value into our table. Similarly, we can use `table.remove(table, index)` to remove a value.

```lua 3
local fruits = { "apple", "pear", "tomato" }

table.remove(fruits, 2) -- This removes "pear"

for i, v in ipairs(fruits) do
    print(v) -- Output: apple, tomato
end
```

We can edit a value, by referring to that value's index.

```lua 4
local fruits = { "apple", "pear", "tomato" }

-- Change the value on the second index to "banana".
fruits[2] = "banana"

for i, v in ipairs(fruits) do
    print(v) -- Output: apple, banana, tomato
end
```

This is also yet another way to add a value to our table.

```lua 4
local fruits = { "apple", "pear", "tomato" }

-- Change the value on the fourth index to "banana".
fruits[4] = "banana"

for i, v in ipairs(fruits) do
    print(v) -- Output: apple, pear, tomato, banana
end
```

> [!WARNING]
> Be careful when you set a value this way. If you leave a gap in the sequence, then Lua will be confused about how many items are in your table.
> ```lua
> local fruits = { "apple", "pear", "tomato" }
> fruits[10] = "banana"
> print(#fruits) -- Output: 3
> ```


## Objects

{% abstract "Objects are tables that use keys rather than indexes. We call these the object's properties." %}

Tables can be used as a list, where we use numbers as indexes, but we can also use strings as indexes.

```lua
local rectangle = {}
rectangle["width"] = 50
```

When using a string as the index, we call that a <ins>property</ins>. This property has `"width"` as its <ins>key</ins>, and `50` as its <ins>value</ins>.

A table with properties is also called an **Object**.

A shorter way to assign a property is to use a dot.

```lua
local rectangle = {}

rectangle.width = 50
print(rectangle.width) -- 50

-- We can still access it with the string.
print(rectangle["width"]) -- 50
```

We can also add properties when creating the table.

```lua
local rectangle = {
    x = 10,
    y = 20,
    width = 50,
    height = 120
}
```

> [!TIP]
> You can use any type of value as a table key. Yes, that includes functions and tables! Though you should probably keep it at numbers and strings.

### Pairs

We use `ipairs` for looping through a list table. We can use `pairs` for looping through an object table.

```lua
local rectangle = {}
rectangle.x = 10
rectangle.y = 20
rectangle.width = 50
rectangle.height = 120

for k, v in pairs(rectangle) do
    print(k, v)
end

-- Output:
-- width, 50
-- y, 20
-- height, 120
-- x, 10,
```

> [!WARNING]
> Though it's possible to use `pairs` for list tables as well, the order which you get the indexes is random. Because of this, you should always use `ipairs` for list tables.

## Usage

By using tables, we can store multiple items in a single variable. If we have multiple enemies in our game, we won't need to make a separate variable for each of them. We can store these enemies inside our table (and remove them when defeated).

In the demo below, we combine all the fundamentals we learned. We create a moving rectangle each time we press the left or right arrow key (make sure you click on it first). Based on the arrow key, it moves either left or right. 

> [!TIP]
> Don't be discouraged if you have trouble understanding the code below. Learning individual concepts is one thing, but learning how to use them combined is a challenge on its own. Reread the chapters, experiment with the demos, try to make things yourself, and dare to take the next step even if you feel like you're not ready. Because that's how you learn.

{% love 800, 200, true %}
-- We declare the local variable rectangles, and assign a table as its value.
local rectangeList = {}

-- We create the function createRectangle.
local function createRectangle(direction)

    -- We create a new local variable named rectangle.
    -- It won't be available outside of this function.
    local rectangle = {
        -- We make it an object, and give it these properties.
        x = 375,
        y = 20,
        width = 50,
        height = 120,
        -- This will be either "left" or "right",
        -- based on what is passed as argument.
        direction = direction
    }

    -- We return the rectangle
    return rectangle
end

function love.update()
    -- We loop through the list of rectangles
    for i, rectangle in ipairs(rectangeList) do
        -- Move the rectangle to the left or right based on its direction.
        if rectangle.direction == "left" then
            rectangle.x = rectangle.x - 1
        elseif rectangle.direction == "right" then
            rectangle.x = rectangle.x + 1
        end
    end
end

function love.draw()
    -- We loop through the list of rectangles
    for i, rectangle in ipairs(rectangeList) do
        -- Draw the rectangle using its properties.
        love.graphics.rectangle("fill", rectangle.x, rectangle.y,
            rectangle.width, rectangle.height)
    end
end

function love.keypressed(key)
    -- If the key pressed is not "left" and is not "right"...
    if key ~= "left" and key ~= "right" then
        -- Go out of this function.
        return
    end

    -- We are still here, so the key is either "left" or "right".
    -- Because of the 'return', we don't need to use an 'else'.

    -- Call createRectangle, and pass the key as argument.
    -- We add its returned value to the list of rectangles.
    table.insert(rectangeList, createRectangle(key))
end
{% endlove %}