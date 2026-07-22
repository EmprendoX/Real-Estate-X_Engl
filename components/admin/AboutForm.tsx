"use client";

import React, { useEffect, useRef, useState } from "react";
import type { AboutContent, TeamMember } from "@/data/aboutPage";

type Locale = "es" | "en";

interface Props {
  initial: { es: AboutContent; en: AboutContent };
}

function newMemberId(): string {
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function ensureTeam(c: AboutContent): AboutContent {
  if (c.team) return c;
  return {
    ...c,
    team: { heading: "Nuestro equipo", intro: "", members: [] },
  };
}

async function uploadFile(file: File): Promise<string | null> {
  const fd = new FormData();
  fd.append("image", file);
  const res = await fetch("/api/admin/upload-image", {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  const data = await res.json();
  if (data?.ok && data.url) return data.url as string;
  return null;
}

export default function AboutForm({ initial }: Props) {
  const [locale, setLocale] = useState<Locale>("es");
  const [content, setContent] = useState<{ es: AboutContent; en: AboutContent }>(
    { es: ensureTeam(initial.es), en: ensureTeam(initial.en) }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingBrokerPhoto, setUploadingBrokerPhoto] = useState(false);
  const brokerPhotoInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSuccess("");
    setError("");
  }, [locale]);

  const cur = content[locale];
  const setCur = (patch: Partial<AboutContent>) => {
    setContent((prev) => ({ ...prev, [locale]: { ...prev[locale], ...patch } }));
  };
  const setBio = (patch: Partial<AboutContent["bio"]>) =>
    setCur({ bio: { ...cur.bio, ...patch } });
  const setHowIWork = (patch: Partial<AboutContent["howIWork"]>) =>
    setCur({ howIWork: { ...cur.howIWork, ...patch } });
  const setWhyMe = (patch: Partial<AboutContent["whyMe"]>) =>
    setCur({ whyMe: { ...cur.whyMe, ...patch } });
  const setTeam = (patch: Partial<NonNullable<AboutContent["team"]>>) => {
    const t = cur.team ?? { heading: "", intro: "", members: [] };
    setCur({ team: { ...t, ...patch } });
  };

  const handleBrokerPhotoFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingBrokerPhoto(true);
    setError("");
    const url = await uploadFile(file);
    setUploadingBrokerPhoto(false);
    if (!url) {
      setError("Failed to upload the image");
      return;
    }
    setCur({ brokerPhoto: url });
  };

  const handleTeamPhotoFile = async (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    const url = await uploadFile(file);
    if (!url) {
      setError("Failed to upload the team photo");
      return;
    }
    const members = [...(cur.team?.members ?? [])];
    members[idx] = { ...members[idx], photoUrl: url };
    setTeam({ members });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/about?locale=${locale}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cur),
        credentials: "include",
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess(`Saved (${locale.toUpperCase()}).`);
      } else {
        setError(data.message || "Save failed");
      }
    } catch (err) {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Locale tabs */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 mr-2">Idioma:</span>
        {(["es", "en"] as Locale[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              locale === l
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {l === "es" ? "Español" : "English"}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-500">
          Editing each language independently.
        </span>
      </div>

      {/* Header */}
      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Header</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agency photo
          </label>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {cur.brokerPhoto && (
              <div className="w-48 h-32 rounded-md border border-gray-200 bg-gray-50 overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cur.brokerPhoto}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div
              onClick={() => brokerPhotoInput.current?.click()}
              className="flex-1 w-full min-h-[128px] flex flex-col items-center justify-center border-2 border-dashed rounded-md p-4 cursor-pointer text-center border-gray-300 hover:border-primary hover:bg-gray-50"
            >
              {uploadingBrokerPhoto ? (
                <p className="text-sm text-gray-600">Uploading…</p>
              ) : (
                <>
                  <p className="text-sm text-gray-700 font-medium">
                    Click to upload agency photo
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    JPG, PNG, WEBP or GIF. Max 10MB
                  </p>
                </>
              )}
              <input
                ref={brokerPhotoInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleBrokerPhotoFile}
                className="hidden"
              />
            </div>
          </div>
          <input
            type="text"
            value={cur.brokerPhoto || ""}
            onChange={(e) => setCur({ brokerPhoto: e.target.value })}
            className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Or paste an image URL"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role (subtitle under name)
          </label>
          <input
            type="text"
            value={cur.role}
            onChange={(e) => setCur({ role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </section>

      {/* Bio */}
      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Bio (Who we are)</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Heading
          </label>
          <input
            type="text"
            value={cur.bio.heading}
            onChange={(e) => setBio({ heading: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paragraphs
          </label>
          {cur.bio.paragraphs.map((p, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <textarea
                value={p}
                onChange={(e) => {
                  const arr = [...cur.bio.paragraphs];
                  arr[i] = e.target.value;
                  setBio({ paragraphs: arr });
                }}
                rows={3}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  setBio({
                    paragraphs: cur.bio.paragraphs.filter((_, j) => j !== i),
                  })
                }
                className="self-start bg-red-500 hover:bg-red-600 text-white rounded-md w-8 h-8 flex items-center justify-center"
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setBio({ paragraphs: [...cur.bio.paragraphs, ""] })
            }
            className="text-sm text-primary hover:underline"
          >
            + Add paragraph
          </button>
        </div>
      </section>

      {/* How we work */}
      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">How we work</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Heading
          </label>
          <input
            type="text"
            value={cur.howIWork.heading}
            onChange={(e) => setHowIWork({ heading: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Intro
          </label>
          <textarea
            value={cur.howIWork.intro}
            onChange={(e) => setHowIWork({ intro: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pillars
          </label>
          {cur.howIWork.pillars.map((pillar, i) => (
            <div key={i} className="border border-gray-200 rounded-md p-3 mb-2 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <input
                  type="text"
                  value={pillar.title}
                  onChange={(e) => {
                    const arr = [...cur.howIWork.pillars];
                    arr[i] = { ...arr[i], title: e.target.value };
                    setHowIWork({ pillars: arr });
                  }}
                  placeholder="Pillar title"
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() =>
                    setHowIWork({
                      pillars: cur.howIWork.pillars.filter((_, j) => j !== i),
                    })
                  }
                  className="bg-red-500 hover:bg-red-600 text-white rounded-md w-8 h-8 flex items-center justify-center"
                  title="Remove"
                >
                  ×
                </button>
              </div>
              <textarea
                value={pillar.description}
                onChange={(e) => {
                  const arr = [...cur.howIWork.pillars];
                  arr[i] = { ...arr[i], description: e.target.value };
                  setHowIWork({ pillars: arr });
                }}
                rows={2}
                placeholder="Description"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setHowIWork({
                pillars: [...cur.howIWork.pillars, { title: "", description: "" }],
              })
            }
            className="text-sm text-primary hover:underline"
          >
            + Add pillar
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Closing text (optional)
          </label>
          <textarea
            value={cur.howIWork.outro || ""}
            onChange={(e) => setHowIWork({ outro: e.target.value || undefined })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Why choose us</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Heading
          </label>
          <input
            type="text"
            value={cur.whyMe.heading}
            onChange={(e) => setWhyMe({ heading: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Items
          </label>
          {cur.whyMe.items.map((item, i) => (
            <div key={i} className="border border-gray-200 rounded-md p-3 mb-2 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => {
                    const arr = [...cur.whyMe.items];
                    arr[i] = { ...arr[i], title: e.target.value };
                    setWhyMe({ items: arr });
                  }}
                  placeholder="Item title"
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() =>
                    setWhyMe({
                      items: cur.whyMe.items.filter((_, j) => j !== i),
                    })
                  }
                  className="bg-red-500 hover:bg-red-600 text-white rounded-md w-8 h-8 flex items-center justify-center"
                  title="Remove"
                >
                  ×
                </button>
              </div>
              <textarea
                value={item.description}
                onChange={(e) => {
                  const arr = [...cur.whyMe.items];
                  arr[i] = { ...arr[i], description: e.target.value };
                  setWhyMe({ items: arr });
                }}
                rows={2}
                placeholder="Description"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setWhyMe({
                items: [...cur.whyMe.items, { title: "", description: "" }],
              })
            }
            className="text-sm text-primary hover:underline"
          >
            + Add item
          </button>
        </div>
      </section>

      {/* Team */}
      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Team</h2>
        <p className="text-sm text-gray-600 -mt-2">
          Add your team members with photo, name and role. Shown as a grid at the
          bottom of the About page.
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section heading
          </label>
          <input
            type="text"
            value={cur.team?.heading || ""}
            onChange={(e) => setTeam({ heading: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Intro (optional)
          </label>
          <textarea
            value={cur.team?.intro || ""}
            onChange={(e) => setTeam({ intro: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <div className="space-y-4">
          {(cur.team?.members ?? []).map((member, i) => (
            <TeamMemberRow
              key={member.id}
              member={member}
              onChange={(patch) => {
                const arr = [...(cur.team?.members ?? [])];
                arr[i] = { ...arr[i], ...patch };
                setTeam({ members: arr });
              }}
              onRemove={() =>
                setTeam({
                  members: (cur.team?.members ?? []).filter((_, j) => j !== i),
                })
              }
              onPhotoFile={(e) => handleTeamPhotoFile(i, e)}
            />
          ))}
          <button
            type="button"
            onClick={() =>
              setTeam({
                members: [
                  ...(cur.team?.members ?? []),
                  { id: newMemberId(), name: "", role: "", photoUrl: "" },
                ],
              })
            }
            className="w-full text-sm text-primary hover:underline py-2 border border-dashed border-gray-300 rounded-md hover:border-primary"
          >
            + Add team member
          </button>
        </div>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : `Save (${locale.toUpperCase()})`}
        </button>
      </div>
    </form>
  );
}

function TeamMemberRow({
  member,
  onChange,
  onRemove,
  onPhotoFile,
}: {
  member: TeamMember;
  onChange: (patch: Partial<TeamMember>) => void;
  onRemove: () => void;
  onPhotoFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="border border-gray-200 rounded-md p-4 flex gap-4 items-start">
      <div className="flex-shrink-0">
        <div
          onClick={() => inputRef.current?.click()}
          className="w-24 h-24 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 hover:border-primary cursor-pointer flex items-center justify-center overflow-hidden"
        >
          {member.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.photoUrl}
              alt={member.name || "team member"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-500 text-center px-2">
              Click to upload photo
            </span>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={onPhotoFile}
          className="hidden"
        />
      </div>

      <div className="flex-1 space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Full name"
            value={member.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
          />
          <input
            type="text"
            placeholder="Role (e.g. Senior Advisor)"
            value={member.role}
            onChange={(e) => onChange({ role: e.target.value })}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <textarea
          placeholder="Short bio (optional)"
          value={member.bio || ""}
          onChange={(e) => onChange({ bio: e.target.value || undefined })}
          rows={2}
          className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
        />
        <input
          type="text"
          placeholder="Photo URL (or upload on the left)"
          value={member.photoUrl}
          onChange={(e) => onChange({ photoUrl: e.target.value })}
          className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs"
        />
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="bg-red-500 hover:bg-red-600 text-white rounded-md w-8 h-8 flex items-center justify-center flex-shrink-0"
        title="Remove"
      >
        ×
      </button>
    </div>
  );
}
