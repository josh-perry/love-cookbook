---
title: "Tables"
authors: [Sheepolution]
date: 2025-02-19
---

Tables are a type of value in which you can store multiple values. We create a table by using curly braces.

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

A for-loop is a type of statement that allows you to repeat certain code a number of times.

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

## Editing tables

We have already learned that we can use `table.insert(table, value)` to insert value into our table. Similarly, we can use `table.remove(table, index)` to remove a value.

```lua
local fruits = { "apple", "pear", "tomato" }

table.remove(fruits, 2) -- This removes "pear"

for i = 1, #fruits do
    print(fruits[i]) -- Output: apple, tomato
end
```

We can edit a value, by accessing refering to that values index.

```lua
local fruits = { "apple", "pear", "tomato" }

-- Change the value on the second index to "banana".
fruits[2] = "banana"

for i = 1, #fruits do
    print(fruits[i]) -- Output: apple, banana, tomato
end
```

This is also yet another way to add a value to your table.

```lua
local fruits = { "apple", "pear", "tomato" }

-- Change the value on the fourth index to "banana".
fruits[4] = "banana"

for i = 1, #fruits do
    print(fruits[i]) -- Output: apple, banana, tomato, banana
end
```

> [!WARNING]
> Be careful when you set a value this way. If you leave a gap in the sequence, then Lua will be confused about how many items are in your table.
> ```lua
> local fruits = { "apple", "pear", "tomato" }
> fruits[10] = "banana"
> print(#fruits) -- Output: 3
> ```

## ipairs

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

## Usage

By using tables, we can store multiple items in a single variable. If we have multiple enemies in our game, we won't need to make a separate variable for each of them. We can store these enemies inside our table (and remove them when defeated).

In the demo below we add a string "hello" to our table each time we press space (make sure you click on it first). We use the variable `i` to position all the strings. For example, the fourth "hello" will be drawn on position `50 * 4`.

{% love 800, 100, true %}
local hellos = {}

function love.keypressed(key)
    if key == "space" then
        table.insert(hellos, "hello")
    end
end

function love.draw()
    for i, v in ipairs(hellos) do
        love.graphics.print(v .. i, 50 * i, 40)
    end
end
{% endlove %}