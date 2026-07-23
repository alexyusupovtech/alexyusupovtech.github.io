// One command to put new work online:
//   optimize assets  ->  commit  ->  push (which auto-deploys the live site)
//
// Usage:
//   npm run publish
//   npm run publish -- "add three new posters"   (optional custom message)
import { execSync } from "node:child_process";

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: "inherit", ...opts });
}

try {
  console.log("\n[1/3] Optimizing assets…");
  run("py scripts/optimize_assets.py");

  console.log("\n[2/3] Saving changes…");
  run("git add -A");

  // Is there anything staged to commit?
  let hasChanges = true;
  try {
    execSync("git diff --cached --quiet"); // exits 0 = no changes
    hasChanges = false;
  } catch {
    hasChanges = true;
  }

  if (hasChanges) {
    const custom = process.argv.slice(2).join(" ").trim();
    const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
    const msg = custom || `Update site ${stamp}`;
    run(`git commit -m "${msg.replace(/"/g, "'")}"`);
  } else {
    console.log("   Nothing new to commit.");
  }

  console.log("\n[3/3] Publishing (deploying live)…");
  run("git push");

  console.log("\n✅ Done! Your site updates at https://alexyusupovtech.github.io in about a minute.");
} catch (e) {
  console.error("\n❌ Something went wrong above. Fix it or tell Claude and re-run `npm run publish`.");
  process.exit(1);
}
