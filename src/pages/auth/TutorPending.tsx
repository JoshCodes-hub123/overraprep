import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo/SEO";
import logo from "@/assets/logo.png";

const TutorPending = () => {
  const navigate = useNavigate();
  return (
    <>
      <SEO title="Application received" description="Your tutor application is under review." noindex url="/auth/tutor-pending" />
      <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-b from-background via-background to-muted/30">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-card rounded-3xl border border-border shadow-xl p-8 text-center"
        >
          <img src={logo} alt="OverraPrep" className="h-12 w-auto mx-auto mb-5" />
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/15 flex items-center justify-center mb-5">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Application received
          </h1>
          <p className="mt-3 text-muted-foreground">
            Thanks for applying to teach on OverraPrep. Our admin team is reviewing your application — you'll get an email the moment you're approved.
          </p>

          <div className="mt-7 space-y-3 text-left">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">Account created</p>
                <p className="text-xs text-muted-foreground">You can sign in any time, but the tutor dashboard unlocks after approval.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
              <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">Watch your inbox</p>
                <p className="text-xs text-muted-foreground">Approval typically takes 24–48 hours.</p>
              </div>
            </div>
          </div>

          <Button className="w-full mt-7 rounded-full" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to home
          </Button>
        </motion.div>
      </main>
    </>
  );
};

export default TutorPending;
