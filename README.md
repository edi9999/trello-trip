Trello-trip
===

I wanted to have a simple yet powerful solution to plan your next trip. I didn't want to code a lot of my own, and started using trello without anything else. I put every place I wanted to go in a specific card and attached photo and a description of what you can do there.

Then I thought maybe I could create a tag with the price of the hotel I will have to pay, and calculate the total price with an API.

So you have to put on every of your card:

```
**Prix**: 50 €
```

The 50 is arbitrary, but all other symbols matter (even the spaces)

Because I wanted to have google maps previews of the trips I had to take, I also invented this tag:

```
**Plan**: Adress
```

This will then draw out the map of the trip from one location to the next


# Installation

- clone the repository
- open index.html, and enter your key on the line <script type="text/javascript" src="https://api.trello.com/1/client.js?key="></script>
- to generate a key, use https://trello.com/1/appKey/generate

