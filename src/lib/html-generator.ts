import type { ComponentRef, PageSpec } from "@/types/page-spec";

// ---------------------------------------------------------------------------
// generateStandaloneHtml — converts a PageSpec into a self-contained HTML page
// that can be deployed anywhere. Uses Tailwind CDN for styling.
// ---------------------------------------------------------------------------

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function mapComponent(ref: ComponentRef): string {
  const p = ref.props as Record<string, unknown>;

  switch (ref.componentId) {
    case "Hero": {
      const heading = escapeHtml(String(p.heading ?? ""));
      const subtitle = escapeHtml(String(p.subtitle ?? ""));
      const ctaLabel = escapeHtml(String(p.ctaLabel ?? ""));
      const ctaHref = escapeHtml(String(p.ctaHref ?? "#"));
      return `<header class="bg-brand-700 text-white py-16 px-8 text-center">
  <h1 class="text-4xl font-bold mb-4">${heading}</h1>
  ${subtitle ? `<p class="text-xl mb-6 opacity-90">${subtitle}</p>` : ""}
  ${ctaLabel ? `<a href="${ctaHref}" class="inline-block bg-white text-brand-700 font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition">${ctaLabel}</a>` : ""}
</header>`;
    }

    case "Card": {
      const title = escapeHtml(String(p.title ?? ""));
      const body = escapeHtml(String(p.body ?? ""));
      const imageSrc = p.imageSrc ? escapeHtml(String(p.imageSrc)) : null;
      return `<div class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
  ${imageSrc ? `<img src="${imageSrc}" alt="${title}" class="w-full h-48 object-cover" />` : ""}
  <div class="p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-2">${title}</h3>
    <p class="text-sm text-gray-600">${body}</p>
  </div>
</div>`;
    }

    case "CTA": {
      const label = escapeHtml(String(p.label ?? "Learn More"));
      const href = escapeHtml(String(p.href ?? "#"));
      const variant = String(p.variant ?? "primary");
      const btnClass =
        variant === "secondary"
          ? "border border-brand-700 text-brand-700 bg-white hover:bg-brand-100"
          : "bg-brand-700 text-white hover:bg-brand-800";
      return `<div class="text-center py-4">
  <a href="${href}" class="inline-block font-semibold px-6 py-3 rounded-full transition ${btnClass}">${label}</a>
</div>`;
    }

    case "Footer": {
      const text = escapeHtml(String(p.text ?? ""));
      const links = Array.isArray(p.links) ? (p.links as { label: string; href: string }[]) : [];
      return `<footer class="bg-gray-900 text-gray-400 py-8 px-8">
  <div class="flex flex-wrap gap-4 mb-4">
    ${links.map((l) => `<a href="${escapeHtml(l.href ?? "#")}" class="hover:text-white transition">${escapeHtml(l.label ?? "")}</a>`).join("\n    ")}
  </div>
  <p class="text-sm">${text}</p>
</footer>`;
    }

    case "ISIBlock": {
      const content = escapeHtml(String(p.content ?? ""));
      const heading = escapeHtml(String(p.heading ?? "Important Safety Information"));
      return `<div class="border-t-4 border-amber-400 bg-amber-50 p-6 my-4">
  <h3 class="font-bold text-amber-900 mb-2">${heading}</h3>
  <div class="text-sm text-amber-800 whitespace-pre-line">${content}</div>
</div>`;
    }

    case "Disclaimer": {
      const text = escapeHtml(String(p.text ?? ""));
      return `<div class="bg-gray-50 px-6 py-4 text-xs text-gray-500">${text}</div>`;
    }

    case "NavBar": {
      const links = Array.isArray(p.links) ? (p.links as { label: string; href: string }[]) : [];
      const brand = escapeHtml(String(p.brand ?? ""));
      return `<nav class="flex items-center justify-between bg-white border-b border-gray-200 px-8 py-4">
  <span class="font-bold text-brand-700 text-lg">${brand}</span>
  <div class="flex gap-6">
    ${links.map((l) => `<a href="${escapeHtml(l.href ?? "#")}" class="text-sm text-gray-700 hover:text-brand-700 transition">${escapeHtml(l.label ?? "")}</a>`).join("\n    ")}
  </div>
</nav>`;
    }

    case "DataTable": {
      const headers = Array.isArray(p.headers) ? (p.headers as string[]) : [];
      const rows = Array.isArray(p.rows) ? (p.rows as string[][]) : [];
      return `<div class="overflow-x-auto my-4">
  <table class="min-w-full border border-gray-200 text-sm">
    <thead class="bg-gray-50">
      <tr>
        ${headers.map((h) => `<th class="px-4 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">${escapeHtml(String(h))}</th>`).join("\n        ")}
      </tr>
    </thead>
    <tbody>
      ${rows.map((row) => `<tr class="border-b border-gray-100">${(Array.isArray(row) ? row : []).map((cell) => `<td class="px-4 py-2 text-gray-600">${escapeHtml(String(cell))}</td>`).join("")}</tr>`).join("\n      ")}
    </tbody>
  </table>
</div>`;
    }

    case "ClaimReference": {
      const claim = escapeHtml(String(p.claim ?? ""));
      const citation = escapeHtml(String(p.citation ?? ""));
      return `<blockquote class="border-l-4 border-brand-500 bg-brand-100 px-4 py-3 my-4">
  <p class="text-sm text-gray-800">${claim}</p>
  <cite class="text-xs text-gray-500 mt-1 block">${citation}</cite>
</blockquote>`;
    }

    case "SectionHeader": {
      const heading = escapeHtml(String(p.heading ?? ""));
      return `<h2 class="text-2xl font-bold text-gray-900 mb-4">${heading}</h2>`;
    }

    case "ContentBlock": {
      const body = escapeHtml(String(p.body ?? ""));
      return `<div class="prose max-w-none text-gray-700 text-sm mb-4">${body}</div>`;
    }

    case "ImageBlock": {
      const src = escapeHtml(String(p.src ?? ""));
      const alt = escapeHtml(String(p.alt ?? ""));
      return `<div class="my-4"><img src="${src}" alt="${alt}" class="rounded-lg max-w-full" /></div>`;
    }

    default:
      return `<!-- Unknown component: ${escapeHtml(ref.componentId)} -->`;
  }
}

export function generateStandaloneHtml(spec: PageSpec): string {
  const sortedSections = [...(spec.sections ?? [])].sort(
    (a, b) => a.order - b.order,
  );

  const bodyHtml = sortedSections
    .map((section) =>
      `<section id="${escapeHtml(section.id)}">\n${section.components.map((c) => mapComponent(c)).join("\n")}\n</section>`,
    )
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(spec.title)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'brand': {
              100: '#E8E4EE',
              500: '#A78BFA',
              700: '#7C3AED',
              800: '#5E4E6E',
            },
          },
        },
      },
    };
  </script>
</head>
<body class="min-h-screen bg-white text-gray-900 antialiased">
${bodyHtml}
</body>
</html>`;
}
