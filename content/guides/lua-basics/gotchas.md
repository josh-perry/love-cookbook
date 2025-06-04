---
title: "Gotchas"
authors: [ellraiser]
date: 2025-05-21
description: "Some common 'gotchas' when using Lua"
---

Like all coding languages, Lua has a few 'gotchas' that are worth knowing about, especially if you're coming from another coding language where you might have expectations of certain syntax or functionality.  

These are some of the more common ones worth remembering.


## Arrays Start At 1
In Lua, all arrays start at 1, rather than the standard convention in most languages to start at 0.  
This means to access the first item in a list, you need to specify `array[1]` not `array[0]`:

```lua
-- print the first item in a list
local mascots = {'whale', 'duckloon', 'supertoast'}
print('The first item is:', mascots[1])

-- this would print 'nil'
print('The first item is not:', mascots[0])
```

## Not Equals To
In a lot of languages, 'not equals to' is represented by `!=`.  
However in Lua, that would be invalid syntax, and instead you need to use `~=`

```lua
local mascots = {'whale', 'duckloon', 'supertoast'}
-- remember, list index starts at 1!
for i=1, #mascots do
  if mascots[i] ~= 'whale' then
    print(mascots[i], ' is not a whale!')
  end
end
```

## String Concatenation
In lots of languages, combining two strings together is as simple as using the `+` symbol.  
However, Lua and will scold you for attempting to 'add' two strings together, as `+` is seen as a purely mathmatical operation.

To combine two strings, you instead need to use two dots - `..`:
```lua
local first = 'L'
local second = 'Ö'
local third = 'V'
local fourth = 'E'

local bestFramework = first .. second .. third .. fourth
print(bestFramework) -- will print 'LÖVE'
```

One handy thing Lua does do though, is any number used with the concatenation operator will automatically convert it to a string:
```lua
local scale = 'Fahrenheit'
local temperature = 451

local result = scale .. ' ' .. temperature
print(result) -- will print 'Fahrenheit 451'
```

Keep this in mind if you accidentally use the concatenation operator with 2 numbers, as `1+1` will give `2`, but `1..1` will give `'11'`.

## Operator Assignments
In many languages, operator assignments allow you to do shorthands for modifying or iterating on a variable.  
In Lua, these operators, such as `+=`, `*=` and `++`, do not exist.

Instead you have to use the variable again in your assignment:
```lua
local count = 0
for i=1,100 do
  -- in other languages you might do 'count += 1' or 'count ++'
  -- no such luck here im afraid!
  count = count + 1 
end
```

## Global Variables
In some languages, defining globals is explicit - like in C where you might write `global thing`.  
In Lua, unless you use `local` your variable will be global by default!

This can lead to unintended issues, for example overwriting the wrong variable, so it's best to use `local` unless you specifically need that variable to have global access.

```lua
-- without the 'local' modifyer this is now a global!
name = 'LÖVE' 
-- this means you could access it via the global table
print(_G['name'])
-- but it's a global so you can access it just from the variable name too
print(name)

-- use 'local' to make sure it doesn't interfere with other variables or keep it in scope
local mascot = 'Whale'
print(_G['mascot']) -- will be nil
```

## Truthy/Falsey
Different languages have different opinions on what is a "truthy" value and what is a "falsey" value - i.e. values that will return `true` or `false`.

In Lua, only `false` and `nil` are considered "falsey" - everything else is considered true!
```lua
local truthy = true
local falsey = false
local null = nil
local zero = 0
local empty = ''

if null then print('nil is false') end -- won't print, null is false
if falsey then print('false is false') end -- won't print, false is false

if truthy then print('true is true!') end -- will print, true is true
if empty then print('empty is true!') end -- will print, empty string is true
if zero then print('0 is true') end -- will print, 0 is true!
```

## Multiple Returns
In Lua, functions can return multiple values!  
You can access the returned variables using a list of variables assignment:
```lua
local function doThing()
  return 'whale', 'duckloon'
end
local a, b = doThing()
print(a, b) -- will print 'whale' and 'duckloon'

-- we can also store this in a table:
local result = {doThing()}
-- result is now {'whale', 'duckloon'}
print(result[1]) -- will print 'whale'
```

If you only need the first variable from a function that returns multiple values, you can do a few options:
```lua
local function doThing()
  return 'whale', 'duckloon'
end
-- Option A: just only specify one variable with the return
local a = doThing()
print(a) -- will print 'whale'

-- Option B: add extra brackets
local b, c = (doThing())
print(b, c) -- will print 'whale' and nil
```

It's also worth noting that using a function that returns multiple variables as an argument to another function can have some unintended results:
```lua
local function rollDice()
  return 6, 6
end
local function multiplyResult(value1, value2, mult)
  return (value1 + value2) * (mult or 10)
end

-- this evaluates as multiplyResult(6, 6, nil)
local resultA = multiplyResult(rollDice())
print(resultA) -- 120

-- however this evaluates as multiplyResult(6, 10, nil) - the second returned value is lost!
local resultB = multiplyResult(rollDice(), 10)
print(resultB) -- 160
```
