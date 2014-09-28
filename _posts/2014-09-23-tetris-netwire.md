---
layout: post
title: Tetris in Haskell with Netwire and GLFW
comments: true
tags: 
    - unramblings
    - programming
---

<center><img src="/public/assets/tetris-hs.gif" style="padding: 1rem;" /></center>

A few weeks ago, I found myself on a ten hour plane journey, with nothing much to do[^apartfrom]. What better time, I thought to myself, than to hone my programming skills on a quick project? Why not a Tetris clone in Haskell? The fact that I was offline and so had no access to documentation only added to the challenge. I slid my laptop out of my bag, and got to work. 

<!--break-->

I had been working on a project involving GLFW and Netwire[^whynetwire] for a little time before my holiday, so these were the natural choices for the clone.

About halfway through the flight, things were hitting a crescendo. I'd just hit a conceptional FRP breakthrough, and was ready to implement it, when -- I run out of battery.

So, I wasn't able to finish it on that flight. But I was able to get it done on the way back! Take a look at the code [here](https://github.com/ScrambledEggsOnToast/tetris-hs). I will warn you that because I was under a time limit it isn't especially tidy. However I think it demonstrates enough FRP concepts to be useful as a reference.

Additionally, don't expect this to be a fully featured clone. There is only one level, no score is counted, controls don't exactly feel right, etc.

I've decided that I'm going to make this a regular thing for when I'm on a long flight or something similar. Perhaps next I'll make a Space Invaders clone, and maybe in one journey.

--- 

[^apartfrom]: Excluding reading, listening to music, watching movies, playing games, doing work, eating snacks or going to sleep. But other than that, nothing.
[^whynetwire]: Chosen after a laborious trial of many different FRP libraries -- and yet now I don't think I could give the exact reasons why
