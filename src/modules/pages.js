import { Core, Renderer, Transition } from "@unseenco/taxi";
import gsap from "./gsap";

class Pages extends Core {
  constructor() {
    super({
      links: "a:not([target]):not([href^=\\#]):not([data-taxi-ignore])",
      transitions: {
        default: CustomTransition,
      },
    });
    // console.log("pages");
  }
}

/** Transitions(s) */
transitionAnimation();

async function transitionAnimation(
  to = document.querySelector("[data-taxi-view]")
) {
  await gsap.to(to.querySelector("h1"), {
    autoAlpha: 1,
    duration: 0.6,
  });

  return {};
}

class CustomTransition extends Transition {
  async onLeave({ from, trigger, done }) {
    // console.log("transition:onLeave");

    await gsap.to(from.querySelector("h1"), {
      autoAlpha: 0,
      duration: 0.6,
    });

    await gsap.to(".transition-block", {
      scaleY: 1,
      duration: 0.8,
      transformOrigin: "bottom",
    });

    done();
  }

  async onEnter({ to, trigger, done }) {
    // console.log("transition:onEnter");

    await gsap.to(".transition-block", {
      scaleY: 0,
      duration: 0.6,
      delay: 0.2,
      transformOrigin: "top",
    });

    await transitionAnimation(to);

    done();
  }
}

/** Renderer(s) */
// class CustomRenderer extends Renderer {
//   initialLoad() {
//     console.log("initialLoad");
//   }

//   onEnter() {
//     console.log("onEnter");
//     // run after the new content has been added to the Taxi container
//   }

//   onEnterCompleted() {
//     console.log("onEnterCompleted");
//     // run after the transition.onEnter has fully completed
//   }

//   onLeave() {
//     console.log("onLeave");
//     // run before the transition.onLeave method is called
//   }

//   onLeaveCompleted() {
//     console.log("onLeaveCompleted");
//     // run after the transition.onleave has fully completed
//   }
// }

export default new Pages();
