# Platform icons

Placeholders. Replace each file with the real logo — same filename, same place,
nothing else to change. The UI loads them by name from `/social/<platform>.png`.

    instagram.png   facebook.png   linkedin.png   x.png   tiktok.png

What to use:
  - 512x512 PNG with transparency, or SVG renamed to .png is NOT ok — keep PNG.
  - Square. The UI rounds the corners itself, so a square logo is fine.
  - Get official assets from each platform's brand page rather than a search
    result: using the wrong mark is a trademark problem, not a design one.
      Instagram / Facebook  https://about.meta.com/brand/resources/
      LinkedIn              https://brand.linkedin.com/downloads
      X                     https://about.x.com/en/who-we-are/brand-toolkit
      TikTok                https://www.tiktok.com/about/brand-guidelines

If a file is missing the UI falls back to a lettered circle, so a bad or absent
icon degrades quietly rather than breaking the page.
