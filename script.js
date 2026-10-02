// Adds previous/next buttons to horizontal strips; without JS they still scroll by swipe or trackpad.
const motion = matchMedia("(prefers-reduced-motion: no-preference)").matches ? "smooth" : "auto";
for (const strip of document.querySelectorAll(".strip")) {
  const nav = document.createElement("div");
  nav.className = "strip-nav";
  const fr = document.documentElement.lang === "fr";
  const [prev, next] = [[fr ? "Précédent" : "Previous", -1, "‹"], [fr ? "Suivant" : "Next", 1, "›"]].map(([label, dir, glyph]) => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = glyph; b.setAttribute("aria-label", label);
    b.addEventListener("click", () => strip.scrollBy({ left: dir * strip.clientWidth * 0.8, behavior: motion }));
    nav.append(b);
    return b;
  });
  const update = () => {
    nav.hidden = strip.scrollWidth <= strip.clientWidth + 1;
    prev.disabled = strip.scrollLeft <= 0;
    next.disabled = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 1;
  };
  strip.addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  strip.after(nav);
  update();
}
// Marks the nav link of the current section: the last one whose top has passed 35% of the screen (the last one at the very bottom).
// On a phone the nav scrolls sideways: the marked link is brought to the middle.
const mainNav = document.querySelector(".site-header nav");
const navLinks = [...mainNav.querySelectorAll("a")];
const sections = [...document.querySelectorAll("main > section")];
let marked;
const markNav = () => {
  let current = sections.findLast(s => s.getBoundingClientRect().top <= innerHeight * 0.35) ?? sections[0];
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) current = sections.at(-1);
  if (current === marked) return;
  marked = current;
  navLinks.forEach(a => a.hash === "#" + current.id ? a.setAttribute("aria-current", "location") : a.removeAttribute("aria-current"));
  const a = navLinks.find(a => a.hash === "#" + current.id);
  if (a) mainNav.scrollTo({ left: a.offsetLeft + a.offsetWidth / 2 - mainNav.clientWidth / 2 });
};
addEventListener("scroll", markNav, { passive: true });
markNav();
// One video at a time; double-click: full screen and play (Firefox toggles play on each click, so play() is forced).
const videos = document.querySelectorAll("video");
for (const video of videos) {
  video.addEventListener("play", () => videos.forEach(v => v !== video && v.pause()));
  video.addEventListener("dblclick", e => {
    e.preventDefault();
    if (document.fullscreenElement) document.exitFullscreen();
    else video.requestFullscreen?.().catch(() => {});
    video.play();
  });
}
// Photo viewer: a click on a photo opens it large; buttons, arrow keys or a swipe move through its gallery. Without JS the link opens the image.
const viewer = document.querySelector(".viewer"), big = new Image();
big.draggable = false;
let photos = [], at = 0;
const show = i => { at = (i + photos.length) % photos.length; big.src = photos[at].href; big.alt = photos[at].querySelector("img").alt; };
document.addEventListener("click", e => {
  const link = e.target.closest("a[href$='.webp']");
  if (!link) return;
  e.preventDefault();
  const strip = link.closest(".strip");
  photos = strip ? [...strip.querySelectorAll("a[href$='.webp']")] : [link];
  viewer.classList.toggle("single", photos.length < 2);
  show(photos.indexOf(link));
  viewer.prepend(big);
  viewer.showModal();
});
viewer.querySelector(".viewer-prev").onclick = () => show(at - 1);
viewer.querySelector(".viewer-next").onclick = () => show(at + 1);
viewer.querySelector(".viewer-close").onclick = () => viewer.close();
viewer.addEventListener("click", e => e.target === viewer && viewer.close());
viewer.addEventListener("keydown", e => { if (e.key === "ArrowLeft") show(at - 1); if (e.key === "ArrowRight") show(at + 1); });
let x0 = null;
viewer.addEventListener("pointerdown", e => x0 = e.clientX);
viewer.addEventListener("pointerup", e => { if (x0 !== null && photos.length > 1 && Math.abs(e.clientX - x0) > 50) show(at + (e.clientX < x0 ? 1 : -1)); x0 = null; });
