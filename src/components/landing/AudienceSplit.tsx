import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Building2,
  Sparkles,
  Brain,
  Trophy,
  Users,
  ClipboardList,
  Wallet,
  Megaphone,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const studentFeatures = [
  { icon: Brain, label: "AI explanations for every question" },
  { icon: ClipboardList, label: "Past questions & CBT simulation" },
  { icon: Users, label: "Follow your favourite tutors" },
  { icon: Trophy, label: "Streaks, leaderboards & badges" },
  { icon: Sparkles, label: "Personalised exam-readiness plan" },
];

const schoolFeatures = [
  { icon: Users, label: "Students, classes, teachers & parents" },
  { icon: ClipboardList, label: "Attendance & results management" },
  { icon: Wallet, label: "Fees collection with receipts" },
  { icon: Megaphone, label: "Announcements to your community" },
  { icon: CheckCircle2, label: "Verified report cards" },
];

const AudienceSplit = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-8 bg-gradient-to-b from-background via-background to-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 sm:mb-16"
        >
          <p className="text-primary font-medium text-xs sm:text-sm tracking-[0.22em] uppercase mb-3">
            Built for two audiences
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            One platform. <span className="text-gradient-primary italic">Two journeys.</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-muted-foreground text-base sm:text-lg">
            Whether you're a university student preparing for exams or a school owner running operations — we have you covered.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Student card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group relative rounded-3xl bg-card border border-border/60 p-7 sm:p-9 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/15 rounded-full blur-3xl group-hover:bg-primary/25 transition-colors" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                    For University Students
                  </p>
                  <h3 className="font-display text-2xl font-bold text-foreground">
                    Ace every exam, on your terms
                  </h3>
                </div>
              </div>
              <ul className="space-y-3 mb-7">
                {studentFeatures.map((f) => (
                  <li key={f.label} className="flex items-start gap-3 text-sm sm:text-base text-foreground/85">
                    <f.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{f.label}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-full"
                onClick={() => navigate("/auth?intent=student&mode=signup")}
              >
                Get started — free
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                Free forever. Upgrade later when you want premium quizzes & extras.
              </p>
            </div>
          </motion.div>

          {/* School owner card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative rounded-3xl bg-card border border-border/60 p-7 sm:p-9 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden"
          >
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-accent/20 rounded-full blur-3xl group-hover:bg-accent/30 transition-colors" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-foreground to-foreground/70 text-background flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                    For School Owners
                  </p>
                  <h3 className="font-display text-2xl font-bold text-foreground">
                    Run your whole school in one place
                  </h3>
                </div>
              </div>
              <ul className="space-y-3 mb-7">
                {schoolFeatures.map((f) => (
                  <li key={f.label} className="flex items-start gap-3 text-sm sm:text-base text-foreground/85">
                    <f.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{f.label}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto rounded-full border-2"
                onClick={() => navigate("/auth?intent=school&mode=signup")}
              >
                Apply for school management
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                Submit your school details — admin reviews and approves typically within 48 hours.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AudienceSplit;
