import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const alt = "HIPPOCAMPUS — Club de Plongée Sous-Marine à Sissonne";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [logoBuffer, frameBuffer] = await Promise.all([
    readFile(join(process.cwd(), "public/assets/photos/logo-cyan.png")),
    readFile(join(process.cwd(), "public/assets/video/hero-poster.jpeg")),
  ]);
  const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  const frameBase64 = `data:image/jpeg;base64,${frameBuffer.toString("base64")}`;

  // Helper: fetch font file URL from Google Fonts CSS
  async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`,
      { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1" } }
    ).then((r) => r.text());
    const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
    if (!match) throw new Error(`Font not found: ${family}`);
    return fetch(match[1]).then((r) => r.arrayBuffer());
  }

  const [notoSerifBold, manrope] = await Promise.all([
    loadGoogleFont("Noto+Serif", 700),
    loadGoogleFont("Manrope", 600),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          backgroundImage: `url(${frameBase64})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#040E1A",
        }}
      >
        {/* Dark overlay to ensure text readability */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(180deg, rgba(4,14,26,0.45) 0%, rgba(4,14,26,0.6) 50%, rgba(4,14,26,0.75) 100%)",
          }}
        />

        {/* Subtle border frame */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            right: 24,
            bottom: 24,
            border: "1px solid rgba(213, 228, 247, 0.08)",
            borderRadius: 24,
          }}
        />

        {/* Logo */}
        <img
          src={logoBase64}
          width={150}
          height={150}
          style={{ objectFit: "contain", position: "relative" }}
        />

        {/* Title */}
        <div
          style={{
            fontFamily: "Noto Serif",
            fontSize: 72,
            fontWeight: 700,
            color: "#d5e4f7",
            marginTop: 16,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            position: "relative",
            textShadow: "0 2px 20px rgba(4,14,26,0.8)",
          }}
        >
          HIPPOCAMPUS
        </div>

        {/* Cyan separator line */}
        <div
          style={{
            width: 60,
            height: 2,
            background: "#38D9DC",
            marginTop: 18,
            borderRadius: 1,
            position: "relative",
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            fontFamily: "Manrope",
            fontSize: 20,
            fontWeight: 600,
            color: "#38D9DC",
            marginTop: 16,
            letterSpacing: "0.25em",
            textTransform: "uppercase" as const,
            position: "relative",
            textShadow: "0 1px 10px rgba(4,14,26,0.9)",
          }}
        >
          Club de Plongée Sous-Marine
        </div>

        {/* Location */}
        <div
          style={{
            fontFamily: "Manrope",
            fontSize: 15,
            color: "rgba(186, 201, 201, 0.7)",
            marginTop: 8,
            letterSpacing: "0.15em",
            position: "relative",
            textShadow: "0 1px 8px rgba(4,14,26,0.9)",
          }}
        >
          Sissonne — Aisne — Depuis 2010
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Noto Serif", data: notoSerifBold, weight: 700, style: "normal" },
        { name: "Manrope", data: manrope, weight: 600, style: "normal" },
      ],
    }
  );
}
