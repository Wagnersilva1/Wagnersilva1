import fs from "node:fs/promises";

const token = process.env.METRICS_TOKEN;
const username = process.env.GITHUB_USERNAME || "Wagnersilva1";

if (!token) {
  throw new Error("METRICS_TOKEN is required");
}

const query = `
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            color
            contributionCount
            date
            weekday
          }
        }
      }
    }
  }
}`;

const response = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "profile-contribution-calendar"
  },
  body: JSON.stringify({ query, variables: { login: username } })
});

if (!response.ok) {
  throw new Error(`GitHub GraphQL failed: ${response.status} ${await response.text()}`);
}

const payload = await response.json();
if (payload.errors?.length) {
  throw new Error(payload.errors.map((error) => error.message).join("; "));
}

const calendar = payload.data.user.contributionsCollection.contributionCalendar;
const weeks = calendar.weeks;

const cell = 12;
const gap = 4;
const left = 104;
const top = 68;
const width = 980;
const height = 250;
const graphWidth = weeks.length * (cell + gap);
const graphHeight = 7 * (cell + gap);
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayLabels = [
  { index: 0, label: "Sun" },
  { index: 1, label: "Mon" },
  { index: 3, label: "Wed" },
  { index: 5, label: "Fri" }
];

const days = weeks.flatMap((week) => week.contributionDays);
const max = Math.max(1, ...days.map((day) => day.contributionCount));
const levelColor = (count) => {
  if (count === 0) return "#161B22";
  const ratio = count / max;
  if (ratio <= 0.25) return "#0E4429";
  if (ratio <= 0.5) return "#006D32";
  if (ratio <= 0.75) return "#26A641";
  return "#39D353";
};

const monthLabels = [];
let previousMonth = null;
weeks.forEach((week, weekIndex) => {
  const firstDay = week.contributionDays[0];
  const month = new Date(`${firstDay.date}T00:00:00Z`).getUTCMonth();
  if (month !== previousMonth) {
    monthLabels.push({
      x: left + weekIndex * (cell + gap),
      label: monthNames[month]
    });
    previousMonth = month;
  }
});

const rects = weeks.map((week, weekIndex) => (
  week.contributionDays.map((day) => {
    const x = left + weekIndex * (cell + gap);
    const y = top + day.weekday * (cell + gap);
    const color = levelColor(day.contributionCount);
    return `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="2" fill="${color}">
      <title>${day.date}: ${day.contributionCount} contributions</title>
    </rect>`;
  }).join("\n")
)).join("\n");

const monthText = monthLabels.map(({ x, label }) =>
  `<text x="${x}" y="42" fill="#8B949E" font-family="Segoe UI, Arial, sans-serif" font-size="12">${label}</text>`
).join("\n");

const dayText = dayLabels.map(({ index, label }) =>
  `<text x="36" y="${top + index * (cell + gap) + 10}" fill="#8B949E" font-family="Segoe UI, Arial, sans-serif" font-size="12">${label}</text>`
).join("\n");

const legendX = left + graphWidth - 154;
const legendY = top + graphHeight + 34;

const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="panel" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0D1117"/>
      <stop offset="1" stop-color="#05070D"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="12" fill="url(#panel)" stroke="#30363D"/>
  <text x="28" y="30" fill="#E6EDF3" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="700">Contribution Graph</text>
  <text x="${width - 28}" y="30" text-anchor="end" fill="#39D353" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="700">${calendar.totalContributions.toLocaleString("en-US")} contributions in the last year</text>
  <text x="${left + graphWidth / 2}" y="20" text-anchor="middle" fill="#8B949E" font-family="Segoe UI, Arial, sans-serif" font-size="11">Months</text>
  <text x="22" y="${top + graphHeight / 2}" text-anchor="middle" fill="#8B949E" font-family="Segoe UI, Arial, sans-serif" font-size="11" transform="rotate(-90 22 ${top + graphHeight / 2})">Day of week</text>
  ${monthText}
  ${dayText}
  <g>
    ${rects}
  </g>
  <text x="${legendX - 42}" y="${legendY + 11}" fill="#8B949E" font-family="Segoe UI, Arial, sans-serif" font-size="12">Less</text>
  <rect x="${legendX}" y="${legendY}" width="${cell}" height="${cell}" rx="2" fill="#161B22"/>
  <rect x="${legendX + 18}" y="${legendY}" width="${cell}" height="${cell}" rx="2" fill="#0E4429"/>
  <rect x="${legendX + 36}" y="${legendY}" width="${cell}" height="${cell}" rx="2" fill="#006D32"/>
  <rect x="${legendX + 54}" y="${legendY}" width="${cell}" height="${cell}" rx="2" fill="#26A641"/>
  <rect x="${legendX + 72}" y="${legendY}" width="${cell}" height="${cell}" rx="2" fill="#39D353"/>
  <text x="${legendX + 94}" y="${legendY + 11}" fill="#8B949E" font-family="Segoe UI, Arial, sans-serif" font-size="12">More</text>
</svg>
`;

await fs.writeFile("contribution-calendar.svg", svg);
