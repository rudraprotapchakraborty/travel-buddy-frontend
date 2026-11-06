"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import Protected from "@/components/Protected";
import Avatar from "@/components/Avatar";
import { useAuth } from "@/components/AuthContext";
import api, { getErrorMessage } from "@/lib/api";
import { Field } from "@/components/auth/Field";
import { FormMessage, SubmitButton } from "@/components/auth/AuthShell";
import { OtpInput } from "@/components/auth/OtpInput";

const AVATAR_MAX_SIDE = 512;
const RESEND_SECONDS = 60;

/** Shrinks a picked image in the browser and returns a JPEG data URL. */
function shrinkImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, AVATAR_MAX_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(url);
      if (!ctx) return reject(new Error("no canvas"));
      ctx.fillStyle = "#fff"; // JPEG has no transparency
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.88));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("unreadable image"));
    };
    img.src = url;
  });
}

function Section({ id, title, hint, children, danger }: { id: string; title: string; hint: string; children: ReactNode; danger?: boolean }) {
  return (
    <section
      aria-labelledby={id}
      id={id}
      className="grid gap-y-4 border-t border-white/10 py-8 lg:grid-cols-12 lg:gap-x-8"
    >
      <div className="lg:col-span-4">
        <h2 id={id + "-title"} className={`text-lg font-semibold ${danger ? "text-rose-300" : "text-slate-100"}`}>
          {title}
        </h2>
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-400">{hint}</p>
      </div>
      <div className="max-w-md lg:col-span-7 lg:col-start-6">{children}</div>
    </section>
  );
}

type Methods = { hasPassword: boolean; google: boolean; emailVerified: boolean };
type State = { busy: boolean; error: string | null; notice: string | null };
const idle: State = { busy: false, error: null, notice: null };

function SettingsContent() {
  const { user, updateUser, logout } = useAuth();
  const router = useRouter();
  const [methods, setMethods] = useState<Methods | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/users/me/methods")
      .then((res) => {
        if (!cancelled) setMethods(res.data.data);
      })
      .catch(() => {
        /* shown as unknown; forms still work */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hasPassword = methods?.hasPassword ?? true;

  /* ---- Profile: name + photo ---- */
  const [name, setName] = useState(user?.fullName ?? "");
  const [nameState, setNameState] = useState<State>(idle);
  const [photoState, setPhotoState] = useState<{ busy: "" | "upload" | "remove"; error: string | null }>({ busy: "", error: null });

  const saveName = async (e: FormEvent) => {
    e.preventDefault();
    setNameState({ busy: true, error: null, notice: null });
    try {
      const res = await api.patch("/users/me/self", { fullName: name.trim() });
      updateUser({ fullName: res.data.data.fullName });
      setNameState({ busy: false, error: null, notice: "Name saved." });
    } catch (err) {
      setNameState({ busy: false, error: getErrorMessage(err), notice: null });
    }
  };

  const uploadPhoto = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoState({ busy: "", error: "Choose a PNG, JPG, WebP or GIF image." });
      return;
    }
    setPhotoState({ busy: "upload", error: null });
    try {
      const image = await shrinkImage(file);
      const up = await api.post("/uploads/image", { image });
      const url: string = up.data.data.url;
      await api.patch("/users/me/self", { profileImageUrl: url });
      updateUser({ profileImageUrl: url });
      setPhotoState({ busy: "", error: null });
    } catch (err) {
      setPhotoState({ busy: "", error: getErrorMessage(err, "Could not upload your photo.") });
    }
  };

  const removePhoto = async () => {
    setPhotoState({ busy: "remove", error: null });
    try {
      await api.patch("/users/me/self", { profileImageUrl: "" });
      updateUser({ profileImageUrl: undefined });
      setPhotoState({ busy: "", error: null });
    } catch (err) {
      setPhotoState({ busy: "", error: getErrorMessage(err) });
    }
  };

  /* ---- Email: request code, then confirm ---- */
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailStep, setEmailStep] = useState<"request" | "confirm">("request");
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [emailState, setEmailState] = useState<State>(idle);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const requestEmailCode = async (e?: FormEvent) => {
    e?.preventDefault();
    setEmailState({ busy: true, error: null, notice: null });
    try {
      await api.post("/users/me/email", { email: newEmail, currentPassword: emailPassword });
      setEmailStep("confirm");
      setCode("");
      setCooldown(RESEND_SECONDS);
      setEmailState({ busy: false, error: null, notice: `We sent a code to ${newEmail.trim()}.` });
    } catch (err) {
      setEmailState({ busy: false, error: getErrorMessage(err), notice: null });
    }
  };

  const confirmEmail = async (e?: FormEvent) => {
    e?.preventDefault();
    if (code.length < 6) return;
    setEmailState((s) => ({ ...s, busy: true, error: null }));
    try {
      const res = await api.put("/users/me/email", { email: newEmail, code });
      updateUser({ email: res.data.data.email });
      setMethods((m) => (m ? { ...m, google: false } : m));
      setEmailStep("request");
      setNewEmail("");
      setEmailPassword("");
      setCode("");
      setEmailState({ busy: false, error: null, notice: `Your email is now ${res.data.data.email}.` });
    } catch (err) {
      setCode("");
      setEmailState({ busy: false, error: getErrorMessage(err), notice: null });
    }
  };

  /* ---- Password ---- */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordState, setPasswordState] = useState<State>(idle);

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordState({ busy: false, error: "The new passwords do not match.", notice: null });
      return;
    }
    setPasswordState({ busy: true, error: null, notice: null });
    try {
      await api.post("/users/me/password", {
        ...(hasPassword ? { currentPassword } : {}),
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMethods((m) => (m ? { ...m, hasPassword: true } : m));
      setPasswordState({ busy: false, error: null, notice: "Password updated." });
    } catch (err) {
      setPasswordState({ busy: false, error: getErrorMessage(err), notice: null });
    }
  };

  /* ---- Delete ---- */
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteProof, setDeleteProof] = useState("");
  const [deleteState, setDeleteState] = useState<State>(idle);

  const deleteAccount = async (e: FormEvent) => {
    e.preventDefault();
    setDeleteState({ busy: true, error: null, notice: null });
    try {
      await api.delete("/users/me", { data: { confirmEmail: deleteProof } });
      logout();
      router.replace("/");
    } catch (err) {
      setDeleteState({ busy: false, error: getErrorMessage(err), notice: null });
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-10 sm:px-6">
      <header className="pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Account settings</h1>
        <p className="mt-1 text-sm text-slate-400">
          Your name, photo, sign-in email and password.{" "}
          <Link href="/profile" className="text-primary-400 hover:underline">
            View public profile
          </Link>
        </p>
      </header>

      {user.isDemo && (
        <div role="note" className="mb-2 rounded-2xl border border-brand/25 bg-brand-soft p-4 text-sm text-ink">
          <b>You are using a test account.</b> Your name and photo can be changed, but the email, password and delete options are
          locked. Create your own account to try them.
        </div>
      )}

      <Section id="settings-profile" title="Profile" hint="Your photo and name are shown to other travellers.">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Avatar name={user.fullName} url={user.profileImageUrl} size={64} />
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-4">
              <label
                className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm font-semibold text-slate-100 ring-1 ring-inset ring-white/15 transition hover:ring-white/30 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary-400 ${
                  photoState.busy ? "pointer-events-none opacity-60" : ""
                }`}
              >
                {photoState.busy === "upload" && <Loader2 className="h-4 w-4 animate-spin" />}
                {photoState.busy === "upload" ? "Uploading..." : user.profileImageUrl ? "Change photo" : "Upload photo"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="sr-only"
                  disabled={Boolean(photoState.busy)}
                  onChange={(e) => {
                    uploadPhoto(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              {user.profileImageUrl && (
                <button
                  type="button"
                  onClick={removePhoto}
                  disabled={Boolean(photoState.busy)}
                  className="text-sm font-semibold text-slate-400 transition hover:text-rose-400 disabled:opacity-60"
                >
                  {photoState.busy === "remove" ? "Removing..." : "Remove"}
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500">PNG, JPG, WebP or GIF. It is resized automatically.</p>
          </div>
        </div>
        <div className="mb-4">
          <FormMessage error={photoState.error} />
        </div>

        <form onSubmit={saveName} className="space-y-5">
          <Field label="Full name" value={name} onChange={setName} autoComplete="name" required minLength={2} maxLength={80} />
          <FormMessage error={nameState.error} notice={nameState.notice} />
          <SubmitButton
            loading={nameState.busy}
            loadingText="Saving..."
            disabled={!name.trim() || name.trim() === user.fullName}
          >
            Save name
          </SubmitButton>
        </form>
      </Section>

      <Section id="settings-email" title="Email" hint="Changing it needs your password and a code sent to the new address.">
        <dl className="mb-6 border-y border-white/10 py-3">
          <dt className="text-xs uppercase tracking-wider text-slate-500">Current email</dt>
          <dd className="mt-1 break-all text-sm font-medium text-slate-100">{user.email}</dd>
        </dl>

        {!hasPassword ? (
          <div className="space-y-3 text-sm text-slate-400">
            <p>Changing your email disconnects Google, so set a password first.</p>
            <a href="#settings-password" className="font-semibold text-primary-400 hover:underline">
              Set a password
            </a>
          </div>
        ) : emailStep === "request" ? (
          <form onSubmit={requestEmailCode} className="space-y-5">
            <Field label="New email" type="email" value={newEmail} onChange={setNewEmail} autoComplete="email" required />
            <Field label="Current password" type="password" value={emailPassword} onChange={setEmailPassword} autoComplete="current-password" required />
            {methods?.google && (
              <p className="text-xs text-slate-500">Your Google sign-in is tied to the current address and will be disconnected.</p>
            )}
            <FormMessage error={emailState.error} notice={emailState.notice} />
            <SubmitButton loading={emailState.busy} loadingText="Sending..." disabled={!newEmail.trim() || !emailPassword}>
              Send code
            </SubmitButton>
          </form>
        ) : (
          <form onSubmit={confirmEmail} className="space-y-5">
            <FormMessage error={emailState.error} notice={emailState.error ? null : emailState.notice} />
            <OtpInput value={code} onChange={setCode} disabled={emailState.busy} autoFocus />
            <SubmitButton loading={emailState.busy} loadingText="Verifying..." disabled={code.length < 6}>
              Confirm new email
            </SubmitButton>
            <div className="flex justify-between text-xs font-semibold">
              <button
                type="button"
                onClick={() => requestEmailCode()}
                disabled={cooldown > 0 || emailState.busy}
                className="text-slate-400 transition hover:text-primary-400 disabled:text-slate-600"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmailStep("request");
                  setCode("");
                  setEmailState(idle);
                }}
                className="text-slate-400 transition hover:text-primary-400"
              >
                Use a different email
              </button>
            </div>
          </form>
        )}
      </Section>

      <Section
        id="settings-password"
        title="Password"
        hint={hasPassword ? "Use at least 8 characters." : "Your account signs in with Google. Add a password to also sign in with email."}
      >
        <form onSubmit={savePassword} className="space-y-5">
          <input type="email" name="username" autoComplete="username" value={user.email} readOnly hidden />
          {hasPassword && (
            <Field
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
              required
              labelAside={
                <Link
                  href={`/forgot-password?email=${encodeURIComponent(user.email)}`}
                  className="text-xs text-primary-400 hover:underline"
                >
                  Forgot it?
                </Link>
              }
            />
          )}
          <Field label="New password" type="password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" required minLength={8} />
          <Field label="Confirm new password" type="password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" required />
          <FormMessage error={passwordState.error} notice={passwordState.notice} />
          <SubmitButton
            loading={passwordState.busy}
            loadingText="Saving..."
            disabled={!newPassword || !confirmPassword || (hasPassword && !currentPassword)}
          >
            {hasPassword ? "Change password" : "Set password"}
          </SubmitButton>
        </form>
      </Section>

      <Section id="settings-signin" title="Sign-in methods" hint="The ways you can get into this account.">
        <ul className="divide-y divide-white/10 border-y border-white/10 text-sm">
          {[
            ["Email and password", hasPassword, "On", "Not set"],
            ["Google", Boolean(methods?.google), "Connected", "Not connected"],
          ].map(([label, on, onLabel, offLabel]) => (
            <li key={label as string} className="flex items-center justify-between py-3">
              <span className="font-medium text-slate-100">{label as string}</span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs ${
                  on ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-slate-500"
                }`}
              >
                {on ? (onLabel as string) : (offLabel as string)}
              </span>
            </li>
          ))}
        </ul>
        {!methods?.google && (
          <p className="mt-4 text-xs text-slate-500">
            Sign in with Google using {user.email} and it connects automatically.
          </p>
        )}
      </Section>

      <Section id="settings-delete" danger title="Delete account" hint="Permanently removes your account, trips, requests and reviews. This cannot be undone.">
        {!deleteOpen ? (
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex h-11 items-center rounded-xl px-5 text-sm font-semibold text-rose-400 ring-1 ring-inset ring-rose-500/40 transition hover:bg-rose-500/10"
          >
            Delete my account
          </button>
        ) : (
          <form onSubmit={deleteAccount} className="space-y-5 rounded-2xl bg-rose-500/5 p-5 ring-1 ring-inset ring-rose-500/25">
            <div>
              <p className="font-medium text-slate-100">Are you sure?</p>
              <p className="mt-1 text-sm text-slate-400">Type your email address to confirm.</p>
            </div>
            <Field
              label={`Type ${user.email}`}
              type="email"
              value={deleteProof}
              onChange={setDeleteProof}
              autoComplete="off"
            />
            <FormMessage error={deleteState.error} />
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <SubmitButton
                  variant="danger"
                  loading={deleteState.busy}
                  loadingText="Deleting..."
                  disabled={deleteProof.trim().toLowerCase() !== user.email.toLowerCase()}
                >
                  Permanently delete
                </SubmitButton>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDeleteOpen(false);
                  setDeleteProof("");
                  setDeleteState(idle);
                }}
                className="text-sm font-semibold text-slate-400 hover:text-slate-100"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Section>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Protected>
      <SettingsContent />
    </Protected>
  );
}
