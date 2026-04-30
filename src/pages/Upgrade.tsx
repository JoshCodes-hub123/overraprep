import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Sparkles, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo/SEO";
import { useToast } from "@/hooks/use-toast";

const packs = [
  {
    name: "Starter",
    tokens: 100,
    icon: Sparkles,
    tag: "Try premium",
    perks: ["Unlock 5 premium quizzes", "Extended AI explanations", "Save your progress"],
    accent: "from-primary/30 to-primary/10",
  },
  {
    name: "Scholar",
    tokens: 500,
    icon: Zap,
    tag: "Most popular",
    featured: true,
    perks: [
      "Everything in Starter",
      "Survival kits & study packs",
      "Priority tutor Q&A",
      "Unlimited bookmarks",
    ],
    accent: "from-primary to-primary/60",
  },
  {
    name: "Mastery",
    tokens: 1000,
    icon: Crown,
    tag: "Exam season",
    perks: [
      "Everything in Scholar",
      "Full CBT simulation library",
      "Weak-area drills",
      "Exam-readiness coaching",
    ],
    accent: "from-amber-500/40 to-primary/10",
  },
];

const Upgrade = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <>
      <SEO title="Upgrade to Premium" description="Unlock premium quizzes, survival kits and more." noindex url="/upgrade" />
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 px-4 sm:px-8 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <p className="text-primary font-medium text-xs sm:text-sm tracking-[0.22em] uppercase mb-2">
              Free forever — upgrade when ready
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
              Unlock your <span className="text-gradient-primary italic">full potential</span>
            </h1>
            <p className="mt-4 max-w-xl mx-auto text-muted-foreground text-base sm:text-lg">
              Our premium token packs will be available soon. Pick the plan that excites you most — we'll let you know the moment it goes live.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
            {packs.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                className={`relative rounded-3xl bg-card border p-7 shadow-lg ${
                  p.featured ? "border-primary/60 ring-2 ring-primary/30 md:scale-105" : "border-border/60"
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow">
                    {p.tag}
                  </span>
                )}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.accent} text-primary-foreground flex items-center justify-center mb-4`}>
                  <p.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">{p.name}</h3>
                <p className="text-sm text-muted-foreground">{!p.featured && p.tag}</p>
                <div className="mt-4 mb-5 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-primary">{p.tokens}</span>
                  <span className="text-sm text-muted-foreground">tokens</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-foreground/85">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full rounded-full"
                  variant={p.featured ? "default" : "outline"}
                  onClick={() =>
                    toast({
                      title: "Coming soon!",
                      description: `We'll notify you the moment the ${p.name} pack is live.`,
                    })
                  }
                >
                  Notify me
                </Button>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-10">
            All features are currently free while we finalise our payment integration for Nigerian sellers.
          </p>
        </div>
      </main>
    </>
  );
};

export default Upgrade;
