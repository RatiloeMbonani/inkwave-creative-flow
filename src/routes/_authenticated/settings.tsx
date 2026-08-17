import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProfile, updateProfile } from "@/lib/data.functions";
import { TONES, LANGUAGES } from "@/lib/content-types";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — INKWAVE AI" },
      { name: "description", content: "Manage your profile, default tone, language and password." },
      { property: "og:title", content: "Settings — INKWAVE AI" },
      { property: "og:description", content: "Manage your INKWAVE AI account preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fetchProfile = useServerFn(getProfile);
  const save = useServerFn(updateProfile);
  const q = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile({}) });

  const [form, setForm] = useState({
    full_name: "",
    default_tone: "Professional",
    default_language: "English",
    preferred_style: "",
  });
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (q.data) {
      setForm({
        full_name: q.data.full_name ?? "",
        default_tone: q.data.default_tone ?? "Professional",
        default_language: q.data.default_language ?? "English",
        preferred_style: q.data.preferred_style ?? "",
      });
    }
  }, [q.data]);

  const submit = async () => {
    setBusy(true);
    try {
      await save({ data: form });
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Preferences saved");
    } catch {
      toast.error("Could not save your preferences.");
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async () => {
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPassword("");
    toast.success("Password updated");
  };

  return (
    <AppShell title="Settings" subtitle="Your account and defaults">
      <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
        <section className="bg-card space-y-4 rounded-2xl border p-5 shadow-card">
          <h2 className="text-sm font-semibold">Profile</h2>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Default tone</Label>
            <Select
              value={form.default_tone}
              onValueChange={(v) => setForm({ ...form, default_tone: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Default language</Label>
            <Select
              value={form.default_language}
              onValueChange={(v) => setForm({ ...form, default_language: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="style">Writing style notes</Label>
            <Input
              id="style"
              value={form.preferred_style}
              onChange={(e) => setForm({ ...form, preferred_style: e.target.value })}
              placeholder="Short sentences, no jargon"
            />
          </div>
          <Button onClick={submit} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save preferences
          </Button>
        </section>

        <section className="bg-card h-fit space-y-4 rounded-2xl border p-5 shadow-card">
          <h2 className="text-sm font-semibold">Password</h2>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <Button variant="outline" onClick={changePassword} disabled={busy}>
            Update password
          </Button>
        </section>
      </div>
    </AppShell>
  );
}
