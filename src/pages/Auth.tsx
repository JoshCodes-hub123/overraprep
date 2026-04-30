import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  Gift,
  GraduationCap,
  Presentation,
  Building2,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { SEO } from "@/components/seo/SEO";

type Intent = "student" | "tutor" | "school";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

const intents: { id: Intent; label: string; sub: string; icon: typeof GraduationCap }[] = [
  { id: "student", label: "I'm a student", sub: "Practise & ace exams", icon: GraduationCap },
  { id: "tutor", label: "I'm a tutor", sub: "Apply to teach", icon: Presentation },
  { id: "school", label: "I run a school", sub: "Apply for management", icon: Building2 },
];

const Auth = () => {
  const [searchParams] = useSearchParams();
  const referralCodeFromUrl = searchParams.get("ref") || "";
  const intentFromUrl = (searchParams.get("intent") as Intent) || "student";
  const modeFromUrl = searchParams.get("mode");

  const [isSignUp, setIsSignUp] = useState(
    modeFromUrl === "signup" || !!referralCodeFromUrl || !!searchParams.get("intent")
  );
  const [intent, setIntent] = useState<Intent>(intentFromUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      referralCode: referralCodeFromUrl,
    },
  });

  const handleSignIn = async (data: SignInFormData) => {
    setIsSubmitting(true);
    const { error } = await signIn(data.email, data.password);
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description:
          error.message === "Invalid login credentials"
            ? "Invalid email or password. Please try again."
            : error.message,
      });
    } else {
      toast({ title: "Welcome back!", description: "You have successfully signed in." });
      navigate("/dashboard");
    }
    setIsSubmitting(false);
  };

  const handleSignUp = async (data: SignUpFormData) => {
    setIsSubmitting(true);
    const { error } = await signUp(data.email, data.password, data.fullName, data.referralCode);
    if (error) {
      let message = error.message;
      if (error.message.includes("already registered")) {
        message = "This email is already registered. Please sign in instead.";
      }
      toast({ variant: "destructive", title: "Sign up failed", description: message });
      setIsSubmitting(false);
      return;
    }

    // Branch by intent. Default trigger creates a student role + wallet.
    if (intent === "tutor") {
      toast({
        title: "Account created",
        description: "Now tell us about you to complete your tutor application.",
      });
      navigate("/apply-tutor");
    } else if (intent === "school") {
      toast({
        title: "Account created",
        description: "Now register your school for admin approval.",
      });
      navigate("/school/register");
    } else {
      toast({
        title: "Welcome to OverraPrep!",
        description: "Let's get you set up in under a minute.",
      });
      navigate("/onboarding/student");
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <SEO
        title={isSignUp ? "Create account" : "Sign in"}
        description="Sign in or create an account to access AI-powered exam prep & school management on OverraPrep."
        noindex
        url="/auth"
      />
      <main
        className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 py-10"
        role="main"
      >
        <article className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <a href="/" className="inline-flex items-center group">
              <img src={logo} alt="OverraPrep AI" className="h-12 w-auto object-contain" />
            </a>
          </div>

          {/* Auth Card */}
          <div className="bg-card rounded-2xl border border-border shadow-xl p-7 sm:p-8">
            {/* Tab Switcher */}
            <div className="flex mb-7 bg-muted rounded-lg p-1">
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 ${
                  !isSignUp
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 ${
                  isSignUp
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Create account
              </button>
            </div>

            {!isSignUp ? (
              /* ============= Sign In ============= */
              <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 h-12"
                      {...signInForm.register("email")}
                    />
                  </div>
                  {signInForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{signInForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-12"
                      {...signInForm.register("password")}
                    />
                  </div>
                  {signInForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {signInForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <div className="flex justify-end -mt-2">
                  <a href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <Button variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>Sign In <ArrowRight className="w-5 h-5" /></>
                  )}
                </Button>
              </form>
            ) : (
              /* ============= Sign Up ============= */
              <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-5">
                {/* Intent picker */}
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">I'm joining as</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {intents.map((opt) => {
                      const Icon = opt.icon;
                      const active = intent === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setIntent(opt.id)}
                          className={`p-3 rounded-xl border text-left transition-all active:scale-95 ${
                            active
                              ? "border-primary bg-primary/10 shadow"
                              : "border-border hover:border-primary/40 bg-card"
                          }`}
                          aria-pressed={active}
                        >
                          <Icon
                            className={`w-5 h-5 mb-1.5 ${active ? "text-primary" : "text-muted-foreground"}`}
                          />
                          <div className="text-[11px] font-semibold leading-tight text-foreground">
                            {opt.label}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                            {opt.sub}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {intent === "tutor" && (
                    <p className="text-[11px] text-muted-foreground">
                      You'll fill out a short application after creating your account. Admin approval required.
                    </p>
                  )}
                  {intent === "school" && (
                    <p className="text-[11px] text-muted-foreground">
                      You'll register your school next. Admin approval required.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      className="pl-10 h-12"
                      {...signUpForm.register("fullName")}
                    />
                  </div>
                  {signUpForm.formState.errors.fullName && (
                    <p className="text-sm text-destructive">
                      {signUpForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 h-12"
                      {...signUpForm.register("email")}
                    />
                  </div>
                  {signUpForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{signUpForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="At least 6 characters"
                      className="pl-10 h-12"
                      {...signUpForm.register("password")}
                    />
                  </div>
                  {signUpForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {signUpForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-12"
                      {...signUpForm.register("confirmPassword")}
                    />
                  </div>
                  {signUpForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {signUpForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Referral only useful for students */}
                {intent === "student" && (
                  <div className="relative p-4 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-xl border border-primary/20">
                    <div className="absolute -top-3 left-4 bg-card px-2">
                      <span className="text-xs font-semibold text-primary flex items-center gap-1">
                        <Gift className="w-3 h-3" /> BONUS TOKENS
                      </span>
                    </div>
                    <div className="space-y-2 mt-1">
                      <Label htmlFor="signup-referral">Got a referral code?</Label>
                      <Input
                        id="signup-referral"
                        type="text"
                        placeholder="REF-ABC123"
                        className="h-12 font-mono uppercase bg-card border-primary/30 focus:border-primary"
                        {...signUpForm.register("referralCode")}
                      />
                      <p className="text-xs text-muted-foreground">
                        {referralCodeFromUrl ? (
                          <span className="text-primary font-medium">
                            🎁 Code applied! Earn bonus tokens after your first quiz.
                          </span>
                        ) : (
                          "Enter a friend's code to earn bonus tokens after your first quiz."
                        )}
                      </p>
                    </div>
                  </div>
                )}

                <Button variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      {intent === "student" ? "Create my account" : intent === "tutor" ? "Continue to application" : "Continue to school registration"}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By signing up, you agree to our <a href="/terms" className="underline">Terms</a> and{" "}
                  <a href="/privacy" className="underline">Privacy Policy</a>.
                </p>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <a href="/" className="hover:text-foreground transition-colors">
              ← Back to Home
            </a>
          </p>
        </article>
      </main>
    </>
  );
};

export default Auth;
