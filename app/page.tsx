"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, Sparkles } from "lucide-react";

type TemplateKey = "ayyildiz" | "bayrak" | "harita";

type TemplateConfig = {
  label: string;
  fileName: string;
  imageSrc: string;
  textX: number;
  nameY: number;
  titleY: number;
  maxNameWidth: number;
  maxTitleWidth: number;
  nameSize: number;
  titleSize: number;
  removeYellowCorners: boolean;
};

const TEMPLATES: Record<TemplateKey, TemplateConfig> = {
  ayyildiz: {
  label: "Ayyıldız",
  fileName: "ayyildiz-isimlik",
  imageSrc: "/ayyildiz.png",
  textX: 0.50,
  nameY: 0.42,
  titleY: 0.68,
  maxNameWidth: 0.55,
  maxTitleWidth: 0.42,
  nameSize: 44,
  titleSize: 18,
  removeYellowCorners: false,
},
bayrak: {
  label: "Bayrak",
  fileName: "bayrak-isimlik",
  imageSrc: "/bayrak.png",
  textX: 0.50,
  nameY: 0.42,
  titleY: 0.68,
  maxNameWidth: 0.58,
  maxTitleWidth: 0.45,
  nameSize: 44,
  titleSize: 18,
  removeYellowCorners: false,
},
harita: {
  label: "Harita",
  fileName: "harita-isimlik",
  imageSrc: "/harita.png",
  textX: 0.50,
  nameY: 0.45,
  titleY: 0.68,
  maxNameWidth: 0.55,
  maxTitleWidth: 0.43,
  nameSize: 44,
  titleSize: 18,
  removeYellowCorners: true,
},
};

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  baseSize: number,
  maxWidth: number,
  fontFamily: string,
  weight: string
) {
  let size = baseSize;

  while (size > 12) {
    ctx.font = `${weight} ${size}px ${fontFamily}`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 2;
  }

  return size;
}

function drawGoldText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  maxWidth: number,
  fontFamily: string,
  weight: string
) {
  const fitted = fitFontSize(ctx, text, size, maxWidth, fontFamily, weight);

  ctx.font = `${weight} ${fitted}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const metrics = ctx.measureText(text);

  const gradient = ctx.createLinearGradient(
    x - metrics.width / 2,
    y - fitted / 2,
    x + metrics.width / 2,
    y + fitted / 2
  );

  gradient.addColorStop(0, "#fff5ba");
  gradient.addColorStop(0.25, "#f5d36a");
  gradient.addColorStop(0.5, "#b88120");
  gradient.addColorStop(0.75, "#fff0a0");
  gradient.addColorStop(1, "#8d6517");

  ctx.save();

  ctx.shadowColor = "rgba(255, 220, 105, 0.65)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1;

  ctx.fillStyle = gradient;
  ctx.fillText(text, x, y);

  ctx.shadowBlur = 0;
  ctx.lineWidth = Math.max(1, fitted * 0.025);
  ctx.strokeStyle = "rgba(80, 48, 8, 0.55)";
  ctx.strokeText(text, x, y);

  ctx.globalAlpha = 0.45;
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillText(text, x - 1, y - 1);

  ctx.restore();
}

function removeYellowCorners(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const isYellow = r > 145 && g > 105 && b < 75 && r > b * 2;

    if (isYellow) {
      data[i + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [templateKey, setTemplateKey] = useState<TemplateKey>("ayyildiz");
  const [name, setName] = useState("BURAK YILMAZ");
  const [title, setTitle] = useState("GENEL MÜDÜR");
  const [fontFamily, setFontFamily] = useState(
    "Georgia, 'Times New Roman', serif"
  );

  const template = TEMPLATES[templateKey];

  function drawCanvas(download = false) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      if (template.removeYellowCorners) {
        removeYellowCorners(ctx, canvas.width, canvas.height);
      }

      const x = canvas.width * template.textX;
      const nameY = canvas.height * template.nameY;
      const titleY = canvas.height * template.titleY;

      drawGoldText(
        ctx,
        name.toLocaleUpperCase("tr-TR"),
        x,
        nameY,
        template.nameSize,
        canvas.width * template.maxNameWidth,
        fontFamily,
        "700"
      );

      if (title.trim()) {
        drawGoldText(
          ctx,
          title.toLocaleUpperCase("tr-TR"),
          x,
          titleY,
          template.titleSize,
          canvas.width * template.maxTitleWidth,
          fontFamily,
          "600"
        );
      }

      if (download) {
        const cleanName = name
          .toLocaleLowerCase("tr-TR")
          .replaceAll(" ", "-")
          .replaceAll("ı", "i")
          .replaceAll("ğ", "g")
          .replaceAll("ü", "u")
          .replaceAll("ş", "s")
          .replaceAll("ö", "o")
          .replaceAll("ç", "c");

        const link = document.createElement("a");
        link.download = `${template.fileName}-${cleanName}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    };

    img.src = `${template.imageSrc}?v=${Date.now()}`;
  }

  useEffect(() => {
    drawCanvas(false);
  }, [templateKey, name, title, fontFamily]);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[390px_1fr] gap-6">
        <aside className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="text-yellow-400" size={22} />
            <h1 className="text-xl font-bold">İsimlik Önizleme</h1>
          </div>

          <label className="block text-sm text-neutral-400 mb-2">Şablon</label>

          <div className="grid grid-cols-3 gap-2 mb-5">
            {Object.entries(TEMPLATES).map(([key, item]) => (
              <button
                key={key}
                onClick={() => setTemplateKey(key as TemplateKey)}
                className={`rounded-xl px-3 py-3 text-sm border transition ${
                  templateKey === key
                    ? "border-yellow-400 bg-yellow-400/10 text-yellow-300"
                    : "border-neutral-700 bg-neutral-800 hover:bg-neutral-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Ad Soyad</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-neutral-950 border border-neutral-700 px-4 py-3 outline-none focus:border-yellow-400"
                placeholder="Örn: Ali Rıza Karakaya"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">Ünvan / Makam</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl bg-neutral-950 border border-neutral-700 px-4 py-3 outline-none focus:border-yellow-400"
                placeholder="Örn: Genel Müdür"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">Font</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full rounded-xl bg-neutral-950 border border-neutral-700 px-4 py-3 outline-none focus:border-yellow-400"
              >
                <option value="Georgia, 'Times New Roman', serif">Klasik Serif</option>
                <option value="'Times New Roman', Times, serif">Times</option>
                <option value="Arial, Helvetica, sans-serif">Modern Sans</option>
              </select>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
            Şablonlar uygulamanın içinden otomatik gelir. Her seferinde PNG yüklemene gerek yok cnm.
          </div>

          <button
            onClick={() => drawCanvas(true)}
            className="mt-6 w-full rounded-xl bg-yellow-500 text-black font-bold py-3 flex items-center justify-center gap-2 hover:bg-yellow-400"
          >
            <Download size={18} />
            PNG İndir
          </button>
        </aside>

        <section className="bg-neutral-700 border border-neutral-800 rounded-2xl p-4 md:p-8 shadow-2xl flex items-center justify-center min-h-[520px]">
          <canvas ref={canvasRef} className="max-w-full rounded-xl" />
        </section>
      </div>
    </main>
  );
}
