// ============================================================
// Central site content & configuration.
// Edit this file to update your name, contact details, links and
// navigation across the whole site in one place.
// ============================================================

export const site = {
  name: "Alex Yusupov",
  studio: "Dreamcatcher Productions",
  role: "Graphic Designer · Cinematographer · VFX Artist · Illustrator",
  // Full slogan shown over the hero video on the splash page.
  slogan:
    "Weaving digital magic as a Graphic Designer, Illustrator, Cinematographer and VFX Artist, crafting pixels that dazzle and delight users with every viewing.",
  // Shorter tagline used for meta descriptions / social sharing.
  tagline:
    "Weaving digital magic across graphic design, film, visual effects and illustration.",

  // Contact
  email: "alexyusupov.tech@gmail.com",
  location: "Phoenix, Arizona",

  // Social links
  socials: [
    { label: "Instagram", handle: "@_dreamcatcher_productions_", url: "https://www.instagram.com/_dreamcatcher_productions_/" },
    { label: "YouTube", handle: "@Dreamcatcher_Productions", url: "https://www.youtube.com/@Dreamcatcher_Productions" },
  ],
};

// The four disciplines = the four main navigation tabs = the four
// gallery pages. `folder` is the drop folder under assets/work/.
export const disciplines = [
  { key: "design",       title: "Design",       href: "/design",       folder: "Design",
    blurb: "From a single logo to a complete brand system, this is design that earns a second look. Every mark, layout and typographic choice is drawn with intent in Illustrator and Photoshop, balancing bold visual impact with the clarity that makes a message land. Considered, striking, and built to last." },
  { key: "motion",       title: "Motion",       href: "/motion",       folder: "Motion",
    blurb: "Cinematography and motion with a pulse. Every sequence is shot, cut and paced to pull people in and keep them watching, turning raw footage into stories that carry real momentum. Whether it's a short film, a promo or a title sequence, the goal stays the same: make you feel something, frame after frame." },
  { key: "vfx",          title: "VFX",          href: "/vfx",          folder: "VFX",
    blurb: "This is where the impossible gets composited into place. Blending AI driven techniques with hands on craft, I animate, enhance and seamlessly integrate effects that push what a single frame can hold. From subtle cleanups to full blown spectacle, every shot is built to feel invisible and unforgettable at once." },
  { key: "illustration", title: "Illustration", href: "/illustration", folder: "Illustration",
    blurb: "Characterful, original artwork with a voice all its own. Drawn by hand and refined digitally, my illustration work gives a project personality you simply can't fake, from playful characters to intricate detail. Art that adds warmth, story and a welcome spark of the unexpected." },
];

// Primary nav = the four disciplines. (Contact sits separately, top-right.)
export const nav = disciplines.map((d) => ({ label: d.title, href: d.href }));

export function getDiscipline(key: string) {
  return disciplines.find((d) => d.key === key);
}
