---
layout: post
title: Kachushi, an artificial intelligence for the game of Open Face Chinese Poker
tags: 
    - unramblings
    - programming
toc: true
comments: true
---

<center><img src="/public/assets/kachushi.svg" style="padding: 1rem;" /></center>

A while ago my friends and I came upon Open Face Chinese[^finland] Poker (OFC for short), a game that has gained some popularity in the last couple of years. It is not like most forms of poker &mdash; very few betting decisions are made, and bluffing is completely absent. The game almost feels closer to something like bridge. Players must focus on thinking analytically about the possible combinations of the cards left in the deck which could arise, and act accordingly.

The space of decisions to be made in OFC is both fairly small and easily defined &mdash; there are 232 possible choices on the first turn, and then at most a mere 3 for each of the next 7 turns, while the choice at the last turn is always predetermined. This relative simplicity made me think that a basic artificial intelligence would not be too difficult to implement and that doing such a thing would be both instructive and enjoyable.[^lucre] 

Thus Kachushi[^chinese], an artificial intelligence for OFC written in Haskell, was born.

## A primer on the rules of OFC

OFC is played by 2, 3 or 4 players. Each player is capable of placing cards in their own *board*, visible to all, which has room for three cards in a top row, five cards in a middle row, and five cards in a bottom row. Once cards are placed in the board, they may not be moved &mdash; they are fixed in their position for the rest of the game.

<center><figure>
    <img src="/public/assets/emptyboard.svg" style="padding: 0rem; margin-bottom: 0rem;" />
    <figcaption>An empty board</figcaption>
</figure></center>

Players sit with their boards in a circle, and cards are dealt and turns taken in a clockwise fashion.

In the first round of the game, each player is dealt five cards, which they must then place into their board on their turn. For example, having been dealt the five of clubs, six of spades, ten of hearts, king of hearts and deuce of spades, a player might place the cards in the following positions:

<center><figure>
    <img src="/public/assets/firstfive.svg" style="padding: 0rem; margin-bottom: 0rem;" />
    <figcaption>A possible board after having played the first five cards</figcaption>
</figure></center>

After all players have placed their first five cards, the initial round is over, and the game progresses to the next 8 rounds. In each of these rounds, each player in turn is dealt a card and places that card in some part of their board. At the end of the 8 rounds, each player should have a full board, and the game is complete.

<center><figure>
    <img src="/public/assets/fullboard.svg" style="padding: 0rem; margin-bottom: 0rem;" />
    <figcaption>A possible board at the end of the game</figcaption>
</figure></center>

The obective of the game is to have each row of your board best the respective rows of your opponents' boards, where the strength of each row is measured as if it were a poker hand. In addition, in your own board, the middle row must be a stronger hand than the top row, and the bottom row must be a stronger hand than the middle row. If this is not the case, then your board is *fouled*, meaning that each row now has no value, and so will lose to every possible row in a non-fouled board.

The scoring system is a little too complex to go into much detail, but I will list the key points:

1. Each player has a number of *points*, like chips, at the beginning of the game.
1. Each time one of your rows beats an opponent's respective row, they must give you one point.
1. Conversely, each time one of an opponent's rows beats your respective row, you must give them one point.
1. If all of your rows beat all of an opponent's rows (a *sweep*), they must give you three extra points, and vice versa.
1. Bonus points, known as *royalties*, are awarded for managing to make certain hands. For example, in the board above, there is a flush in the bottom row, and so each opponent whose bottom row is beaten by it must give the player four extra points.

For more information on the scoring, see something like [this](http://www.openfaceodds.com/rules.html).

## Efficient hand evaluation

Kachushi needs to be able to find out exactly how strong a hand is. One solution to this problem would be to create a program that carries out a series of steps similar in nature to how a human might describe this process. For example:

1. Are all of the cards the same suit? If so, the hand is a flush or straight flush.
1. Are the ranks in order? If so, the hand is a straight.
1. Do four of the cards have the same rank? If so, the hand is a four of the kind.
1. ...

And so on[^morecomplex]. This kind of naive algorithm can be easy to describe, but is fairly slow. The algorithm used by Kachushi needs to analyse many different hands, and so requires a faster algorithm in order to be run in a reasonable amount of time.

The method I used was heavily inspired by a hand evaluator known as [Cactus Kev's Hand Evaluator](http://www.suffecool.net/poker/evaluator.html). With this method, each card is represented by a 32-bit word which encapsulates both the card's suit, and its rank in three forms: as simply a number $$n$$ (i.e. $$n$$ = 0 for a two, $$n$$ = 1 for a three, ... $$n$$ = 12 for an ace), as the $$n^\text{th}$$ power of 2, and as the $$n^\text{th}$$ prime number[^fundamental]. These alternate forms allow a value to be generated for each five card hand, which can be checked in a series of
pregenerated tables to find a number representing the strength of the hand. The lower the number, the stronger the hand. 

I had to modify the algorithm slightly to enable it to rate a three card hand. In tests it worked well and I was satisfied with its speed. It was only after I had finished implementing the entire A.I. that I discovered that a poker hand evaluation library for Haskell was [already available](http://hackage.haskell.org/package/poker-eval-0.3.1/docs/Data-Poker.html#t:CardSet). Doubtless using the library would result in faster code. However, a mixture of my not being bothered to refactor Kachushi's code to fit the library, and a fondness for code that I myself have
written, resulted in me not using it.

## The A.I. algorithm

For such a grand title as **Artificial Intelligence**, the actual algorithm Kachushi uses is almost underwhelmingly simple. Every time Kachushi needs to make a decision, it carries out a [Monte Carlo simulation](http://en.wikipedia.org/wiki/Monte_Carlo_method) of the rest of the game after each possible choice has been made, to estimate an expected value for the final number of points to be gained if that choice is picked. It then picks the choice that maximises that expected value. 

That is it. There is no special consideration for strategy in the algorithm &mdash; the beauty of the Monte Carlo method is that there does not need to be. Everything is neatly wrapped up in the expected value.

## Experiments

It is generally thought that the player who is dealt their cards last has the upper hand, as of the players they will have the most information when it is their turn. To test this hypothesis, I ran 10,000 four-person games of OFC, with each player's actions controlled by Kachushi, and recorded the point difference at the end of each game against the order in which each player is dealt cards. The raw data can be found [here](/public/assets/kachushidata). The results were as follows:

 | ------------------------------- + ----------- + ----------- + ----------- + ----------- |
 | **Deal order**                  | **First**   | **Second**  | **Third**   | **Fourth**  |
 | ------------------------------: | :---------: | :---------: | :---------: | :---------: |
 | **Mean score**                  | -0.5752     | -0.0540     | -0.0232     | 0.6524      |
 | ------------------------------- + ----------- + ----------- + ----------- + ----------- |
 | **Standard deviation of score** | 12.9561     | 13.0658     | 13.0429     | 13.0461     |
 | ------------------------------- + ----------- + ----------- + ----------- + ----------- |

I was able to calculate a 90% confidence interval of approximately &plusmn; 0.21 points for each position, so we can be reasonably certain[^reasonably] that the hypothesis is true[^maydiffer].

## Optimality

Although I have attempted to optimise large sections of my code, by for example parallelising it where possible, using mutable arrays, and trying to minimise garbage collection, I am almost certain that there is room for huge improvement. 

The fact is however that optimisation is neither one of my strengths nor something I particularly enjoy. Kachushi works, and at this point the efficiency with which it works is good enough for me.

## The code

Kachushi is open source and available [on GitHub](https://github.com/ScrambledEggsOnToast/Kachushi). Feel free to contribute, particularly in the aforementioned area of optimisation.

As of the publication of this post, I am not done a huge amount to make the code very neat. Nor have I done much commenting. I will fix this at some point.

 ---

[^finland]: Called Chinese, although interestingly invented in Finland.
[^lucre]: And obviously the splendiferous lucre to be attained by using such an A.I. in the real world is just an added bonus.
[^chinese]: Chinese for *Card Cook*. I am aware that this is probably a horrible mistranslation.
[^morecomplex]: In reality, such a method would be more complex, as it would need to take into account the comparative strength of for example two flushes.
[^fundamental]: This facilitates a clever use of the fundamental theorem of arithmetic.
[^reasonably]: I had originally only carried out 1,000 trials, which seemed to give the result that the middle positions were able to gain the most points. This lead to some misguided contemplation on how much information each seat *really* has. 
[^maydiffer]: Although results may differ for players who are not quite as capable as Kachushi.
