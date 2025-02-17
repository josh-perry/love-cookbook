---
title: "Getting started"
author: "Nykenik24"
date: 2025-02-15
layout: guide.njk
tags: guide
---

Hi there! LÖVE is an *awesome* framework you can use to make 2D games in Lua. It's free, open-source, and works on Windows, macOS, Linux, Android and iOS.

## Community
If you get stuck, many friendly people are ready to help you at the forums. Be warned, however, that it sometimes gets too friendly.

People also post their games and projects on [the forums](https://love2d.org/forums/), so it's a nice way of exploring what LÖVE can do. Or at least what people choose to use it for.

There is also a [Discord server](https://discord.gg/rhUets9) and a [subreddit](https://www.reddit.com/r/love2d).

Get in touch with us on twitter [@obey_love](https://twitter.com/obey_love).

## Open source
LÖVE is licensed under the liberal zlib/libpng license. This means that:

- It costs nothing.
- You can use it freely for commercial purposes with no limitations.

The source can be found on [GitHub](https://github.com/love2d/love).

## A little example

In this example we will see how to draw text to the screen!
```lua
-- in main.lua
function love.draw()
    love.graphics.print("Hello, World!", 400, 300)
end
```
This will show this:

![Hello, World!](https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwangoon.github.io%2Fstatic%2F5cc320a5cabfb4ab334f3cbc9fdcc797%2Fad00e%2Flove2d-hello.png&f=1&nofb=1&ipt=40ee5cdd995f77a64d1162773193ac85b12fed8f568f602d8c95d78d79f68b8d&ipo=images)