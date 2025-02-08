import gsap from "gsap";

const defaults = {
  ease: "expo.out",
  duration: 1.2,
};

gsap.defaults(defaults);

export default gsap;
export { defaults };
