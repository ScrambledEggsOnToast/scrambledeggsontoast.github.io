---
layout: post
title: "needle: ASCII-fied arrow notation"
comments: True
toc: True
tags: 
    - unramblings
    - programming
    - needle
---

Haskell programmers have access to so-called arrow notation for programming with arrows (i.e. generalised functions). It looks something like this:

{% highlight haskell %}
{-# LANGUAGE Arrows #-}

f :: (Int, Int, Int) -> (Int, Int, Int, Int)
f = proc (a,b,c) -> do
    d <- (+1) -< a
    e <- uncurry div -< (d,c)
    f <- negate -< e
    g <- (*2) -< b
    returnA -< (d,e,f,g)
{% endhighlight %}

To me this is not very satisfying. It doesn't seem to convey the abstraction of data traveling through a network of machines particularly well, and it can be difficult to track the path of each variable through the network.

<!--break-->

Enter **needle**, a domain specific language for ASCII-fied arrow notation. A needle form of the above function looks like this:

{% highlight haskell %}
{-# LANGUAGE QuasiQuotes #-}

fNeedle :: (Int, Int, Int) -> (Int, Int, Int, Int)
fNeedle = [nd|
    }=={(+1)}=\==========================>
              \
    }===\     \             /============>
        \     \             /
    }=) \ (==={uncurry div}=/={negate}===>
        \
        \=={(*2)}========================>
|]
{% endhighlight %}

Hopefully this is a lot clearer. It is now obvious that we are dealing with a network, and we can clearly trace the paths of data.

Before I go into more detail: needle has barely just made version 0.1.0.1, available on Hackage [here](http://hackage.haskell.org/package/needle). Almost all of the following is subject to change if better solutions present themselves, and I am extremely open to suggestions. Also to note: I have not yet rigorously tested the code. There are bound to be bugs.

## The language

We embed needles in a Haskell file with the ``nd`` quasiquoter.

In needle, data travels along *rails*. The most basic type of rail is designated by ``=``, along which data travels from left to right. An input to a needle is designated by ``}``, and an output by ``>``. These must be connected by rails. So, the identity arrow in needle is:

{% highlight haskell %}
id = [nd|
    }==>
|]
{% endhighlight %}

There are two types of rail for moving up and down, designated by ``/`` and ``\`` respectively. Another way of representing the identity arrow in needle is the following:

{% highlight haskell %}
id2 = [nd|
                  /======\
                  /      \
    }======\      /      \======>
           \      /
           \======/
|]
{% endhighlight %}

Where tracks meet, tuples of varying length are created. Where tracks diverge, data is duplicated. So we can have the following:

{% highlight haskell %}
duplicateTwo :: (a,b) -> ((a,b),(a,b))
duplicateTwo = [nd|
    }==\   /==>
       \   /
    }==\===/==>
|]

duplicateTwo (1,'a') == ((1,'a'),(1,'a'))
{% endhighlight %}

### Tunnels

If we want to cross tracks, needle provides a concept of *tunnels*. Tunnel entrances are designated by ``)``, and tunnel exits by ``(``. We could write an arrow that swaps its inputs like so:

{% highlight haskell %}
swap = [nd|
    }====\
         \
    }==) \ (==>
         \
         \====>
|]
{% endhighlight %}

Tunnels can overlay each other. The following arrow swaps the outer two elements of a 3-tuple.
{% highlight haskell %}
swapThree = [nd|
    }====\   /========>
         \   /
    }==) \=) / (=\ (==>
             /   \
    }========/   \====>
|]
{% endhighlight %}

### Labelling

We can label the ends of rails with a colon ``:``. Another version of the identity arrow might be the following:

{% highlight haskell %}
id3 = [nd|
    }===:aLabel /=====:anotherLabel
                /
    aLabel:=====/ anotherLabel: ===>
|]
{% endhighlight %}

### Applying arrows

To apply an external arrow to a rail, enclose it between ``{`` and ``}`` and embed it in the rail. This arrow adds one to its input:

{% highlight haskell %}
addOne = [nd|
    }==={arr (+1)}===>
|]
{% endhighlight %}

Thanks to the magic of [haskell-src-meta](https://hackage.haskell.org/package/haskell-src-meta), we can embed almost any valid Haskell phrase, or create arrows that depend on parameters in this way.

{% highlight haskell %}
fmapArrow f = [nd|
    }==={arr $ fmap f}===>
|]
{% endhighlight %}

We are of course also free to call arrows that we have made with needle:

{% highlight haskell %}
addOneToFunctor = [nd|
    }==={fmapArrow (+1)}===>
|]
{% endhighlight %}

## Applications

Functions are not the only kind of arrow. Needle can generate arrows for any type with an instance of ``Arrow``.

### Arrowized FRP

I have been experimenting a lot with functional reactive programming lately, particularly with Netwire. When solving problems relating to signal functions I have found myself drawing complicated signal diagrams, and then having to laboriously translate them into the arrow notation noted at the beginning of the post. Needle can now do that work for me, and in fact this was the original motivation for its creation.

### Kleisli arrows

Kleisli arrows are functions of the familiar type ``Monad m => a -> m b``, with a wrapper ``Kleisli`` so that they can be given an instance of ``Arrow``:

{% highlight haskell %}
newtype Kleisli m a b = Kleisli { runKleisli :: a -> m b }
{% endhighlight %}

We can use Kleisli arrows in needle to perform monadic computations:

{% highlight haskell %}
repeatNeedle :: IO ()
repeatNeedle = runKleisli [nd|
    {Kleisli $ const getLine}=={arr ("You said: "++)}=={Kleisli putStrLn}=>
|] ()
{% endhighlight %}

## Limitations 

Needle is definitely not without its setbacks. For example, the following come to mind:

1. Editability. Plain code is much easier to quickly modify without messing up its structure.

1. Commenting. Although needle does support Haskell style single line comments, it is hard sometimes to find the right place to put them.

It is also difficult to say at this point whether needle is anything more than a curiosity. Let me know what you think!
