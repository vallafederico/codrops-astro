import { Core } from "@unseenco/taxi";

class Pages extends Core {
  constructor() {
    super({
      links: "a:not([target]):not([href^=\\#]):not([data-taxi-ignore])",
    });
    console.log("pages");
  }
}

export default new Pages();
