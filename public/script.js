/* eslint-disable no-use-before-define */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Header elevation on scroll
const topbar = document.querySelector("[data-elevate]");
if (topbar) {
  const elevate = () => {
    topbar.dataset.elevated = String(window.scrollY > 6);
  };
  elevate();
  window.addEventListener("scroll", elevate, { passive: true });
}

// Mobile drawer
const drawer = document.getElementById("drawer");
const drawerPanel = drawer?.querySelector(".drawer__panel");
const menuBtn = document.querySelector(".navbtn");
const closeBtn = drawer?.querySelector(".drawer__close");

function openDrawer() {
  if (!drawer || !menuBtn || !drawerPanel) return;
  drawer.setAttribute("aria-hidden", "false");
  menuBtn.setAttribute("aria-expanded", "true");
  drawerPanel.querySelector("a,button")?.focus();
  document.body.style.overflow = "hidden";
}

function closeDrawer() {
  if (!drawer || !menuBtn) return;
  drawer.setAttribute("aria-hidden", "true");
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.focus();
  document.body.style.overflow = "";
}

menuBtn?.addEventListener("click", () => {
  const open = drawer?.getAttribute("aria-hidden") === "false";
  if (open) closeDrawer();
  else openDrawer();
});

closeBtn?.addEventListener("click", closeDrawer);
drawer?.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.hasAttribute("data-close")) closeDrawer();
});

drawer?.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDrawer();
});

drawerPanel?.addEventListener("click", (e) => {
  const target = e.target;
  if (target instanceof HTMLAnchorElement) closeDrawer();
});

// Simple scrollspy
const sectionIds = ["overview", "methods", "signals", "results", "discussion"];
const navLinks = Array.from(document.querySelectorAll(".nav a")).filter((a) =>
  sectionIds.some((id) => a.getAttribute("href") === `#${id}`),
);

const sections = sectionIds
  .map((id) => document.getElementById(id))
  .filter(Boolean)
  .map((el) => /** @type {HTMLElement} */ (el));

let activeId = "";
function setActive(id) {
  if (activeId === id) return;
  activeId = id;
  for (const link of navLinks) {
    const match = link.getAttribute("href") === `#${id}`;
    link.setAttribute("aria-current", match ? "page" : "false");
  }
}

if (sections.length > 0) {
  const spy = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
      const id = visible?.target?.id;
      if (typeof id === "string" && id) setActive(id);
    },
    { root: null, threshold: [0.18, 0.25, 0.4, 0.6], rootMargin: "-10% 0px -75% 0px" },
  );
  for (const el of sections) spy.observe(el);
}

// Reveal animation
if (!prefersReducedMotion) {
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = /** @type {HTMLElement} */ (entry.target);
        el.classList.add("is-in");
        io.unobserve(el);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
  );
  for (const el of revealEls) io.observe(el);
} else {
  for (const el of document.querySelectorAll(".reveal")) el.classList.add("is-in");
}

// Figure zoom modal
const modal = /** @type {HTMLDialogElement|null} */ (document.getElementById("modal"));
const modalImg = modal?.querySelector(".modal__img");
const modalCap = modal?.querySelector(".modal__cap");
const modalClose = modal?.querySelector(".modal__close");

function openModal(imgEl, cap) {
  if (!modal || !(modalImg instanceof HTMLImageElement) || !(modalCap instanceof HTMLElement)) return;
  modalImg.src = imgEl.currentSrc || imgEl.src;
  modalImg.alt = imgEl.alt || "Figure";
  modalCap.textContent = cap || "";
  if (!modal.open) modal.showModal();
}

function closeModal() {
  if (!modal) return;
  if (modal.open) modal.close();
}

modalClose?.addEventListener("click", closeModal);
modal?.addEventListener("click", (e) => {
  // Close when clicking backdrop area (not on the content).
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  if (target === modal) closeModal();
});
modal?.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

for (const fig of document.querySelectorAll("[data-zoom]")) {
  fig.addEventListener("click", () => {
    const img = fig.querySelector("img");
    const cap = fig.querySelector("figcaption")?.textContent?.trim() ?? "";
    if (img instanceof HTMLImageElement) openModal(img, cap);
  });
}

