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
const friendGrid = document.querySelector("#friendGrid");
const friendSitesGrid = document.querySelector("#friendSitesGrid");
const resourceSitesGrid = document.querySelector("#resourceSitesGrid");
const friendSitesGroup = document.querySelector("#friendSitesGroup");
const resourceSitesGroup = document.querySelector("#resourceSitesGroup");
const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
const defaultFriends = [
  {
    label: "GitHub",
    name: "SmallCoral",
    url: "https://github.com/SmallCoral",
    tags: ["personal", "code"],
    group: "resource",
    description: "代码、硬件和杂项项目的主要归档地。",
  },
  {
    label: "Hardware",
    name: "OSHWHub",
    url: "https://oshwhub.com/smallcoral/",
    tags: ["hardware", "personal"],
    group: "resource",
    description: "电路与板子项目，会把硬件相关内容放在这里。",
  },
  {
    label: "Video",
    name: "Bilibili",
    url: "https://space.bilibili.com/517434964",
    tags: ["personal", "video"],
    group: "resource",
    description: "视频账号入口，适合放过程记录和整活内容。",
  },
  {
    label: "Study",
    name: "CS 自学指南",
    url: "https://csdiy.wiki/",
    tags: ["study"],
    group: "resource",
    description: "计算机自学路线与课程资料导航。",
  },
  {
    label: "Minecraft",
    name: "Minecraft Wiki",
    url: "https://zh.minecraft.wiki/",
    tags: ["study", "game"],
    group: "resource",
    description: "查版本、机制和玩法细节时最常打开的资料站。",
  },
  {
    label: "Blog",
    name: "DaZiDian",
    url: "https://dz1d.vip/",
    avatar: "https://dz1d.vip/assets/jpg/LOGO-BWIDVxi8.jpg",
    tags: ["personal"],
    group: "friend",
    description: "春風若有憐花意，可否許我再少年？",
    reciprocal: "https://dz1d.vip/friends",
  },
];
let friendCards = Array.from(document.querySelectorAll(".friend-card"));
let activeFilter = "all";

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  return String(tags || "")
    .split(/\s+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function getFriendGroup(friend) {
  if (friend.group === "resource" || friend.group === "friend") {
    return friend.group;
  }

  return friend.avatar || friend.reciprocal ? "friend" : "resource";
}

function getInitial(name) {
  return Array.from(String(name || "?").trim())[0] || "?";
}

function createFriendCard(friend) {
  const group = getFriendGroup(friend);
  const card = document.createElement("a");
  card.className = "friend-card";
  if (group === "friend") {
    card.classList.add("friend-site-card");
  }
  card.href = friend.url;
  card.dataset.tags = normalizeTags(friend.tags).join(" ");
  card.dataset.group = group;
  card.target = "_blank";
  card.rel = "noopener";

  const body = document.createElement("div");
  body.className = "friend-card-body";

  const label = document.createElement("span");
  label.textContent = friend.label || "Friend";

  const name = document.createElement("strong");
  name.textContent = friend.name;

  const description = document.createElement("p");
  description.textContent = friend.description;

  body.append(label, name, description);

  if (group === "friend") {
    const avatar = document.createElement("div");
    avatar.className = "friend-avatar";

    const fallback = document.createElement("span");
    fallback.textContent = getInitial(friend.name);
    avatar.append(fallback);

    if (friend.avatar) {
      const image = document.createElement("img");
      image.src = friend.avatar;
      image.alt = `${friend.name} 图标`;
      image.loading = "lazy";
      image.referrerPolicy = "no-referrer";
      image.addEventListener("error", () => image.remove());
      avatar.append(image);
    }

    card.append(avatar, body);
  } else {
    card.append(body);
  }

  return card;
}

function createInviteCard() {
  const card = createFriendCard({
    label: "Exchange",
    name: "申请友链",
    url: "https://github.com/SmallCoral/smallcoral.github.io/issues/new?template=friend-link.yml",
    tags: ["personal", "exchange"],
    group: "friend",
    description: "通过 GitHub Issues 提交站名、链接、头像和简介。长期欢迎同好互相挂链。",
  });
  card.classList.add("invite-card");
  return card;
}

function updateFriendGroupVisibility() {
  [
    [friendSitesGroup, friendSitesGrid],
    [resourceSitesGroup, resourceSitesGrid],
  ].forEach(([group, grid]) => {
    if (!group || !grid) {
      return;
    }

    const hasVisibleCard = Array.from(grid.querySelectorAll(".friend-card")).some(
      (card) => !card.classList.contains("hidden"),
    );
    group.classList.toggle("hidden", !hasVisibleCard);
  });
}

function renderFriends(friends) {
  if (!friendGrid || !friendSitesGrid || !resourceSitesGrid) {
    return;
  }

  const friendSiteCards = friends.filter((friend) => getFriendGroup(friend) === "friend").map(createFriendCard);
  const resourceCards = friends.filter((friend) => getFriendGroup(friend) === "resource").map(createFriendCard);

  friendSiteCards.push(createInviteCard());
  friendSitesGrid.replaceChildren(...friendSiteCards);
  resourceSitesGrid.replaceChildren(...resourceCards);
  friendCards = Array.from(friendGrid.querySelectorAll(".friend-card"));
  filterFriends();
}

async function loadFriends() {
  if (!friendGrid) {
    return;
  }

  renderFriends(defaultFriends);

  try {
    const response = await fetch(friendGrid.dataset.source || "data/friends.json", { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Friend data request failed: ${response.status}`);
    }

    const friends = await response.json();
    if (Array.isArray(friends)) {
      renderFriends(friends);
    }
  } catch (error) {
    console.warn("Using embedded friend list fallback.", error);
  }
}

function filterFriends() {
  const keyword = (searchInput?.value || "").trim().toLowerCase();

  friendCards.forEach((card) => {
    const tags = card.dataset.tags || "";
    const text = card.textContent.toLowerCase();
    const matchFilter = activeFilter === "all" || tags.includes(activeFilter);
    const matchKeyword = !keyword || text.includes(keyword) || tags.includes(keyword);
    card.classList.toggle("hidden", !(matchFilter && matchKeyword));
  });

  updateFriendGroupVisibility();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    filterFriends();
  });
});

searchInput?.addEventListener("input", filterFriends);
loadFriends();

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
