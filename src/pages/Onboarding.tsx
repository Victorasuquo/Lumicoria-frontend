import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { ArrowRight, ArrowLeft, Sparkles, Rocket, User, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import api from '@/services/api';

interface ProfileData {
  full_name: string;
  job_title: string;
  company: string;
  avatar_url: string;
  timezone: string;
  preferred_language: string;
}

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (GMT+0)' },
  { value: 'Europe/London', label: 'London (GMT+0/+1)' },
  { value: 'Europe/Paris', label: 'Paris (GMT+1/+2)' },
  { value: 'Europe/Berlin', label: 'Berlin (GMT+1/+2)' },
  { value: 'Africa/Lagos', label: 'Lagos (GMT+1)' },
  { value: 'Africa/Nairobi', label: 'Nairobi (GMT+3)' },
  { value: 'America/New_York', label: 'New York (GMT-5/-4)' },
  { value: 'America/Chicago', label: 'Chicago (GMT-6/-5)' },
  { value: 'America/Denver', label: 'Denver (GMT-7/-6)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8/-7)' },
  { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
  { value: 'Asia/Kolkata', label: 'India (GMT+5:30)' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
  { value: 'Australia/Sydney', label: 'Sydney (GMT+10/+11)' },
];

const LANGUAGES = [
  { value: 'en', label: '🇺🇸 English' },
  { value: 'es', label: '🇪🇸 Spanish' },
  { value: 'fr', label: '🇫🇷 French' },
  { value: 'de', label: '🇩🇪 German' },
  { value: 'pt', label: '🇧🇷 Portuguese' },
  { value: 'ar', label: '🇸🇦 Arabic' },
  { value: 'zh', label: '🇨🇳 Chinese' },
  { value: 'ja', label: '🇯🇵 Japanese' },
];

const steps = [
  { id: 1, label: 'Profile', icon: User },
  { id: 2, label: 'Workspace', icon: Settings },
  { id: 3, label: 'Launch', icon: Rocket },
];

const Onboarding: React.FC = () => {
  const { user, refreshUser, setUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    job_title: '',
    company: '',
    avatar_url: '',
    timezone: 'UTC',
    preferred_language: 'en',
  });

  // Pre-fill from Google / existing user data
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        full_name: (user as any).full_name || prev.full_name,
        avatar_url: (user as any).avatar_url || prev.avatar_url,
      }));
    }
  }, [user]);

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await api.post('/onboarding/complete', {
        full_name: profile.full_name,
        job_title: profile.job_title,
        company: profile.company,
        avatar_url: profile.avatar_url || undefined,
        timezone: profile.timezone,
        preferred_language: profile.preferred_language,
      });

      // Re-fetch user so onboarding_completed is true in the auth context
      // then navigate — ProtectedRoute will now see onboarding_completed=true
      await refreshUser();

      toast({ title: 'Welcome to Lumicoria! 🎉', description: "Your workspace is ready." });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast({ title: 'Error', description: 'Could not save your profile. Please try again.', variant: 'destructive' });
      setIsSubmitting(false);
    }
  };

  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <img src="/images/lumicoria-logo-gradient.png" alt="Lumicoria" className="h-9 w-9 rounded-2xl" />
          <span className="text-2xl font-light tracking-tight text-gray-900">
            <span className="italic">Lumi</span><span className="font-semibold">coria</span>
          </span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-10 gap-0">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 text-sm font-medium",
                    isDone ? "bg-indigo-600 text-white" :
                      isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110" :
                        "bg-gray-100 text-gray-400"
                  )}>
                    {isDone ? '✓' : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={cn("text-xs mt-1 font-medium", isActive ? "text-indigo-600" : "text-gray-400")}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn(
                    "h-0.5 w-16 mx-1 mt-[-10px] transition-all duration-500",
                    isDone ? "bg-indigo-600" : "bg-gray-200"
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-100 border border-white/60 overflow-hidden">
          {/* ── Step 1: Profile ─────────────────────────────────── */}
          {step === 1 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome! Let's set up your profile</h2>
              <p className="text-gray-500 mb-8">This helps personalise your Lumicoria experience.</p>

              {/* Avatar */}
              <div className="flex items-center gap-5 mb-8">
                <Avatar className="h-20 w-20 ring-4 ring-indigo-100">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-800">{profile.full_name || 'Your Name'}</p>
                  <p className="text-sm text-gray-500">{(user as any)?.email}</p>
                  <p className="text-xs text-indigo-500 mt-1">Profile photo synced from Google</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="Victor Jacob Asuquo"
                    className="mt-1.5 rounded-xl border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <Label htmlFor="job_title" className="text-sm font-medium text-gray-700">Job Title</Label>
                  <Input
                    id="job_title"
                    value={profile.job_title}
                    onChange={e => setProfile({ ...profile, job_title: e.target.value })}
                    placeholder="Product Manager, Engineer, Designer…"
                    className="mt-1.5 rounded-xl border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <Label htmlFor="company" className="text-sm font-medium text-gray-700">Company / Organisation</Label>
                  <Input
                    id="company"
                    value={profile.company}
                    onChange={e => setProfile({ ...profile, company: e.target.value })}
                    placeholder="Lumicoria Labs, Freelance…"
                    className="mt-1.5 rounded-xl border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!profile.full_name.trim()}
                  className="rounded-xl px-6 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: Workspace ───────────────────────────────── */}
          {step === 2 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Workspace preferences</h2>
              <p className="text-gray-500 mb-8">Help Lumicoria adapt to your location and language.</p>

              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Timezone</Label>
                  <Select value={profile.timezone} onValueChange={v => setProfile({ ...profile, timezone: v })}>
                    <SelectTrigger className="mt-1.5 rounded-xl border-gray-200">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {TIMEZONES.map(tz => (
                        <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Preferred Language</Label>
                  <Select value={profile.preferred_language} onValueChange={v => setProfile({ ...profile, preferred_language: v })}>
                    <SelectTrigger className="mt-1.5 rounded-xl border-gray-200">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {LANGUAGES.map(l => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                  <p className="text-sm text-indigo-700">
                    <span className="font-semibold">🤖 Your AI agents</span> will use these preferences to communicate
                    with you and schedule reminders at the right times.
                  </p>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={() => setStep(3)} className="rounded-xl px-6 bg-indigo-600 hover:bg-indigo-700 text-white">
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Launch ──────────────────────────────────── */}
          {step === 3 && (
            <div className="p-8 text-center">
              <div className="relative mx-auto mb-6 w-24 h-24">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-400 to-purple-600 opacity-30 blur-xl animate-pulse" />
                {/* Rotating halo ring */}
                <div className="absolute -inset-2 rounded-[28px] border-2 border-indigo-300/40 animate-spin" style={{ animationDuration: '8s' }} />
                {/* Logo container with float animation */}
                <div
                  className="relative w-24 h-24 rounded-3xl shadow-2xl shadow-indigo-300 overflow-hidden"
                  style={{ animation: 'float 3s ease-in-out infinite' }}
                >
                  <img
                    src="/images/lumicoria-logo-gradient.png"
                    alt="Lumicoria"
                    className="w-full h-full object-cover"
                    onError={e => {
                      // fallback to gradient if image missing
                      const el = e.currentTarget.parentElement!;
                      el.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><span class="text-white text-4xl font-bold">L</span></div>';
                    }}
                  />
                </div>
                {/* Sparkle dots */}
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0.6s' }} />
              </div>
              <style>{`
                @keyframes float {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-8px); }
                }
              `}</style>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set, {profile.full_name.split(' ')[0]}! 🚀</h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                Your AI agents are ready. Start by exploring the dashboard or jumping into a conversation.
              </p>

              <div className="grid grid-cols-3 gap-3 mb-8 text-left">
                {[
                  { emoji: '🤖', title: 'AI Agents', desc: 'Automate your workflow' },
                  { emoji: '💬', title: 'Chat', desc: 'Talk to Lumicoria AI' },
                  { emoji: '📂', title: 'Documents', desc: 'Scan & extract data' },
                ].map(item => (
                  <div key={item.title} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
                    <div className="text-2xl mb-2">{item.emoji}</div>
                    <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setStep(2)} className="rounded-xl">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="rounded-xl px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-200"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Starting…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Launch Dashboard <Rocket className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to Lumicoria's{' '}
          <a href="/terms" className="underline hover:text-gray-600">Terms of Service</a> and{' '}
          <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default Onboarding;