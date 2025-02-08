# Astro Codrops

## Page Transitions

### Initial Thoughts

- why not use CSS layout transition
- why taxi
- what we'll be doing
  - few examples

#### How this is going to work

- we'll start from a bare example, that will dive into the more technical part and how our setup will work
- once past that, we'll dive into a few examples of implemented transitions without going through the basics, and just taking about the transition specific stuffs

---

### Basic Setup / Starter (000)

We start from a pretty basic Astro setup, that's basically what comes out of running npm create astro@latest.

I've done some initial work and set up a few things:

- removed the basic components and created a new Nav.astro file to handle our navigation
- a styles.css file for general styling
- a src/modules/ folder, which is where we'll be writing most of our code.
- I've also slightly modified the Layout.astro, adding both the import for our newly created css file, the Nav component we created, and a script tag the way we want it.

---

### Page tranistion related setup (001)

I've kept this second part out as this is still setup, but related to handling and doing page transition.

You can check out Taxi.js, the library that we'll be using [here](https://taxi.js.org/).
At this date I consider this the more robust and structured library for this. It's made and maintained by [Jake Whiteley](https://x.com/jakewhiteleydev) (go give him a follow) and [Unseen Studio](https://unseen.co/).

In broad terms, this is the setup we'll need to go through

- Setting up the DOM structure and set up our project in a way that's going to work with that
- Creating the Pages javascript class which is going to be the handler for all our transition
- Handling a few edge cases of gotcha

#### How Taxi works

In simple terms, Taxi takes care of capturing your (internal) link clicks, overriding the standard behaviour, and instead of navigating to the next page, fetching it and inserting it in the DOM instead of the current page.

To do this it uses 2 containers, a wrapper, which is the target of the insertion, and the container that gets swapped. Ideally you want to have everything that you want to keep in all pages outside this container (ie a Nav).

Keep in mind, only what's inside the container will get swapped, so the persistent elements need to be present on all pages, including scripts and css files, so you're sure they are laoded regardless of the user's entry point.

Astro and Layouts are really convenient for this. We can set up the layout to manage all this, and work with the <slot> component to freely compose our pages.

#### Setting up the DOM

As you can find in the docs, the most minimal setup you need consist in marking a wrapper, which is the parent of the container that will get swapped, and marking the container.

```html
<main data-taxi>
  <article data-taxi-view>...</article>
</main>
```

looking at <body> tag inside the Layout.astro, the slot is where what we'll have in pages will be rendered, so are good just wrapping that component

```html
<!-- ... -->
<body>
  <nav />

  <slot />

  <script>
    import "../modules/app";
  </script>
</body>
```

```html
<!-- ... -->
<body>
  <nav />

  <main data-taxi>
    <div data-taxi-view>
      <slot />
    </div>
  </main>

  <script>
    import "../modules/app";
  </script>
</body>
```

We wrap the slot twice, once in a <main> tag with the `data-taxi` atrribute, and inside with a div (or anything you want) with the `data-taxi-view` attribute, that will wrap the swapped content.

We'll also create another couple of pages, leveraging the layout from Astro that we just set up and add those to the navigation, so we'll have something to navigate to.

Another thing to notice is that I've set up through the layout a props, thew page title, so we can pass it to every page and it'll be dynamicly applied to the layout.

#### Working on the Pages class

We already have a script set up for our `app.js` entry point.

This imports two singletons (meaning already initialised classes, I think those are called that), `Scroll` and `Pages`, which will respectively be our implementation of Lenis (because why not while we're at it) and the actual Taxi.js implementation. It also exports itself, in case we'll need to refer to it in other files.

It's important that we export those the way they are and not import the bare class to be initialised in other files, as we want both Lenis end Taxi to be initialised only once, and always refer to the same instance.

By following the [documentation](https://taxi.js.org/how-to-use/), is now time to install the package and initialise the taxi core. I'm using `pnpm`(and you probably should too), but you can go on by running your favourite install command.

```
pnpm add @unseenco/taxi
```

Then in the `pages.js`class, we set up the Taxi Core. This is enough to get seamless page transitions.

```js
import { Core } from "@unseenco/taxi";

class Pages extends Core {
  constructor() {
    super();
    console.log("pages");
  }
}

export default new Pages();
```

To make a bit more clear what's happening, we can add an entry point notation to the Nav,
that's supposed to stay in place when the rest of the website transitions. We do this but just adding the Astro.props to the nav, and pass the {title} as a value.

```jsx
---
const {entry} = Astro.props;
---
<nav>
  <a href="/">LOGO</a>
  <p>entry is {entry}</p>
  <ul>
    {links.map((link) => (
      <li>
        <a href={link.href}>{link.label}</a>
      </li>
    ))}
  </ul>
</nav>
```

Now if you click on any link, you'll see that the page change but the entry is ... remains what was the initial page we entered the website from. Try and refresh, and you'll see the text changing based on the page you're on,

---

### Configuring the Core (002)

We got the basic setup implemented, now time for more fun stuffs.

#### Extending the class

The Taxi Core takes some parameters. You can look at them more in depth in the documentation. Only thing I would mention is that since we're extending the class, those should go in the `super()` call.

This configuration takes in our declaration for `Renderers` and `Transitions` declarations.

#### Renderers

Renderers are what control what happens when you click a link, anbd which transition is applied.

---

Now time for something more fun. Let's install [GSAP](https://gsap.com/) and Lenis, as we'll be using those throughout.
