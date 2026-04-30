import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Brain,
  ClipboardList,
  Users,
  Trophy,
  Sparkles,
  Search,
  Check,
  GraduationCap,
  Loader2,
  School as SchoolIcon,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/seo/SEO";

const UNI_LEVELS = ["100", "200", "300", "400", "500", "600"];

interface School {
  id: string;
  name: string;
  state: string | null;
}

interface Tutor {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  profile_image_url: string | null;
  department: string | null;
  tutor_code: string | null;
}

const features = [
  {
    icon: Brain,
    title: "AI explanations",
    desc: "Don't just memorise — understand every question with instant AI-powered breakdowns.",
  },
  {
    icon: ClipboardList,
    title: "Past questions & CBT",
    desc: "Practise on real past papers with full CBT exam simulation.",
  },
  {
    icon: Users,
    title: "Follow tutors",
    desc: "Pick the tutors who match your school and level — get their quizzes & updates.",
  },
  {
    icon: Trophy,
    title: "Streaks & leaderboards",
    desc: "Build daily study habits, earn badges and climb the rankings.",
  },
];

const StudentOnboarding = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(0); // 0 welcome · 1 school · 2 level · 3 tutors · 4 done
  const [submitting, setSubmitting] = useState(false);

  // Step 1 — schools
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [requestingSchool, setRequestingSchool] = useState(false);

  // Step 2 — level + department
  const [level, setLevel] = useState<string>("");
  const [department, setDepartment] = useState<string>("");

  // Step 3 — tutors
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loadingTutors, setLoadingTutors] = useState(false);
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) navigate("/auth", { replace: true });
  }, [user, navigate]);

  // Load approved schools (initial + on search)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const q = supabase
        .from("schools")
        .select("id, name, state")
        .eq("status", "approved")
        .order("name")
        .limit(40);
      const { data } = schoolSearch.trim()
        ? await q.ilike("name", `%${schoolSearch.trim()}%`)
        : await q;
      if (!cancelled && data) setSchools(data as School[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [schoolSearch]);

  // When entering step 3, fetch tutors that match the school/department/level
  useEffect(() => {
    if (step !== 3) return;
    let cancelled = false;
    (async () => {
      setLoadingTutors(true);
      // tutor profiles: profiles.id where user has 'tutor' role
      const { data: tutorRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "tutor");
      const tutorIds = (tutorRoles ?? []).map((r) => r.user_id);
      if (tutorIds.length === 0) {
        if (!cancelled) {
          setTutors([]);
          setLoadingTutors(false);
        }
        return;
      }
      let q = supabase
        .from("profiles")
        .select("id, full_name, avatar_url, profile_image_url, department, tutor_code")
        .in("id", tutorIds);
      if (department.trim()) q = q.ilike("department", `%${department.trim()}%`);
      const { data } = await q.limit(24);
      if (!cancelled) {
        setTutors((data as Tutor[]) ?? []);
        setLoadingTutors(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [step, department]);

  const toggleFollow = (id: string) => {
    setFollowed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const requestMySchool = async () => {
    if (!user || !schoolSearch.trim()) return;
    setRequestingSchool(true);
    const { error } = await supabase.from("school_requests").insert({
      requested_by: user.id,
      school_name: schoolSearch.trim(),
    });
    setRequestingSchool(false);
    if (error) {
      toast({ variant: "destructive", title: "Couldn't send request", description: error.message });
      return;
    }
    toast({
      title: "Request sent!",
      description: "We'll add your school as soon as we can.",
    });
  };

  const finish = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      // Save profile metadata
      const academic_metadata = {
        school: selectedSchool?.name ?? null,
        school_id: selectedSchool?.id ?? null,
        level,
      } as any;
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          academic_path: "university",
          academic_metadata,
          department: department || null,
          onboarding_completed: true,
        })
        .eq("id", user.id);
      if (profileErr) throw profileErr;

      // Insert favorites
      if (followed.size > 0) {
        const rows = Array.from(followed).map((tutor_id) => ({
          student_id: user.id,
          tutor_id,
        }));
        // ignore duplicate-row errors gracefully
        await supabase.from("favorite_tutors").upsert(rows, {
          onConflict: "student_id,tutor_id",
          ignoreDuplicates: true,
        });
      }

      await refreshProfile();
      toast({ title: "You're all set!", description: "Welcome aboard 🎉" });
      navigate("/student/dashboard", { replace: true });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Couldn't save",
        description: e?.message ?? "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canNext = useMemo(() => {
    if (step === 1) return !!selectedSchool;
    if (step === 2) return !!level;
    return true; // step 0 always, step 3 even with 0 tutors
  }, [step, selectedSchool, level]);

  const totalSteps = 4;

  return (
    <>
      <SEO title="Welcome to OverraPrep" description="Set up your student profile in under a minute." noindex url="/onboarding/student" />
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress bar */}
          <div className="mb-6 flex items-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
            <span className="ml-2 text-xs text-muted-foreground tabular-nums">
              {Math.min(step + 1, totalSteps)}/{totalSteps}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {/* ============ STEP 0 — Welcome / features ============ */}
            {step === 0 && (
              <motion.section
                key="step-0"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35 }}
                className="bg-card rounded-3xl border border-border shadow-xl p-6 sm:p-8"
              >
                <div className="text-center mb-6">
                  <span className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground items-center justify-center mb-4 shadow-lg">
                    <Sparkles className="w-7 h-7" />
                  </span>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                    Welcome to OverraPrep
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    Here's what you'll unlock — let's set you up in under a minute.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {features.map((f) => (
                    <div key={f.title} className="p-4 rounded-2xl bg-muted/40 border border-border/40">
                      <f.icon className="w-5 h-5 text-primary mb-2" />
                      <p className="text-sm font-semibold text-foreground">{f.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>
                <Button size="lg" className="w-full mt-6 rounded-full" onClick={() => setStep(1)}>
                  Let's set you up <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.section>
            )}

            {/* ============ STEP 1 — Pick school ============ */}
            {step === 1 && (
              <motion.section
                key="step-1"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35 }}
                className="bg-card rounded-3xl border border-border shadow-xl p-6 sm:p-8"
              >
                <div className="mb-5">
                  <span className="inline-flex w-12 h-12 rounded-2xl bg-primary/15 text-primary items-center justify-center mb-3">
                    <SchoolIcon className="w-6 h-6" />
                  </span>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Which school do you attend?
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    We'll match you with tutors and quizzes from your school.
                  </p>
                </div>

                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search your university…"
                    value={schoolSearch}
                    onChange={(e) => setSchoolSearch(e.target.value)}
                    className="pl-9 h-11"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1.5 mb-3 -mx-1 px-1">
                  {schools.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      {schoolSearch ? "No schools match your search yet." : "Loading schools…"}
                    </div>
                  ) : (
                    schools.map((s) => {
                      const active = selectedSchool?.id === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSchool(s)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                            active
                              ? "border-primary bg-primary/10"
                              : "border-border/60 hover:border-primary/40 hover:bg-muted/40"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-semibold text-foreground">{s.name}</p>
                            {s.state && (
                              <p className="text-xs text-muted-foreground">{s.state}</p>
                            )}
                          </div>
                          {active && <Check className="w-4 h-4 text-primary" />}
                        </button>
                      );
                    })
                  )}
                </div>

                {schoolSearch && (
                  <button
                    onClick={requestMySchool}
                    disabled={requestingSchool}
                    className="text-xs text-primary hover:underline disabled:opacity-50"
                  >
                    {requestingSchool
                      ? "Sending…"
                      : `Don't see "${schoolSearch}"? Request to add it →`}
                  </button>
                )}

                <div className="flex gap-2 pt-6">
                  <Button variant="outline" className="rounded-full" onClick={() => setStep(0)}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    className="flex-1 rounded-full"
                    disabled={!canNext}
                    onClick={() => setStep(2)}
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.section>
            )}

            {/* ============ STEP 2 — Level + department ============ */}
            {step === 2 && (
              <motion.section
                key="step-2"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35 }}
                className="bg-card rounded-3xl border border-border shadow-xl p-6 sm:p-8"
              >
                <div className="mb-5">
                  <span className="inline-flex w-12 h-12 rounded-2xl bg-primary/15 text-primary items-center justify-center mb-3">
                    <GraduationCap className="w-6 h-6" />
                  </span>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Your level & department
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    This helps us recommend the right tutors and quizzes for you.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="mb-1.5 block">Level</Label>
                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Choose your level" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNI_LEVELS.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l} Level
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      You can change your level any time from your dashboard.
                    </p>
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Department / course of study</Label>
                    <Input
                      placeholder="e.g. Computer Science"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-6">
                  <Button variant="outline" className="rounded-full" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    className="flex-1 rounded-full"
                    disabled={!canNext}
                    onClick={() => setStep(3)}
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.section>
            )}

            {/* ============ STEP 3 — Follow tutors ============ */}
            {step === 3 && (
              <motion.section
                key="step-3"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35 }}
                className="bg-card rounded-3xl border border-border shadow-xl p-6 sm:p-8"
              >
                <div className="mb-5">
                  <span className="inline-flex w-12 h-12 rounded-2xl bg-primary/15 text-primary items-center justify-center mb-3">
                    <Users className="w-6 h-6" />
                  </span>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Follow your favourite tutors
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pick at least <span className="font-semibold text-foreground">3 tutors</span> for the best recommendations — but you can skip and add later.
                  </p>
                </div>

                {loadingTutors ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading tutors…
                  </div>
                ) : tutors.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-muted/40 border border-border/40 text-center">
                    <Bell className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-semibold text-foreground">
                      No tutors here yet for your department
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      We'll notify you the moment a matching tutor joins. You can continue and follow tutors later from your dashboard.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto -mx-1 px-1">
                      {tutors.map((t) => {
                        const active = followed.has(t.id);
                        const img = t.profile_image_url || t.avatar_url;
                        return (
                          <button
                            key={t.id}
                            onClick={() => toggleFollow(t.id)}
                            className={`relative p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                              active
                                ? "border-primary bg-primary/10 shadow"
                                : "border-border/60 hover:border-primary/40 bg-card"
                            }`}
                          >
                            {active && (
                              <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                <Check className="w-3 h-3" />
                              </span>
                            )}
                            <div className="w-10 h-10 rounded-full bg-muted overflow-hidden mb-2 flex items-center justify-center text-muted-foreground">
                              {img ? (
                                <img src={img} alt={t.full_name ?? "Tutor"} className="w-full h-full object-cover" />
                              ) : (
                                <GraduationCap className="w-5 h-5" />
                              )}
                            </div>
                            <p className="text-xs font-semibold text-foreground line-clamp-1">
                              {t.full_name ?? "Tutor"}
                            </p>
                            {t.department && (
                              <p className="text-[10px] text-muted-foreground line-clamp-1">{t.department}</p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      {followed.size === 0
                        ? "No tutors picked yet."
                        : `${followed.size} tutor${followed.size === 1 ? "" : "s"} selected${
                            followed.size < 3 ? " — pick a few more for the best mix" : " — great mix!"
                          }`}
                    </p>
                  </>
                )}

                <div className="flex gap-2 pt-6">
                  <Button variant="outline" className="rounded-full" onClick={() => setStep(2)}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    className="flex-1 rounded-full"
                    onClick={finish}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Finish & enter app <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
};

export default StudentOnboarding;
