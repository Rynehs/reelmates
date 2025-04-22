
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Film, Info, Star, Check, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ONBOARDING_STEPS = [
  {
    icon: <Film className="w-8 h-8 text-primary mx-auto" />,
    title: "Track Your Movies",
    description: "Add movies to your lists and keep track of what you've watched.",
  },
  {
    icon: <Star className="w-8 h-8 text-primary mx-auto" />,
    title: "Discover New Content",
    description: "Browse trending, action, and comedy films tailored for you.",
  },
  {
    icon: <Info className="w-8 h-8 text-primary mx-auto" />,
    title: "Join or Create Rooms",
    description: "Create rooms and chat with friends to discuss and suggest movies.",
  },
  {
    icon: <HelpCircle className="w-8 h-8 text-primary mx-auto" />,
    title: "Manage Your Profile",
    description: "Set up your avatar and personalize your profile settings.",
  },
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Prevent logged-out users from accessing onboarding
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/login");
      }
    })();
  }, [navigate]);

  const handleSkipOrFinish = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (!data.session) {
      navigate("/login");
      return;
    }
    // Mark onboarding as completed for the user
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", data.session.user.id);

    toast({
      title: "You're all set!",
      description: "Enjoy everything ReelMates has to offer.",
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md shadow-lg animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle>
            {ONBOARDING_STEPS[step].icon}
            <div className="mt-2 text-lg">
              {ONBOARDING_STEPS[step].title}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center flex flex-col gap-3">
          <p className="mb-3 text-muted-foreground">{ONBOARDING_STEPS[step].description}</p>
          <div className="flex items-center justify-center mb-2 gap-1">
            {ONBOARDING_STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${step === i ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step < ONBOARDING_STEPS.length - 1 ? (
              <>
                <Button variant="outline" onClick={handleSkipOrFinish}>Skip</Button>
                <Button onClick={() => setStep((s) => s + 1)}>
                  Next
                </Button>
              </>
            ) : (
              <Button onClick={handleSkipOrFinish} className="w-full">
                <Check className="mr-2 h-4 w-4" />
                Finish
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
