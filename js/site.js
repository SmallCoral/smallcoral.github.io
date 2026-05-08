const navLinks = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function setActiveNav() {
  const current = sections
    .map((section) => ({
      id: section.id,
      top: Math.abs(section.getBoundingClientRect().top - 120),
    }))
    .sort((a, b) => a.top - b.top)[0];

  navLinks.forEach((link) => {
    link.classList.toggle("active", current && link.getAttribute("href") === `#${current.id}`);
  });
}

window.addEventListener("scroll", setActiveNav, { passive: true });
setActiveNav();

const searchInput = document.querySelector("#friendSearch");
const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
const friendCards = Array.from(document.querySelectorAll(".friend-card"));
let activeFilter = "all";

function filterFriends() {
  const keyword = (searchInput?.value || "").trim().toLowerCase();

  friendCards.forEach((card) => {
    const tags = card.dataset.tags || "";
    const text = card.textContent.toLowerCase();
    const matchFilter = activeFilter === "all" || tags.includes(activeFilter);
    const matchKeyword = !keyword || text.includes(keyword) || tags.includes(keyword);
    card.classList.toggle("hidden", !(matchFilter && matchKeyword));
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    filterFriends();
  });
});

searchInput?.addEventListener("input", filterFriends);

const copyButton = document.querySelector("#copyFriendInfo");
copyButton?.addEventListener("click", async () => {
  const info = [
    "站名：SmallCoral 的水族馆",
    "链接：https://smallcoral.github.io/",
    "头像：https://smallcoral.github.io/images/favicon.png",
    "简介：电子、代码、Minecraft、业余无线电与折腾记录。呼号 BH6TAW。",
  ].join("\n");

  let copied = false;

  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(info);
      copied = true;
    } else {
      throw new Error("Clipboard API unavailable");
    }
  } catch {
    try {
      const input = document.createElement("textarea");
      input.value = info;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      copied = document.execCommand("copy");
      input.remove();
    } catch {
      copied = false;
    }
  }

  if (copied) {
    copyButton.textContent = "已复制";
    setTimeout(() => {
      copyButton.textContent = "复制信息";
    }, 1600);
  } else {
    copyButton.textContent = "复制失败";
    setTimeout(() => {
      copyButton.textContent = "复制信息";
    }, 1600);
  }
});
