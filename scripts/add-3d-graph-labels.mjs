import fs from "node:fs/promises";

const file = "profile-3d-contrib/profile-night-view.svg";
let svg = await fs.readFile(file, "utf8");

svg = svg.replace(/<g id="perspective-labels">[\s\S]*?<\/g><!-- perspective-labels -->/, "");

const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
const monthLabels = months.map((month, index) => {
  const x = 112 + index * 86;
  const y = 126 + index * 49.6;
  return `<text x="${x}" y="${y}" class="fill-fg" font-size="16" font-weight="700" text-anchor="middle" transform="rotate(30 ${x} ${y})">${month}</text>`;
}).join("\n");

const days = [
  { label: "Sun", x: 112, y: 146 },
  { label: "Mon", x: 92, y: 158 },
  { label: "Wed", x: 52, y: 181 },
  { label: "Fri", x: 12, y: 204 }
].map(({ label, x, y }) =>
  `<text x="${x}" y="${y}" class="fill-fg" font-size="15" font-weight="700" text-anchor="end" transform="rotate(-30 ${x} ${y})">${label}</text>`
).join("\n");

const axisLines = `
  <path d="M132 140 L1188 750" stroke="#eeeeff" stroke-opacity=".28" stroke-width="2" stroke-dasharray="8 8"/>
  <path d="M126 154 L6 224" stroke="#eeeeff" stroke-opacity=".28" stroke-width="2" stroke-dasharray="8 8"/>
`;

const legend = `
  <g transform="translate(52 438)">
    <text x="0" y="0" class="fill-fg" font-size="16" font-weight="700">Contribution scale</text>
    <text x="0" y="34" class="fill-weak" font-size="14">Less</text>
    <rect x="48" y="20" width="18" height="18" rx="3" class="cont-top-0"/>
    <rect x="74" y="20" width="18" height="18" rx="3" class="cont-top-1"/>
    <rect x="100" y="20" width="18" height="18" rx="3" class="cont-top-2"/>
    <rect x="126" y="20" width="18" height="18" rx="3" class="cont-top-3"/>
    <rect x="152" y="20" width="18" height="18" rx="3" class="cont-top-4"/>
    <text x="182" y="34" class="fill-weak" font-size="14">More</text>
  </g>
`;

const labels = `<g id="perspective-labels">
  <text x="646" y="456" class="fill-fg" font-size="18" font-weight="800" text-anchor="middle" transform="rotate(30 646 456)">Months</text>
  <text x="54" y="122" class="fill-fg" font-size="18" font-weight="800" text-anchor="middle" transform="rotate(-30 54 122)">Days</text>
  ${axisLines}
  ${monthLabels}
  ${days}
  ${legend}
</g><!-- perspective-labels -->`;

svg = svg.replace("</svg>", `${labels}</svg>`);
await fs.writeFile(file, svg);
