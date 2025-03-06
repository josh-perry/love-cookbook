---
title: "Playing Audio"
authors: [Dim]
date: 2025-03-04
---

Playing audio is done with:
```lua
love.audio.play(source)
```

`source` is an object of type `Source` which represents audio which we can play.

To create a `Source` we:
```lua
local sound = love.audio.newSource(filename, sourceType)
```

``filename`` is the relative path to the audio file in our project directory.

`sourceType` is a string constant that affects how the audio file will be decoded. Valid constants are `"static"`, `"stream"`, and `"queue"`.
* `"static"`: is used for shorter audio like sound effects.
* `"stream"`: is used for longer audio like music.
* `"queue"`: is unique from the other two in its usage and is outside the scope of this article.


Altogether to play audio we:
```lua
local source = love.audio.newSource(filename, sourceType)
love.audio.play(source)
```


For example:
```lua
local sfx = love.audio.newSource("assets/chirp.ogg", "static")
local music = love.audio.newSource("assets/bach.ogg", "stream")

love.audio.play(sfx)
love.audio.play(music)
```

Of course, we can do more than just play audio with love.audio and sources.

We can pause it with:
```lua
love.audio.pause(source)
```

And we can stop and rewind it to the beginning with:
```lua
love.audio.stop(source)
```

We can also set the master volume with:
```lua
love.audio.setVolume(volume)
```
where `volume` is a number.

It's important to note that we can not set the volume of a specified
source with `love.audio.setVolume`. But, as `Source` is an object, it has methods that invoked in much the same way as ``love.audio``.

For instance:
```lua
source:play()
source:pause()
source:stop()
```

So to set the volume of a specified source without affecting master volume.
```lua
source:setVolume(volume)
```

Finally, should we want to make a source repeatedly restart and replay when it reaches the end of the audio we:
```lua
source:setLooping(true)
```

This is just a basic demonstration. We can find that there is we can do with `love.audio` and object type ``Source`` in the documentation on the wiki:

* [https://love2d.org/wiki/love.audio](https://love2d.org/wiki/love.audio)
* [https://love2d.org/wiki/Source](https://love2d.org/wiki/Source)

Below is an interactive example of audio usage:

```lua
local sfx = love.audio.newSource("assets/chirp.ogg", "static")
local music = love.audio.newSource("assets/bach.ogg", "stream")

function love.keypressed(_, scancode)
	local k = love.keyboard.getKeyFromScancode(scancode)

	if k == "up" then
		local volume = love.audio.getVolume()
		love.audio.setVolume(math.min(volume + 0.1, 1))
	elseif k == "down" then
		local volume = love.audio.getVolume()
		love.audio.setVolume(math.max(volume - 0.1, 0))
	end

	if k == "return" then
		if not music:isPlaying() then
			music:play()
		else
			music:pause()
		end
	end

	if k == "space" then
		sfx:play()
	end
end

function love.draw()
	love.graphics.print("Master", 0, 0)
	love.graphics.print(("Volume: %0.2f"):format(love.audio.getVolume()), 0, 16)

	local function drawSourceInfo(source, name, x, y)
		local info = {
			name,
			("Playing: %s")  :format(source:isPlaying()),
			("Volume: %0.2f"):format(source:getVolume()),
			("Time: %0.2fs") :format(source:tell("seconds")),
		}

		for i, v in ipairs(info) do
			love.graphics.print(v, x, y+(i-1)*16)
		end
	end
	drawSourceInfo(music, "Music", 100, 0)
	drawSourceInfo(sfx, "SFX", 200, 0)

	local function translateUSKeyboardKey(k)
		return love.keyboard.getKeyFromScancode(love.keyboard.getScancodeFromKey(k))
	end

	love.graphics.print(
		("%s/%s to adjust master volume."):format(
			translateUSKeyboardKey("up"),
			translateUSKeyboardKey("down")
		),
		0, 100
	)
	love.graphics.print(
		("%s to toggle music state."):format(
			translateUSKeyboardKey("return")
		),
		0, 116
	)
	love.graphics.print(
		("%s to play sfx."):format(
			translateUSKeyboardKey("space")
		),
		0, 132
	)
end
```

{% love 300, 300 %}
local sfx = love.audio.newSource("assets/chirp.ogg", "static")
local music = love.audio.newSource("assets/bach.ogg", "stream")

function love.keypressed(_, scancode)
	local k = love.keyboard.getKeyFromScancode(scancode)

	if k == "up" then
		local volume = love.audio.getVolume()
		love.audio.setVolume(math.min(volume + 0.1, 1))
	elseif k == "down" then
		local volume = love.audio.getVolume()
		love.audio.setVolume(math.max(volume - 0.1, 0))
	end

	if k == "return" then
		if not music:isPlaying() then
			music:play()
		else
			music:pause()
		end
	end

	if k == "space" then
		sfx:play()
	end
end

function love.draw()
	love.graphics.print("Master", 0, 0)
	love.graphics.print(("Volume: %0.2f"):format(love.audio.getVolume()), 0, 16)

	local function drawSourceInfo(source, name, x, y)
		local info = {
			name,
			("Playing: %s")  :format(tostring(source:isPlaying())),
			("Volume: %0.2f"):format(source:getVolume()),
			("Time: %0.2fs") :format(source:tell("seconds")),
		}

		for i, v in ipairs(info) do
			love.graphics.print(v, x, y+(i-1)*16)
		end
	end
	drawSourceInfo(music, "Music", 100, 0)
	drawSourceInfo(sfx, "SFX", 200, 0)

	local function translateUSKeyboardKey(k)
		return love.keyboard.getKeyFromScancode(love.keyboard.getScancodeFromKey(k))
	end

	love.graphics.print(
		("%s/%s to adjust master volume."):format(
			translateUSKeyboardKey("up"),
			translateUSKeyboardKey("down")
		),
		0, 100
	)
	love.graphics.print(
		("%s to toggle music state."):format(
			translateUSKeyboardKey("return")
		),
		0, 116
	)
	love.graphics.print(
		("%s to play sfx."):format(
			translateUSKeyboardKey("space")
		),
		0, 132
	)
end
{% endlove %}