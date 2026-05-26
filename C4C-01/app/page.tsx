"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut" as const,
      when: "beforeChildren",
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = session?.user?.role;

  useEffect(() => {
    if (status === "authenticated" && role) {
      if (role === "CAREGIVER") {
        router.replace("/caregiver");
      } else if (role === "FOUNDATION_WORKER") {
        router.replace("/foundation");
      } else if (role === "PATIENT") {
        router.replace("/me/intake");
      } else if (role === "ADMIN") {
        router.replace("/admin/audit");
      }
    }
  }, [status, role, router]);

  if (status === "loading" || (status === "authenticated" && role)) {
    return <LoadingAnimation text="Redirecting to your dashboard..." />;
  }

  const primaryCta =
    role === "CAREGIVER"
      ? { href: "/caregiver", label: "Open Caregiver Dashboard →" }
      : role === "FOUNDATION_WORKER"
        ? { href: "/foundation", label: "Open Foundation Dashboard →" }
        : role === "ADMIN"
          ? { href: "/admin/audit", label: "Open Audit Log →" }
          : role === "PATIENT"
            ? { href: "/me/intake", label: "Open My Health →" }
            : { href: "/signup", label: "Create an account →" };

  return (
    <div className="space-y-12">
      <section className="rounded-3xl bg-gradient-hero px-8 py-16 text-white shadow-glow relative overflow-hidden animate-fade-up">
        {/* Decorative ambient light */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none animate-float" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-xs font-bold uppercase tracking-[0.25em] text-cyan-200">
          AI Family Health Network
        </div>
        <h1 className="relative z-10 mt-4 text-4xl font-extrabold leading-tight md:text-5xl font-display">
          Smart triage for the people you love,
          <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-emerald">wherever they are.</span>
        </h1>
        <p className="relative z-10 mt-5 max-w-2xl text-base text-slate-100/90 leading-relaxed font-sans">
          PulsePoint is a multimodal AI health network for the remote caregiver
          moment. Triage with vitals + symptoms in under a minute, get an
          explainable severity verdict, and share a doctor-ready referral by
          WhatsApp.
        </p>
        <div className="relative z-10 mt-5 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
          <span className="rounded-full bg-white/15 px-3.5 py-1.5 text-white backdrop-blur-sm">Health</span>
          <span className="rounded-full bg-white/15 px-3.5 py-1.5 text-white backdrop-blur-sm">Sanitation</span>
          <span className="rounded-full bg-white/15 px-3.5 py-1.5 text-white backdrop-blur-sm">Community Wellbeing</span>
        </div>
        <div className="relative z-10 mt-8 flex flex-wrap gap-3.5">
          <Link
            href={primaryCta.href}
            className="rounded-xl bg-white px-6 py-3.5 font-bold text-primary shadow-float hover:bg-slate-50 transition-all transform hover:-translate-y-0.5 duration-200 text-sm"
          >
            {primaryCta.label}
          </Link>
          {status === "unauthenticated" && (
            <Link
              href="/login"
              className="rounded-xl bg-white/10 px-6 py-3.5 font-bold text-white border border-white/25 backdrop-blur hover:bg-white/20 transition-all duration-200 text-sm"
            >
              Sign in
            </Link>
          )}
          <Link
            href="/conditions"
            className="rounded-xl bg-white/10 px-6 py-3.5 font-bold text-white border border-white/25 backdrop-blur hover:bg-white/20 transition-all duration-200 text-sm"
          >
            Look up a condition
          </Link>
        </div>
        {role && (
          <div className="relative z-10 mt-6 text-xs text-cyan-100/80">
            Signed in as <span className="font-bold text-white">{session.user.name}</span>{" "}
            ·{" "}
            <span className="rounded-full bg-white/15 px-3 py-1 font-mono text-[10px] font-bold text-white">
              {role}
            </span>
          </div>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            tag: "TRIAGE",
            title: "Is this an emergency right now?",
            body: "Vital-signs guard + LightGBM classifier + RAG-grounded LLM. Five severity tiers, every claim sourced.",
            badgeColor: "bg-primary/10 text-primary border-primary/20",
          },
          {
            tag: "PREDICT",
            title: "What condition does this point to?",
            body: "Top-5 ICD-10 predictions with feature importance. Plain-English condition cards at grade-6 level.",
            badgeColor: "bg-emerald/10 text-emerald border-emerald/20",
          },
          {
            tag: "CONNECT",
            title: "Get a real doctor involved.",
            body: "Doctor-ready referral PDF, nearest government hospital, WhatsApp share — in under 2 minutes.",
            badgeColor: "bg-accent/10 text-accent-foreground border-accent/20",
          },
          {
            tag: "PROTECT",
            title: "Catch outbreaks before they spread.",
            body: "Every triage screens for waterborne and sanitation-linked illness. Symptom clusters surface for district health officers — community wellbeing baked in.",
            badgeColor: "bg-cyan/10 text-cyan border-cyan/20",
          },
        ].map((c) => (
          <div key={c.tag} className="glass bg-gradient-card shadow-card hover:shadow-float hover:-translate-y-1 transition-all duration-300 rounded-2xl p-6 border border-border/30 flex flex-col justify-between h-full animate-scale-in">
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border ${c.badgeColor}`}>
                {c.tag}
              </span>
              <div className="mt-4 text-base font-bold text-foreground leading-snug font-display">{c.title}</div>
              <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed font-sans">{c.body}</p>
            </div>
          </div>
        ))}
      </section>

      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative overflow-hidden rounded-3xl bg-[#0b0f19] bg-gradient-to-br from-[#0b0f19] via-[#101b35] to-[#0b0f19] px-8 py-12 md:p-12 text-white border border-primary/20 shadow-glow space-y-8 animate-fade-up"
      >
        {/* Background glow layers */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-cyan/10 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none animate-float" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl -mr-20 -mb-20 pointer-events-none" />

        <div className="relative z-10">
          <motion.div variants={itemVariants}>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-200 font-display">
              National Impact & Surveillance
            </span>
            <h2 className="mt-2 text-2xl font-bold font-display text-white tracking-tight md:text-3xl">
              Empowering ASHA Workers & India's NCD Fight
            </h2>
            <p className="mt-3 text-sm text-slate-200/90 leading-relaxed max-w-3xl font-sans">
              PulsePoint is designed to integrate seamlessly into India's public health ecosystem, acting as a digital accelerator for community-level diagnostic surveillance.
            </p>
          </motion.div>
        </div>

        {/* Diabetes Stats Grid */}
        <div className="relative z-10 grid gap-6 grid-cols-1 sm:grid-cols-3">
          {[
            {
              stat: "101 Million+",
              label: "Diabetic Population in India",
              description: "The ICMR-INDIAB study highlights India as one of the world's primary diabetes epicenters.",
            },
            {
              stat: "136 Million+",
              label: "Pre-Diabetic Individuals",
              description: "A massive population requiring early lifestyle interventions and active health monitoring.",
            },
            {
              stat: "50%+",
              label: "Cases Remain Undiagnosed",
              description: "Lack of screening infrastructure in rural areas leaves half of diabetic patients untreated.",
            },
          ].map((s, idx) => (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              whileHover={{ 
                scale: 1.03, 
                y: -5,
                borderColor: "rgba(34, 211, 238, 0.4)",
                backgroundColor: "rgba(255, 255, 255, 0.08)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 transition-colors duration-200 cursor-pointer"
            >
              <div className="text-3xl font-black font-display text-cyan-200">{s.stat}</div>
              <div className="text-sm font-bold text-white mt-1.5 font-sans">{s.label}</div>
              <p className="text-xs text-slate-200/80 mt-2 leading-relaxed font-sans">{s.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Detail Columns */}
        <div className="relative z-10 grid gap-8 md:grid-cols-2 pt-6 border-t border-white/10">
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
              <span className="text-cyan-300">🧑‍⚕️</span> ASHA Worker Digital Empowerment
            </h3>
            <p className="text-xs text-slate-200/80 leading-relaxed font-sans">
              ASHA workers are the frontline warriors of Indian healthcare. PulsePoint simplifies their workflow by:
            </p>
            <ul className="space-y-3 text-xs text-slate-200/90 font-sans">
              <li className="flex items-start gap-2.5">
                <span className="text-cyan-300 mt-0.5">•</span>
                <span><strong>Automated Default Tracking:</strong> Triggers Twilio SMS & voice calls immediately if a patient defaults on follow-up checkups.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-cyan-300 mt-0.5">•</span>
                <span><strong>No-Code Intakes:</strong> Allows recording voice symptoms in local dialects, analyzed instantly via LLM transcription.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-cyan-300 mt-0.5">•</span>
                <span><strong>WhatsApp Referral Handover:</strong> Generates instant, doctor-ready patient summaries to share with secondary clinics.</span>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
              <span className="text-cyan-300">🏛️</span> Aligning with Indian Government Schemes
            </h3>
            <p className="text-xs text-slate-200/80 leading-relaxed font-sans">
              Our architecture maps directly to national digital health goals and policies:
            </p>
            <ul className="space-y-3 text-xs text-slate-200/90 font-sans">
              <li className="flex items-start gap-2.5">
                <span className="text-cyan-300 mt-0.5">•</span>
                <span><strong>NPCDCS Support:</strong> Facilitates rural screening for Non-Communicable Diseases (NCDs) in line with National Programme guidelines.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-cyan-300 mt-0.5">•</span>
                <span><strong>Ayushman Bharat HWCs:</strong> Digital referral workflows connect rural sub-centres with primary health physicians.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-cyan-300 mt-0.5">•</span>
                <span><strong>3D Spatiotemporal Mapping:</strong> Clusters disease anomalies and water/sanitation signals for District Health Officers.</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
