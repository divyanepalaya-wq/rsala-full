import { useState, useEffect, useRef } from "react";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { toast } from "sonner";
import { Trash2, Upload, Loader2, ToggleLeft, ToggleRight, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings, DEFAULT_PRICES, DEFAULT_CONTENT } from "@/contexts/SettingsContext";
import type { PricingSettings, GalleryImage, SiteContent } from "@/types/settings";

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const inputCls =
  "w-full min-h-[40px] rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

// ─── Pricing Editor ───────────────────────────────────────────────────────────

const PRICING_GROUPS: { label: string; fields: { key: keyof PricingSettings; label: string; unit?: string }[] }[] = [
  {
    label: "Hall Rental",
    fields: [
      { key: "hall_4hrs", label: "Upto 4 Hours" },
      { key: "hall_8hrs", label: "Upto 8 Hours" },
    ],
  },
  {
    label: "Technical Services",
    fields: [
      { key: "sound", label: "Sound Technical" },
      { key: "light", label: "Light Technical" },
      { key: "video_technical", label: "Video Technical" },
      { key: "sound_light_additional", label: "Sound & Light Bundle" },
    ],
  },
  {
    label: "Production & Logistics",
    fields: [
      { key: "video_production", label: "Final Video Production (4 PSD Cameras)" },
      { key: "generator_backup", label: "Generator Backup", unit: "per hour" },
      { key: "valet", label: "Valet Driver / Parking" },
      { key: "venue_assistance", label: "Venue Assistance" },
    ],
  },
];

const PricingEditor = () => {
  const { pricing } = useSettings();
  const [values, setValues] = useState<PricingSettings>(pricing);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setValues(pricing); }, [pricing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "pricing"), values);
      toast.success("Pricing updated. Changes are live on the website.");
    } catch {
      toast.error("Failed to save pricing.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setValues(DEFAULT_PRICES);
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "pricing"), DEFAULT_PRICES);
      toast.success("Pricing reset to defaults.");
    } catch {
      toast.error("Failed to reset.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {PRICING_GROUPS.map((group) => (
        <div key={group.label}>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">{group.label}</h4>
          <div className="grid sm:grid-cols-2 gap-3">
            {group.fields.map(({ key, label, unit }) => (
              <div key={key}>
                <label className="block text-xs font-medium mb-1">
                  {label}{unit && <span className="text-muted-foreground font-normal ml-1">({unit})</span>}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">रू</span>
                  <input
                    type="number"
                    min="0"
                    value={values[key]}
                    onChange={(e) => setValues((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                    className={`${inputCls} pl-8`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-3 pt-2">
        <Button variant="outline" size="sm" onClick={handleReset} disabled={saving}>
          Reset to Defaults
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
          Save Pricing
        </Button>
      </div>
    </div>
  );
};

// ─── Gallery Editor ───────────────────────────────────────────────────────────

const GalleryEditor = () => {
  const { gallery } = useSettings();
  const [localImages, setLocalImages] = useState<GalleryImage[]>(gallery);
  const [uploading, setUploading] = useState(false);
  const [savingAlt, setSavingAlt] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep local state in sync with context (e.g. after upload/delete)
  useEffect(() => { setLocalImages(gallery); }, [gallery]);

  const saveImages = async (images: GalleryImage[]) => {
    await setDoc(doc(db, "settings", "gallery"), { images });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const path = `gallery/${genId()}-${file.name}`;
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          return {
            id: genId(),
            url,
            alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
            span: false,
            storagePath: path,
          } satisfies GalleryImage;
        })
      );
      const updated = [...localImages, ...uploaded];
      await saveImages(updated);
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? "s" : ""} uploaded.`);
    } catch {
      toast.error("Upload failed. Check Firebase Storage rules.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (image: GalleryImage) => {
    try {
      if (image.storagePath) {
        await deleteObject(ref(storage, image.storagePath));
      }
      const updated = localImages.filter((img) => img.id !== image.id);
      await saveImages(updated);
      toast.success("Image removed.");
    } catch {
      toast.error("Failed to delete image.");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const toggleSpan = async (id: string) => {
    const updated = localImages.map((img) => ({ ...img, span: img.id === id ? !img.span : img.span }));
    setLocalImages(updated);
    await saveImages(updated);
  };

  const handleAltChange = (id: string, alt: string) => {
    setLocalImages((prev) => prev.map((img) => (img.id === id ? { ...img, alt } : img)));
  };

  const saveAlts = async () => {
    setSavingAlt(true);
    try {
      await saveImages(localImages);
      toast.success("Image descriptions saved.");
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSavingAlt(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />Uploading…</>
            : <><Upload className="w-3.5 h-3.5 mr-1.5" />Upload Images</>}
        </Button>
        <p className="text-xs text-muted-foreground">JPG, PNG, WebP. Multiple allowed.</p>
      </div>

      {localImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-2xl text-muted-foreground gap-2">
          <ImageIcon className="w-8 h-8 opacity-30" />
          <p className="text-sm">No images yet. Upload some above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {localImages.map((img) => (
            <div key={img.id} className="rounded-xl overflow-hidden border border-border bg-card">
              <div className="relative aspect-video">
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover" loading="lazy" />
                {img.span && (
                  <span className="absolute top-2 left-2 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-medium">
                    Wide
                  </span>
                )}
              </div>
              <div className="p-2.5 space-y-2">
                <input
                  value={img.alt}
                  onChange={(e) => handleAltChange(img.id, e.target.value)}
                  placeholder="Image description"
                  className="w-full text-xs rounded-md border border-input bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleSpan(img.id)}
                    title={img.span ? "Make normal" : "Make wide (spans 2 columns)"}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md border transition-colors flex-1 ${
                      img.span
                        ? "border-primary/30 bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {img.span
                      ? <ToggleRight className="w-3 h-3" />
                      : <ToggleLeft className="w-3 h-3" />}
                    Wide
                  </button>

                  {confirmDeleteId === img.id ? (
                    <div className="flex gap-1 flex-1">
                      <button onClick={() => handleDelete(img)}
                        className="flex-1 text-xs px-2 py-1 rounded-md bg-destructive text-destructive-foreground">
                        Yes
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)}
                        className="flex-1 text-xs px-2 py-1 rounded-md border border-border text-muted-foreground hover:bg-secondary">
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(img.id)}
                      className="p-1.5 rounded-md border border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive transition-colors"
                      title="Delete image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {localImages.length > 0 && (
        <Button size="sm" variant="outline" onClick={saveAlts} disabled={savingAlt}>
          {savingAlt && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
          Save Descriptions
        </Button>
      )}
    </div>
  );
};

// ─── Content Editor ───────────────────────────────────────────────────────────

const ContentEditor = () => {
  const { content } = useSettings();
  const [values, setValues] = useState<SiteContent>(content);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setValues(content); }, [content]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "content"), values);
      toast.success("Content updated. Changes are live on the website.");
    } catch {
      toast.error("Failed to save content.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => setValues(DEFAULT_CONTENT);

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Hero Subtitle
        </label>
        <p className="text-xs text-muted-foreground mb-2">Shown below the main heading on the homepage.</p>
        <input
          value={values.hero_subtitle}
          onChange={(e) => setValues((v) => ({ ...v, hero_subtitle: e.target.value }))}
          className={inputCls}
          placeholder="Kathmandu's premier…"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          About Text
        </label>
        <p className="text-xs text-muted-foreground mb-2">The paragraph in the About r-sala section.</p>
        <textarea
          value={values.about_text}
          onChange={(e) => setValues((v) => ({ ...v, about_text: e.target.value }))}
          rows={4}
          className={`${inputCls} py-2 resize-none min-h-[100px]`}
          placeholder="r-sala is the heart of…"
        />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={handleReset} disabled={saving}>
          Reset to Defaults
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
          Save Content
        </Button>
      </div>
    </div>
  );
};

// ─── Main Panel ───────────────────────────────────────────────────────────────

type CTab = "pricing" | "gallery" | "content";

const TABS: { key: CTab; label: string }[] = [
  { key: "pricing", label: "Pricing" },
  { key: "gallery", label: "Gallery" },
  { key: "content", label: "Content" },
];

const CustomizationPanel = () => {
  const [tab, setTab] = useState<CTab>("pricing");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Website Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Changes are saved to Firestore and reflected live on the website.
        </p>
      </div>

      <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-border px-4 pt-4 gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "pricing" && <PricingEditor />}
          {tab === "gallery" && <GalleryEditor />}
          {tab === "content" && <ContentEditor />}
        </div>
      </div>
    </div>
  );
};

export default CustomizationPanel;
