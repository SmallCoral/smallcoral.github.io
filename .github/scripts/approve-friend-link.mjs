import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";

const APPROVAL_LABEL = process.env.APPROVAL_LABEL || "friend-approved";
const DATA_PATH = "data/friends.json";
const EVENT_PATH = process.env.GITHUB_EVENT_PATH;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const TARGET_BRANCH = process.env.TARGET_BRANCH || "main";

const CATEGORY_MAP = {
  "个人博客": {
    label: "Blog",
    tags: ["personal"],
  },
  "技术/学习": {
    label: "Study",
    tags: ["study"],
  },
  "硬件/电子": {
    label: "Hardware",
    tags: ["hardware"],
  },
  "游戏/兴趣": {
    label: "Interest",
    tags: ["personal", "game"],
  },
  "其他": {
    label: "Friend",
    tags: ["personal"],
  },
};

let issueNumber = null;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeInput(value) {
  const normalized = String(value || "").replace(/\r\n/g, "\n").trim();
  return /^_?No response_?$/i.test(normalized) ? "" : normalized;
}

function singleLine(value) {
  return normalizeInput(value).replace(/\s+/g, " ").trim();
}

function extractField(body, label) {
  const normalizedBody = String(body || "").replace(/\r\n/g, "\n");
  const pattern = new RegExp(`^###\\s+${escapeRegExp(label)}\\s*\\n+([\\s\\S]*?)(?=\\n###\\s+|$)`, "m");
  const match = normalizedBody.match(pattern);
  return normalizeInput(match?.[1] || "");
}

function getField(body, labels) {
  for (const label of labels) {
    const value = extractField(body, label);
    if (value) {
      return value;
    }
  }

  return "";
}

function assertLength(name, value, max) {
  if (value.length > max) {
    throw new Error(`${name} 不能超过 ${max} 个字符`);
  }
}

function readRequiredText(body, labels, name, max) {
  const value = singleLine(getField(body, labels));
  if (!value) {
    throw new Error(`缺少必填字段：${name}`);
  }

  assertLength(name, value, max);
  return value;
}

function readUrl(body, labels, name, required = true) {
  const rawValue = singleLine(getField(body, labels));
  if (!rawValue) {
    if (required) {
      throw new Error(`缺少必填字段：${name}`);
    }

    return "";
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(rawValue);
  } catch {
    throw new Error(`${name} 不是有效 URL：${rawValue}`);
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error(`${name} 只支持 http 或 https URL`);
  }

  return parsedUrl.href;
}

function comparableUrl(value) {
  const parsedUrl = new URL(value);
  parsedUrl.hash = "";
  return parsedUrl.href.replace(/\/$/, "").toLowerCase();
}

function getCategory(value) {
  return CATEGORY_MAP[value] || CATEGORY_MAP["其他"];
}

function runGit(args) {
  execFileSync("git", args, { stdio: "inherit" });
}

async function githubRequest(method, path, body) {
  if (!GITHUB_REPOSITORY || !GITHUB_TOKEN) {
    throw new Error("GitHub API 环境变量缺失");
  }

  const response = await fetch(`https://api.github.com/repos/${GITHUB_REPOSITORY}${path}`, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API 请求失败：${method} ${path} ${response.status} ${text}`);
  }
}

async function commentIssue(body) {
  if (!issueNumber) {
    return;
  }

  await githubRequest("POST", `/issues/${issueNumber}/comments`, { body });
}

async function closeIssue() {
  if (!issueNumber) {
    return;
  }

  await githubRequest("PATCH", `/issues/${issueNumber}`, {
    state: "closed",
    state_reason: "completed",
  });
}

async function main() {
  if (!EVENT_PATH) {
    throw new Error("GITHUB_EVENT_PATH 环境变量缺失");
  }

  const event = JSON.parse(await readFile(EVENT_PATH, "utf8"));
  const issue = event.issue;
  issueNumber = issue?.number || null;

  if (!issue || event.label?.name !== APPROVAL_LABEL || issue.pull_request) {
    console.log("This event is not an approved friend-link issue.");
    return;
  }

  const body = issue.body || "";
  const name = readRequiredText(body, ["站点名称"], "站点名称", 80);
  const url = readUrl(body, ["站点链接"], "站点链接");
  const avatar = readUrl(body, ["头像或图标链接"], "头像或图标链接");
  const description = readRequiredText(body, ["站点简介"], "站点简介", 180);
  const categoryValue = singleLine(getField(body, ["展示分类"])) || "其他";
  const reciprocal = readUrl(body, ["已添加本站的位置"], "已添加本站的位置", false);
  const category = getCategory(categoryValue);

  runGit(["pull", "--rebase", "origin", TARGET_BRANCH]);

  const friends = JSON.parse(await readFile(DATA_PATH, "utf8"));
  if (!Array.isArray(friends)) {
    throw new Error(`${DATA_PATH} 必须是 JSON 数组`);
  }

  const normalizedUrl = comparableUrl(url);
  const alreadyAdded = friends.some((friend) => {
    try {
      return comparableUrl(friend.url) === normalizedUrl;
    } catch {
      return false;
    }
  });

  if (alreadyAdded) {
    await commentIssue(`站点「${name}」已经在友链数据中，没有重复添加。`);
    await closeIssue();
    return;
  }

  const newFriend = {
    label: category.label,
    name,
    url,
    avatar,
    tags: category.tags,
    description,
  };

  if (reciprocal) {
    newFriend.reciprocal = reciprocal;
  }

  friends.push(newFriend);
  await writeFile(DATA_PATH, `${JSON.stringify(friends, null, 2)}\n`);

  runGit(["config", "user.name", "github-actions[bot]"]);
  runGit(["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"]);
  runGit(["add", DATA_PATH]);
  runGit(["commit", "-m", `Add friend link: ${name}`]);
  runGit(["push", "origin", `HEAD:${TARGET_BRANCH}`]);

  await commentIssue(`已通过友链申请，站点「${name}」已经自动添加到友链数据。`);
  await closeIssue();
}

main().catch(async (error) => {
  console.error(error);

  try {
    await commentIssue(`自动添加友链失败：${error.message}`);
  } catch (commentError) {
    console.error(commentError);
  }

  process.exit(1);
});
