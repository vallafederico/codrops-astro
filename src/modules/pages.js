import { Core, Renderer, Transition } from "@unseenco/taxi";

class Pages extends Core {
  constructor() {
    super({
      links: "a:not([target]):not([href^=\\#]):not([data-taxi-ignore])",
      renderers: {
        default: CustomRenderer,
      },
      transitions: {
        default: CustomTransition,
      },
    });
    console.log("pages");
  }
}

/** Transitions(s) */

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

/** Renderer(s) */
class CustomRenderer extends Renderer {
  initialLoad() {
    console.log("initialLoad");
  }

  onEnter() {
    console.log("onEnter");
    // run after the new content has been added to the Taxi container
  }

  onEnterCompleted() {
    console.log("onEnterCompleted");
    // run after the transition.onEnter has fully completed
  }

  onLeave() {
    console.log("onLeave");
    // run before the transition.onLeave method is called
  }

  onLeaveCompleted() {
    console.log("onLeaveCompleted");
    // run after the transition.onleave has fully completed
  }
}

export default new Pages();
