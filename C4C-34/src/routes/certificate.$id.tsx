import { API_BASE } from "@/lib/api-base";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

export const Route = createFileRoute("/certificate/$id")({
  head: () => ({ meta: [{ title: "Certificate of Completion - HastKala" }] }),
  component: CertificatePage,
});

const API = API_BASE;

type CertificateMember = {
  id?: string;
  name: string;
  location?: string;
  certifiedAt?: string;
  certNumber?: string;
  communityHead?: string;
};

const fallbackMember = (id: string): CertificateMember => ({
  id,
  name: "Meena Patil",
  location: "Dharwad, Karnataka",
  certifiedAt: new Date().toISOString(),
  communityHead: "Banu",
});

// Design tokens — single source of truth
const COLORS = {
  paper: "#fbf8f2",
  paperDeep: "#f5f0e8",
  ink: "#272321",
  inkSoft: "#34302d",
  accent: "#9b363b",
  accentDeep: "#7f2d31",
  border: "#9b363b",
};

function CertificatePage() {
  const { id } = Route.useParams();
  const [member, setMember] = useState<CertificateMember | null>(null);
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    fetch(`${API}/api/community/members/${id}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((payload) => {
        if (!payload.success) throw new Error("not found");
        setMember(payload.data);
      })
      .catch(() => setMember(fallbackMember(id)))
      .finally(() => clearTimeout(timeout));
  }, [id]);

  const cert = useMemo(() => {
    if (!member) return null;
    const issuedDate = member.certifiedAt ? new Date(member.certifiedAt) : new Date();
    const year = issuedDate.getFullYear();
    const seed = (member.id || id)
      .replace(/[^a-z0-9]/gi, "")
      .slice(0, 4)
      .toUpperCase();
    return {
      name: member.name,
      certificateId: member.certNumber || `HK-${year}-${seed || "001"}`,
      issuedOn: issuedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      programLead: member.communityHead || "Banu",
      karigarSakhi: member.location ? `${member.location.split(",")[0]} Sakhi` : "Karigar Sakhi",
      verifyUrl: `${typeof window !== "undefined" ? window.location.origin : ""}/certificate/${id}`,
    };
  }, [id, member]);

  async function downloadPdf() {
    if (!certRef.current || !cert) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 3,
        backgroundColor: COLORS.paper,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 297
      const pageHeight = pdf.internal.pageSize.getHeight(); // 210
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
      pdf.save(`HastKala-Certificate-${cert.certificateId}.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  if (!cert) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f4ee]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9b363b]">
          Preparing certificate...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#d7cec4] px-4 py-8 pb-24">
      {/* top bar */}
      <div className="mx-auto mb-5 flex max-w-[1120px] items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9b363b]">
            HastKala certificate
          </p>
          <h1 className="font-display text-3xl font-medium text-[#272321]">
            Certificate of Completion
          </h1>
        </div>
        <button
          onClick={downloadPdf}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-sm bg-[#9b363b] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#9b363b]/20 transition hover:bg-[#7f2d31] disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          {downloading ? "Generating..." : "Download PDF"}
        </button>
      </div>

      {/* certificate canvas — fixed aspect 297/210 (A4 landscape) */}
      <section className="mx-auto max-w-[1120px]">
        <div
          ref={certRef}
          className="relative w-full overflow-hidden shadow-2xl shadow-black/20"
          style={{
            aspectRatio: "297 / 210",
            backgroundColor: COLORS.paper,
          }}
        >
          <Certificate cert={cert} />
        </div>
      </section>
    </main>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Certificate visual — pure HTML/SVG, no JPEG.
// All measurements use % so it scales perfectly with the parent container.
// ────────────────────────────────────────────────────────────────────────────
function Certificate({ cert }: { cert: NonNullable<ReturnType<typeof useCert>> }) {
  return (
    <div
      className="absolute inset-0"
      style={{ backgroundColor: COLORS.paper, fontFamily: "var(--font-sans, system-ui)" }}
    >
      {/* decorative background pattern (subtle) */}
      <BackgroundPattern />

      {/* outer & inner ornamental borders */}
      <BorderFrame />

      {/* corner ornaments */}
      <CornerOrnament position="tl" />
      <CornerOrnament position="tr" />
      <CornerOrnament position="bl" />
      <CornerOrnament position="br" />

      {/* content */}
      <div className="absolute inset-0 flex flex-col items-center px-[7%] pt-[5%] pb-[4%]">
        {/* HEADER — HastKala wordmark */}
        <div className="text-center">
          <h2
            className="font-display leading-none"
            style={{
              color: COLORS.ink,
              fontSize: "clamp(1.4rem, 3.4vw, 3rem)",
              letterSpacing: "0.01em",
              fontWeight: 500,
            }}
          >
            HastKala
          </h2>
          <Divider width="22%" />
          <p
            className="mt-[0.6%]"
            style={{
              color: COLORS.ink,
              fontSize: "clamp(0.55rem, 1vw, 0.9rem)",
              letterSpacing: "0.04em",
            }}
          >
            Voice-first Market Access for Women Artisans
          </p>
        </div>

        {/* TITLE */}
        <h1
          className="mt-[1.8%] font-display text-center leading-none whitespace-nowrap"
          style={{
            color: COLORS.ink,
            fontSize: "clamp(2rem, 5.2vw, 4.6rem)",
            fontWeight: 500,
            letterSpacing: "0.01em",
          }}
        >
          Certificate of Completion
        </h1>

        {/* subtitle "Karigar Cohort" with flanking ornaments */}
        <div className="mt-[1%] flex items-center gap-[1.5%] whitespace-nowrap">
          <SmallOrnament />
          <span
            className="font-display italic whitespace-nowrap"
            style={{
              color: COLORS.accent,
              fontSize: "clamp(1.1rem, 2.6vw, 2.2rem)",
              fontWeight: 400,
            }}
          >
            Karigar Cohort
          </span>
          <SmallOrnament />
        </div>

        {/* "THIS CERTIFIES THAT" */}
        <p
          className="mt-[2%] uppercase"
          style={{
            color: COLORS.ink,
            letterSpacing: "0.32em",
            fontSize: "clamp(0.65rem, 1.15vw, 1rem)",
            fontWeight: 500,
          }}
        >
          This certifies that
        </p>

        {/* RECIPIENT NAME */}
        <div className="mt-[1%] w-[70%] text-center">
          <p
            className="font-display leading-none whitespace-nowrap"
            style={{
              color: COLORS.ink,
              fontSize: "clamp(2rem, 5.6vw, 5rem)",
              fontWeight: 400,
              letterSpacing: "0.01em",
            }}
          >
            {cert.name}
          </p>
          <div className="mt-[2.5%] h-px w-full" style={{ backgroundColor: COLORS.inkSoft }} />
        </div>

        {/* BODY */}
        <p
          className="mt-[1.8%] text-center"
          style={{
            color: COLORS.ink,
            fontSize: "clamp(0.7rem, 1.2vw, 1rem)",
            lineHeight: 1.55,
            maxWidth: "62%",
          }}
        >
          has successfully completed the 7-Day Karigar Cohort and demonstrated seller readiness in
          product listing, fair pricing, packaging, payment safety, and order handling.
        </p>

        <Divider width="14%" thin />

        <p
          className="mt-[0.8%] italic text-center"
          style={{
            color: COLORS.accent,
            fontSize: "clamp(0.65rem, 1.05vw, 0.9rem)",
            fontWeight: 500,
          }}
        >
          This certification unlocks direct seller access on HastKala.
        </p>

        {/* spacer */}
        <div className="flex-1" />

        {/* FOOTER ROW: cert id | date | seal | signatures | qr */}
        <div className="grid w-full grid-cols-[1fr_1fr_auto_1.4fr_1.4fr_1fr] items-end gap-[2.5%]">
          <FooterField label="Certificate ID" value={cert.certificateId} mono />
          <FooterField label="Date Issued" value={cert.issuedOn} mono />
          <VerifiedSealBadge />
          <SignatureField label="Program Lead" name={cert.programLead} />
          <SignatureField label="Karigar Sakhi" name={cert.karigarSakhi} />
          <div className="flex flex-col items-center">
            <span
              className="mb-[10%] uppercase"
              style={{
                color: COLORS.accent,
                fontSize: "clamp(0.45rem, 0.7vw, 0.6rem)",
                letterSpacing: "0.18em",
                fontWeight: 600,
              }}
            >
              Verification
            </span>
            <div
              className="aspect-square w-full p-[6%]"
              style={{
                backgroundColor: "#fff",
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <QRCodeSVG
                value={cert.verifyUrl}
                level="M"
                bgColor="#ffffff"
                fgColor={COLORS.ink}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── helper hook so TS knows cert shape ────────────────────────────────────
function useCert() {
  return null as unknown as {
    name: string;
    certificateId: string;
    issuedOn: string;
    programLead: string;
    karigarSakhi: string;
    verifyUrl: string;
  } | null;
}

// ────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ────────────────────────────────────────────────────────────────────────────

function Divider({ width = "20%", thin = false }: { width?: string; thin?: boolean }) {
  return (
    <div className="mt-[0.8%] flex items-center justify-center gap-[6px]" style={{ width }}>
      <div
        className="flex-1"
        style={{
          height: thin ? "0.5px" : "1px",
          backgroundColor: COLORS.accent,
        }}
      />
      <div
        style={{
          width: 6,
          height: 6,
          backgroundColor: COLORS.accent,
          transform: "rotate(45deg)",
        }}
      />
      <div
        className="flex-1"
        style={{
          height: thin ? "0.5px" : "1px",
          backgroundColor: COLORS.accent,
        }}
      />
    </div>
  );
}

function SmallOrnament() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: "clamp(0.7rem,1.4vw,1.2rem)", height: "auto" }}>
      <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill={COLORS.accent} />
    </svg>
  );
}

function BackgroundPattern() {
  // subtle large geometric motifs in corners
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1000 707"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <pattern id="hk-mesh" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
          <path
            d="M0 18 L18 0 L36 18 L18 36 Z"
            fill="none"
            stroke={COLORS.inkSoft}
            strokeWidth="0.4"
            opacity="0.18"
          />
        </pattern>
      </defs>
      {/* left mesh */}
      <rect x="0" y="180" width="220" height="380" fill="url(#hk-mesh)" />
      {/* right mesh */}
      <rect x="780" y="180" width="220" height="380" fill="url(#hk-mesh)" />
    </svg>
  );
}

function BorderFrame() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1000 707"
      preserveAspectRatio="none"
      aria-hidden
    >
      {/* outer border */}
      <rect
        x="14"
        y="14"
        width="972"
        height="679"
        fill="none"
        stroke={COLORS.accent}
        strokeWidth="2"
      />
      {/* inner border */}
      <rect
        x="22"
        y="22"
        width="956"
        height="663"
        fill="none"
        stroke={COLORS.accent}
        strokeWidth="0.7"
      />
    </svg>
  );
}

function CornerOrnament({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const transform = {
    tl: "rotate(0deg)",
    tr: "rotate(90deg)",
    bl: "rotate(-90deg)",
    br: "rotate(180deg)",
  }[position];

  const placement = {
    tl: { top: "1.2%", left: "1.2%" },
    tr: { top: "1.2%", right: "1.2%" },
    bl: { bottom: "1.2%", left: "1.2%" },
    br: { bottom: "1.2%", right: "1.2%" },
  }[position];

  return (
    <div
      className="absolute"
      style={{
        ...placement,
        width: "4.2%",
        height: "5.9%",
        transform,
        transformOrigin: "center",
      }}
    >
      <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
        <path
          d="M2 2 L20 2 M2 2 L2 20 M2 2 Q12 8 8 14 Q14 12 20 14 M14 8 Q18 14 14 18"
          stroke={COLORS.accent}
          strokeWidth="0.8"
          fill="none"
        />
        <circle cx="2" cy="2" r="1.8" fill={COLORS.accent} />
        <path d="M6 6 L10 10" stroke={COLORS.accent} strokeWidth="0.6" />
      </svg>
    </div>
  );
}

function FooterField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <SmallOrnamentLine />
      <span
        className="mt-[8%] uppercase"
        style={{
          color: COLORS.accent,
          fontSize: "clamp(0.45rem, 0.7vw, 0.6rem)",
          letterSpacing: "0.18em",
          fontWeight: 600,
        }}
      >
        {label}
      </span>
      <span
        className="mt-[6%]"
        style={{
          color: COLORS.ink,
          fontSize: "clamp(0.6rem, 0.95vw, 0.85rem)",
          letterSpacing: mono ? "0.08em" : "normal",
          fontFamily: mono ? "ui-monospace, SFMono-Regular, monospace" : "inherit",
          fontWeight: 500,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function SmallOrnamentLine() {
  return (
    <svg viewBox="0 0 60 6" style={{ width: "60%", height: "auto" }} aria-hidden>
      <line x1="0" y1="3" x2="22" y2="3" stroke={COLORS.accent} strokeWidth="0.5" />
      <path d="M30 0 L33 3 L30 6 L27 3 Z" fill="none" stroke={COLORS.accent} strokeWidth="0.5" />
      <line x1="38" y1="3" x2="60" y2="3" stroke={COLORS.accent} strokeWidth="0.5" />
    </svg>
  );
}

function SignatureField({ label, name }: { label: string; name: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <p
        className="font-display italic leading-none"
        style={{
          color: COLORS.ink,
          fontSize: "clamp(0.95rem, 1.9vw, 1.6rem)",
          fontWeight: 400,
        }}
      >
        {name}
      </p>
      <div className="mt-[8%] h-px w-full" style={{ backgroundColor: COLORS.inkSoft }} />
      <span
        className="mt-[6%] uppercase"
        style={{
          color: COLORS.accent,
          fontSize: "clamp(0.45rem, 0.7vw, 0.6rem)",
          letterSpacing: "0.18em",
          fontWeight: 600,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function VerifiedSealBadge() {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: "clamp(60px, 9vw, 110px)",
        aspectRatio: "1 / 1",
      }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        {/* outer scalloped ring */}
        <g fill="none" stroke={COLORS.accent} strokeWidth="1">
          <circle cx="50" cy="50" r="48" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="42" />
          <circle cx="50" cy="50" r="38" strokeWidth="0.5" />
        </g>
        {/* tiny tick marks around the ring */}
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i * 360) / 36;
          const rad = (a * Math.PI) / 180;
          const x1 = 50 + Math.cos(rad) * 44;
          const y1 = 50 + Math.sin(rad) * 44;
          const x2 = 50 + Math.cos(rad) * 47;
          const y2 = 50 + Math.sin(rad) * 47;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={COLORS.accent}
              strokeWidth="0.6"
            />
          );
        })}
        {/* center diamond ornament */}
        <path d="M50 28 L54 38 L64 42 L54 46 L50 56 L46 46 L36 42 L46 38 Z" fill={COLORS.accent} />
      </svg>
      <div className="relative flex flex-col items-center leading-tight">
        <span
          className="uppercase"
          style={{
            color: COLORS.accent,
            fontSize: "clamp(0.5rem, 0.85vw, 0.75rem)",
            letterSpacing: "0.16em",
            fontWeight: 700,
            marginTop: "30%",
          }}
        >
          Certified
        </span>
        <span
          className="uppercase"
          style={{
            color: COLORS.accent,
            fontSize: "clamp(0.5rem, 0.85vw, 0.75rem)",
            letterSpacing: "0.16em",
            fontWeight: 700,
          }}
        >
          Seller
        </span>
      </div>
    </div>
  );
}
