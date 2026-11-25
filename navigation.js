const navigation = document.querySelector(".navigation ul");
const sections = Array.from(navigation.querySelectorAll('a[href^="#"]'), link => ({
  link,
  section: document.getElementById(link.hash.slice(1)),
}));

let frame;
let requested;
let reached = false;

function selectSection(hash) {
  requested = sections.find(({ link }) => link.hash === hash);
  reached = false;
  scheduleUpdate();
}

function updateNavigation() {
  const root = document.documentElement;
  const offset = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
  const maxScroll = root.scrollHeight - root.clientHeight;
  const activationLine = offset + (root.clientHeight - offset) / 3;
  const atBottom = maxScroll > 2 && window.scrollY >= maxScroll - 2;
  let current = sections[0];

  if (atBottom) {
    current = sections[sections.length - 1];
  } else if (window.scrollY > 2) {
    current = sections.findLast(({ section }) => section.getBoundingClientRect().top <= activationLine)
      || current;
  }

  if (requested) {
    // Multiple anchors can share a scroll position near the end of a short page.
    const target = requested.section.getBoundingClientRect().top + window.scrollY - offset;
    const destination = Math.max(0, Math.min(target, maxScroll));
    if (Math.abs(window.scrollY - destination) <= 2) {
      current = requested;
      reached = true;
    } else if (reached) {
      requested = undefined;
    }
  }

  for (const item of sections) {
    if (item === current) item.link.setAttribute("aria-current", "location");
    else item.link.removeAttribute("aria-current");
  }
}

function scheduleUpdate() {
  if (frame !== undefined) return;
  frame = requestAnimationFrame(() => {
    frame = undefined;
    updateNavigation();
  });
}

navigation.addEventListener("click", event => {
  const link = event.target.closest("a");
  if (link && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
    selectSection(link.hash);
  }
});

window.addEventListener("hashchange", () => selectSection(location.hash));
window.addEventListener("scroll", scheduleUpdate, { passive: true });
window.addEventListener("resize", scheduleUpdate);
window.addEventListener("pageshow", scheduleUpdate);
selectSection(location.hash);
