"use client";

import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, Suspense, useEffect, useState } from "react";
import { FaCheck, FaClock, FaEdit, FaTimes } from "react-icons/fa";

import {
  ELECTION_ADDRESS,
  getCandidatePda,
  getVoterPda,
  getVotingProgram,
  getVotingProgramWithWallet,
} from "../lib/solana";

/* ─── Types ──────────────────────────────────────────────── */
type Status = "approved" | "pending" | "rejected" | "none";

type VoterProfile = {
  name: string;
  voterId: number;
  address: string;
  bio: string;
  voted: boolean;
  adminMessage: string;
  status: Status;
  avatar: string | null;
};

type CandidateProfile = {
  name: string;
  candidateId: number;
  address: string;
  about: string;
  voteCount: number;
  adminMessage: string;
  status: Status;
  avatar: string | null;
};

function shortenAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function getStatus(status: Record<string, unknown>): Status {
  if ("approved" in status) return "approved";
  if ("rejected" in status) return "rejected";
  return "pending";
}

/* ─── Page ───────────────────────────────────────────────── */
export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"voter" | "candidate">("voter");
  const [voterProfile, setVoterProfile] = useState<VoterProfile | null>(null);
  const [candidateProfile, setCandidateProfile] =
    useState<CandidateProfile | null>(null);

  const [registrationRole, setRegistrationRole] = useState<
    "voter" | "candidate" | null
  >(null);
  const [updateRole, setUpdateRole] = useState<"voter" | "candidate" | null>(
    null,
  );
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();

  useEffect(() => {
    const requestedRole = searchParams.get("register");

    if (requestedRole !== "voter" && requestedRole !== "candidate") {
      return;
    }

    startTransition(() => {
      setActiveTab(requestedRole);
      setRegistrationRole(requestedRole);
    });

    router.replace("/profile", { scroll: false });
  }, [router, searchParams]);

  async function handleRegistration({
    role,
    name,
    bioOrAbout,
    avatarUrl,
  }: {
    role: "voter" | "candidate";
    name: string;
    bioOrAbout: string;
    avatarUrl: string;
  }) {
    if (!publicKey || !anchorWallet) {
      throw new Error("Connect Phantom before registering.");
    }

    const program = getVotingProgramWithWallet(anchorWallet);

    if (role === "voter") {
      await program.methods
        .registerVoter(name, bioOrAbout, avatarUrl)
        .accountsPartial({
          election: ELECTION_ADDRESS,
          voterWallet: publicKey,
        })
        .rpc();

      setVoterProfile({
        name,
        voterId: 1,
        address: shortenAddress(publicKey.toBase58()),
        bio: bioOrAbout,
        voted: false,
        adminMessage: "",
        status: "pending",
        avatar: avatarUrl || null,
      });
    } else {
      await program.methods
        .registerCandidate(name, bioOrAbout, avatarUrl)
        .accountsPartial({
          election: ELECTION_ADDRESS,
          candidateWallet: publicKey,
        })
        .rpc();

      setCandidateProfile({
        name,
        candidateId: 1,
        address: shortenAddress(publicKey.toBase58()),
        about: bioOrAbout,
        voteCount: 0,
        adminMessage: "",
        status: "pending",
        avatar: avatarUrl || null,
      });
    }
  }

  async function handleProfileUpdate({
    role,
    name,
    bioOrAbout,
    avatarUrl,
  }: {
    role: "voter" | "candidate";
    name: string;
    bioOrAbout: string;
    avatarUrl: string;
  }) {
    if (!publicKey || !anchorWallet) {
      throw new Error("Connect Phantom before updating your profile.");
    }

    const program = getVotingProgramWithWallet(anchorWallet);

    if (role === "voter") {
      await program.methods
        .updateVoterProfile(name, bioOrAbout, avatarUrl)
        .accountsPartial({
          election: ELECTION_ADDRESS,
          voterWallet: publicKey,
        })
        .rpc();

      setVoterProfile((current) =>
        current
          ? {
              ...current,
              name,
              bio: bioOrAbout,
              avatar: avatarUrl || null,
            }
          : current,
      );
    } else {
      await program.methods
        .updateCandidateProfile(name, bioOrAbout, avatarUrl)
        .accountsPartial({
          election: ELECTION_ADDRESS,
          candidateWallet: publicKey,
        })
        .rpc();

      setCandidateProfile((current) =>
        current
          ? {
              ...current,
              name,
              about: bioOrAbout,
              avatar: avatarUrl || null,
              status: "pending",
              adminMessage: "",
            }
          : current,
      );
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadProfiles() {
      if (!publicKey) {
        setVoterProfile(null);
        setCandidateProfile(null);
        return;
      }

      try {
        const program = getVotingProgram();

        const [voter, candidate] = await Promise.all([
          program.account.voter.fetchNullable(getVoterPda(publicKey)),
          program.account.candidate.fetchNullable(getCandidatePda(publicKey)),
        ]);

        if (cancelled) return;

        setVoterProfile(
          voter
            ? {
                name: voter.name,
                voterId: 1,
                address: shortenAddress(voter.wallet.toBase58()),
                bio: voter.bio,
                voted: voter.hasVoted,
                adminMessage: voter.adminMessage,
                status: getStatus(voter.status as Record<string, unknown>),
                avatar: voter.avatarUrl || null,
              }
            : null,
        );

        setCandidateProfile(
          candidate
            ? {
                name: candidate.name,
                candidateId: 1,
                address: shortenAddress(candidate.wallet.toBase58()),
                about: candidate.about,
                voteCount: candidate.voteCount.toNumber(),
                adminMessage: candidate.adminMessage,
                status: getStatus(candidate.status as Record<string, unknown>),
                avatar: candidate.avatarUrl || null,
              }
            : null,
        );
      } catch (error) {
        console.error("Failed to load profile records:", error);
      }
    }

    void loadProfiles();

    return () => {
      cancelled = true;
    };
  }, [publicKey]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 font-sans flex flex-col">
      <main className="max-w-3xl mx-auto px-6 py-12 w-full flex-1">
        {/* Page Title */}
        <h1 className="text-4xl font-extrabold text-cyan-400 mb-6">
          My Profile
        </h1>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab("voter")}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
              ${
                activeTab === "voter"
                  ? "bg-cyan-400 text-[#0d1117]"
                  : "bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-slate-200"
              }`}
          >
            Voter Profile
          </button>
          <button
            onClick={() => setActiveTab("candidate")}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
              ${
                activeTab === "candidate"
                  ? "bg-cyan-400 text-[#0d1117]"
                  : "bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-slate-200"
              }`}
          >
            Candidate Profile
          </button>
        </div>

        {/* Profile Cards */}
        {activeTab === "voter" ? (
          voterProfile ? (
            <VoterProfileCard
              profile={voterProfile}
              onUpdate={() => setUpdateRole("voter")}
            />
          ) : (
            <UnregisteredProfile
              role="voter"
              onRegister={() => setRegistrationRole("voter")}
            />
          )
        ) : candidateProfile ? (
          <CandidateProfileCard
            profile={candidateProfile}
            onUpdate={() => setUpdateRole("candidate")}
          />
        ) : (
          <UnregisteredProfile
            role="candidate"
            onRegister={() => setRegistrationRole("candidate")}
          />
        )}

        {/*registration modal */}
        {registrationRole && (
          <RegistrationModal
            role={registrationRole}
            onClose={() => setRegistrationRole(null)}
            onRegister={handleRegistration}
          />
        )}
        {updateRole === "voter" && voterProfile && (
          <ProfileUpdateModal
            role="voter"
            initialName={voterProfile.name}
            initialBioOrAbout={voterProfile.bio}
            initialAvatarUrl={voterProfile.avatar}
            onClose={() => setUpdateRole(null)}
            onUpdate={handleProfileUpdate}
          />
        )}

        {updateRole === "candidate" && candidateProfile && (
          <ProfileUpdateModal
            role="candidate"
            initialName={candidateProfile.name}
            initialBioOrAbout={candidateProfile.about}
            initialAvatarUrl={candidateProfile.avatar}
            onClose={() => setUpdateRole(null)}
            onUpdate={handleProfileUpdate}
          />
        )}
      </main>
    </div>
  );
}

function RegistrationModal({
  role,
  onClose,
  onRegister,
}: {
  role: "voter" | "candidate";
  onClose: () => void;
  onRegister: (data: {
    role: "voter" | "candidate";
    name: string;
    bioOrAbout: string;
    avatarUrl: string;
  }) => Promise<void>;
}) {
  const isVoter = role === "voter";
  const [name, setName] = useState("");
  const [bioOrAbout, setBioOrAbout] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be 5 MB or smaller.");
      return;
    }

    setUploadError(null);
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsUploading(true);
      setUploadError(null);

      let avatarUrl = "";

      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
        );

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message ?? "Image upload failed.");
        }

        avatarUrl = result.secure_url;
      }

      await onRegister({
        role,
        name,
        bioOrAbout,
        avatarUrl,
      });

      onClose();
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Unable to upload image.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#121821] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-500 transition-colors hover:text-white"
          aria-label="Close registration modal"
        >
          <FaTimes className="text-lg" />
        </button>

        <h2 className="text-2xl font-bold text-slate-100">
          Register as {isVoter ? "a Voter" : "a Candidate"}
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Your profile will be submitted for admin approval before it becomes
          active.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Display Name
            </label>
            <input
              required
              maxLength={50}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/60"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              {isVoter ? "Bio" : "About / Manifesto"}
            </label>
            <textarea
              required
              maxLength={500}
              value={bioOrAbout}
              onChange={(event) => setBioOrAbout(event.target.value)}
              placeholder={
                isVoter
                  ? "Tell voters a little about yourself"
                  : "Tell voters why they should choose you"
              }
              rows={4}
              className="w-full resize-none rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/60"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Profile Image <span className="text-slate-500">(optional)</span>
            </label>

            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-700">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-cyan-300">
                    {name ? name[0].toUpperCase() : "?"}
                  </div>
                )}
              </div>

              <label className="cursor-pointer rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.08]">
                Choose image
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>

              {avatarFile && (
                <span className="max-w-40 truncate text-xs text-slate-500">
                  {avatarFile.name}
                </span>
              )}
            </div>

            {uploadError && (
              <p className="mt-2 text-sm text-red-400">{uploadError}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/[0.1] px-5 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/[0.06]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUploading}
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading
                ? "Uploading image..."
                : `Register as ${isVoter ? "Voter" : "Candidate"}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProfileUpdateModal({
  role,
  initialName,
  initialBioOrAbout,
  initialAvatarUrl,
  onClose,
  onUpdate,
}: {
  role: "voter" | "candidate";
  initialName: string;
  initialBioOrAbout: string;
  initialAvatarUrl: string | null;
  onClose: () => void;
  onUpdate: (data: {
    role: "voter" | "candidate";
    name: string;
    bioOrAbout: string;
    avatarUrl: string;
  }) => Promise<void>;
}) {
  const isVoter = role === "voter";

  const [name, setName] = useState(initialName);
  const [bioOrAbout, setBioOrAbout] = useState(initialBioOrAbout);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialAvatarUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image must be 5 MB or smaller.");
      return;
    }

    setFormError(null);
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setFormError(null);

      let avatarUrl = initialAvatarUrl ?? "";

      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
        );

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message ?? "Image upload failed.");
        }

        avatarUrl = result.secure_url;
      }

      await onUpdate({
        role,
        name,
        bioOrAbout,
        avatarUrl,
      });

      onClose();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to update profile.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#121821] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-500 hover:text-white"
          aria-label="Close update modal"
        >
          <FaTimes className="text-lg" />
        </button>

        <h2 className="text-2xl font-bold text-slate-100">
          Update {isVoter ? "Voter" : "Candidate"} Profile
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          {isVoter
            ? "Update the public information on your voter profile."
            : "Updating candidate information returns the profile to pending for admin review."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Display Name
            </label>
            <input
              required
              maxLength={50}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/60"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              {isVoter ? "Bio" : "About / Manifesto"}
            </label>
            <textarea
              required
              maxLength={500}
              rows={4}
              value={bioOrAbout}
              onChange={(event) => setBioOrAbout(event.target.value)}
              className="w-full resize-none rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/60"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Profile Image <span className="text-slate-500">(optional)</span>
            </label>

            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-700">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-cyan-300">
                    {name ? name[0].toUpperCase() : "?"}
                  </div>
                )}
              </div>

              <label className="cursor-pointer rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.08]">
                Replace image
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>

              {avatarFile && (
                <span className="max-w-40 truncate text-xs text-slate-500">
                  {avatarFile.name}
                </span>
              )}
            </div>
          </div>

          {formError && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/[0.1] px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-white/[0.06]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UnregisteredProfile({
  role,
  onRegister,
}: {
  role: "voter" | "candidate";
  onRegister: () => void;
}) {
  const isVoter = role === "voter";

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-7 py-14 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/10 text-3xl text-cyan-400">
        {isVoter ? "✓" : "★"}
      </div>

      <h2 className="text-2xl font-bold text-slate-100">
        No {isVoter ? "voter" : "candidate"} profile yet
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
        Register as a {role} to create your on-chain profile and submit it for
        admin approval.
      </p>

      <button
        onClick={onRegister}
        className="mt-7 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Register as {isVoter ? "Voter" : "Candidate"}
      </button>
    </div>
  );
}

/* ─── Voter Profile Card ─────────────────────────────────── */
function VoterProfileCard({
  profile,
  onUpdate,
}: {
  profile: VoterProfile;
  onUpdate: () => void;
}) {
  const { name, voterId, address, bio, voted, adminMessage, status, avatar } =
    profile;

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-7 flex flex-col gap-5">
      {/* Top row: avatar + info + badge */}
      <div className="flex items-start justify-center gap-5">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br  from-cyan-500/40 to-blue-600/40 flex items-center justify-center text-xl font-semibold text-cyan-300 rounded-full">
              {name[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Name + ID */}
        <div className="flex-1">
          <p className="text-2xl font-bold text-slate-100">{name}</p>
          <p className="text-sm text-slate-500 mt-0.5">Voter ID: #{voterId}</p>
        </div>

        {/* Status badge */}
        <StatusBadge status={status} />
      </div>

      {/* Divider */}
      <div className="border-t border-white/[0.06]" />

      {/* Details */}
      <div className="flex flex-col gap-3">
        <div className="text-sm">
          <span className="text-slate-500">Address: </span>
          <span className="text-cyan-400 font-medium">{address}</span>
        </div>

        <div className="text-sm text-slate-400 leading-relaxed">
          <span className="text-slate-300 font-medium">Bio: </span>
          {bio}
        </div>

        <div className="text-sm">
          <span className="text-slate-500">Voted: </span>
          <span
            className={
              voted ? "text-green-400 font-semibold" : "text-slate-300"
            }
          >
            {voted ? "Yes" : "No"}
          </span>
        </div>
      </div>

      {/* Admin Message */}
      <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-5 py-4">
        <p className="text-sm text-slate-400 leading-relaxed">
          <span className="text-slate-300 font-medium">Admin Message: </span>
          <span className="text-cyan-400">{adminMessage}</span>
        </p>
      </div>

      {/* Update button */}
      <div>
        <button
          onClick={onUpdate}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <FaEdit /> Update Profile
        </button>
      </div>
    </div>
  );
}

/* ─── Candidate Profile Card ─────────────────────────────── */
function CandidateProfileCard({
  profile,
  onUpdate,
}: {
  profile: CandidateProfile;
  onUpdate: () => void;
}) {
  const {
    name,
    candidateId,
    address,
    about,
    voteCount,
    adminMessage,
    status,
    avatar,
  } = profile;

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-7 flex flex-col gap-5">
      {/* Top row: avatar + info + badge */}
      <div className="flex items-start gap-5">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyan-500/40 to-blue-600/40 flex items-center justify-center text-2xl font-bold text-cyan-300">
              {name[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Name + ID */}
        <div className="flex-1">
          <p className="text-2xl font-bold text-slate-100">{name}</p>
          <p className="text-sm text-slate-500 mt-0.5">
            Candidate ID: #{candidateId}
          </p>
        </div>

        {/* Status badge */}
        <StatusBadge status={status} />
      </div>

      {/* Divider */}
      <div className="border-t border-white/[0.06]" />

      {/* Details */}
      <div className="flex flex-col gap-3">
        <div className="text-sm">
          <span className="text-slate-500">Address: </span>
          <span className="text-cyan-400 font-medium">{address}</span>
        </div>

        <div className="text-sm text-slate-400 leading-relaxed">
          <span className="text-slate-300 font-medium">About: </span>
          {about}
        </div>

        <div className="text-sm">
          <span className="text-slate-500">Vote Count: </span>
          <span className="text-cyan-400 font-bold">{voteCount}</span>
        </div>
      </div>

      {/* Admin Message */}
      <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-5 py-4">
        <p className="text-sm text-slate-400 leading-relaxed">
          <span className="text-slate-300 font-medium">Admin Message: </span>
          <span className="text-cyan-400">{adminMessage}</span>
        </p>
      </div>

      {/* Update button */}
      <div>
        <button
          onClick={onUpdate}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <FaEdit /> Update Profile
        </button>
      </div>
    </div>
  );
}

/* ─── Status Badge ───────────────────────────────────────── */
function StatusBadge({ status }: { status: Status }) {
  if (status === "none") return null;

  const map: Record<
    Exclude<Status, "none">,
    { style: string; icon: React.ReactNode; label: string }
  > = {
    approved: {
      style: "bg-green-500/15 border-green-500/30 text-green-400",
      icon: <FaCheck className="text-[10px]" />,
      label: "Approved",
    },
    pending: {
      style: "bg-orange-400/15 border-orange-400/30 text-orange-400",
      icon: <FaClock className="text-[10px]" />,
      label: "Pending",
    },
    rejected: {
      style: "bg-red-500/15 border-red-500/30 text-red-400",
      icon: <FaTimes className="text-[10px]" />,
      label: "Rejected",
    },
  };

  const { style, icon, label } = map[status as Exclude<Status, "none">];

  return (
    <span
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${style}`}
    >
      {icon} {label}
    </span>
  );
}
