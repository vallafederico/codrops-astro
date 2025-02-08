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

For now Taxi is running it's default renderer as we're getting

Renderers are what control what happens when you click a link, anbd which transition is applied. We can create a custom one to start taking ownership of the behaviour, and we'll do by referring to the [documentation](https://taxi.js.org/renderers/) once again.

By implementing a renderer with this logs, we'll have a clearer view of what's happening in the console. We'll also add the `initialLoad()` method. A renderer runs every time the page is changed, but also on first page load, so you can use the initialLoad() method to start your setup (if you want to control everything from the Renderers, ie starting a set of controllers for the Navigation or some elements that will be persistent).

```js
// pages.js
import { Core, Renderer } from "@unseenco/taxi";

class Pages extends Core {
  constructor() {
    super({
      links: "a:not([target]):not([href^=\\#]):not([data-taxi-ignore])",
      renderers: {
        default: CustomRenderer,
      },
    });
    console.log("pages");
  }
}

/** Renderer(s) */
class CustomRenderer extends Renderer {
  initialLoad() {
    // run the first time a user enters a page
    console.log("initialLoad");
  }

  onEnter() {
    // run after the new content has been added to the Taxi container
    console.log("onEnter");
  }

  onEnterCompleted() {
    // run after the transition.onEnter has fully completed
    console.log("onEnterCompleted");
  }

  onLeave() {
    // run before the transition.onLeave method is called
    console.log("onLeave");
  }

  onLeaveCompleted() {
    // run after the transition.onleave has fully completed
    console.log("onLeaveCompleted");
  }
}
```

#### Transitions

Transitions are the animations that run when a link is clicked. They look somewhat similar to renderers.

Implemented in a similar way, the main difference is that there's a `done()` called that syncs it with the Renderer and that lifecycle. If we make the methods async and we wait 1s, we'll see what actually happens in the Transitions methods.

```js
class CustomTransition extends Transition {
  /**
   * Handle the transition leaving the previous page.
   * @param { { from: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  async onLeave({ from, trigger, done }) {
    console.log("transition:onLeave");

    await new Promise((resolve) => setTimeout(resolve, 1000));
    done();
  }

  /**
   * Handle the transition entering the next page.
   * @param { { to: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  async onEnter({ to, trigger, done }) {
    console.log("transition:onEnter");

    await new Promise((resolve) => setTimeout(resolve, 1000));
    done();
  }
}
```

With this async setup we can make sure our Leave animation is actually completely finished before the next step of the lifecycle happens, and we'll be able to orchestrate everything.

You can create a setup where you have different transitions, and apply them to specific pages by using the `data-transition` attribute on your pages.

Always set up a default transition by passing it to the Core configuration under the transitions.default key. This will happen every time when you don't have a transition higher in the hyerarchy.

Would suggest checking the [docs on routing to understand more about hyerachy](https://taxi.js.org/routing/) and how Transitions are actually chosen if you want to get into custom transitions and more advanced concepts, which we'll ignore for now.

Note that if you don't use the renderer, you can not specify it and Taxi will still run the default renderer while still executing the transitions as you would expect.

---

### Some Transition examples (003)

#### Basic Fade In/Out Transition

Now time for something more fun. Let's install [GSAP](https://gsap.com/) and start animating some things.

We'll create a `gsap.js`file to set some defaults and keep things organised, and import things from there.

For now since we're not doing anything custom with the renderer and will focus mostly on transitions, we can remove and comment out the renderer declaration, as this also keeps our console a bit cleaner.

To create a basic fade in/out transitions as our default we can just write a simple tween in the transition we already have.

We already have a wrapper for the whole page set to use taxi, so we can use that selector to make sure everythign that will be swapped will fade out, and when will come in will start with no opacity and gradually get back to visible.

By leveraging the async nature of gsap tweens, we can remove our fake Promise we set up for demonstration purposes, and use a tween.

```js
// pages.js
async onLeave({ from, trigger, done }) {
  console.log("transition:onLeave");

  // await new Promise((resolve) => setTimeout(resolve, 1000));

  await gsap.to("[data-taxi]", {
    autoAlpha: 0,
    duration: 1,
  });

  done();
}

async onEnter({ to, trigger, done }) {
  console.log("transition:onEnter");

  // await new Promise((resolve) => setTimeout(resolve, 1000));

  await gsap.to("[data-taxi]", {
    autoAlpha: 1,
    duration: 1,
    ease: "linear",
    delay: 0.5,
  });

  done();
}
```

This way the wrapper of the swappable content will fade to 0 before the page gets swapped. TO make sure it comes back when the new one is in, we can do the reverse in the onEnter transition.

While awiating the onEnter tween is not necessary, it is important if you wan to embrace the way taxi works and make sure your enter animations are finished before the user is able to click on another link and navigate to a new page.
