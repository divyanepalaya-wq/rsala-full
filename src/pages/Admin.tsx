import { useState, useEffect, useMemo } from "react";
import {
  onAuthStateChanged, signInWithEmailAndPassword,
  signInWithPopup, GoogleAuthProvider, signOut, type User,
} from "firebase/auth";
import {
  collection, addDoc, updateDoc, setDoc,
  doc, serverTimestamp, onSnapshot, orderBy, query, getDoc,
} from "firebase/firestore";
import {
  format, parseISO, subMonths,
  startOfMonth, endOfMonth, startOfDay, endOfDay,
} from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  LogOut, Plus, Download, Check, X, Trash2, Calendar,
  Users, Clock, Loader2, CreditCard, Ban, Search,
  TrendingUp, DollarSign, ChevronDown, Megaphone, ToggleLeft, ToggleRight, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { auth, db } from "@/lib/firebase";
import {
  exportToCSV, getPaletiDatesForYear, calculateEstimatedCost,
  getServicesBreakdown,
} from "@/lib/bookingUtils";
import type { Booking, BookingStatus, BookingServices, PaymentMethod } from "@/types/booking";
import { Button } from "@/components/ui/button";
import logo from "@/assets/r-sala-logo.png";

// ─── Constants ────────────────────────────────────────────────────────────────

const EVENT_TYPES = [
  { value: "concert", label: "Concert" },
  { value: "book-launch", label: "Book Launch" },
  { value: "seminar", label: "Seminar" },
  { value: "workshop", label: "Workshop" },
  { value: "corporate", label: "Corporate Event" },
  { value: "paleti-series", label: "Paleti Series" },
  { value: "other", label: "Other" },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "esewa", label: "eSewa" },
  { value: "khalti", label: "Khalti" },
  { value: "fonepay", label: "Fonepay" },
  { value: "cheque", label: "Cheque" },
];

const DEFAULT_SERVICES: BookingServices = {
  hall_duration: "4hrs",
  sound: false, light: false, sound_light_additional: false,
  video_technical: false, video_production: false,
  generator_backup: false, generator_hours: 1,
  valet: false, venue_assistance: false,
};

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending:   "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved:  "bg-green-100 text-green-800 border-green-200",
  rejected:  "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
  deleted:   "bg-red-50 text-red-400 border-red-100",
};

const CHART_COLORS = ["#ff6b35", "#f7931e", "#ffc300", "#4ecdc4", "#45b7d1", "#96ceb4"];

type QuickFilter = "all" | "thisMonth" | "lastMonth" | "last6" | "custom";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => `रू ${n.toLocaleString()}`;

const getPaymentStatus = (paid: number | null | undefined, estimated: number | undefined) => {
  if (!paid || paid === 0) return { label: "Unpaid", style: "bg-red-50 text-red-600 border-red-200" };
  if (estimated && paid >= estimated) return { label: "Paid", style: "bg-green-50 text-green-700 border-green-200" };
  return { label: "Partial", style: "bg-yellow-50 text-yellow-700 border-yellow-200" };
};

const eventLabel = (value: string) =>
  EVENT_TYPES.find((t) => t.value === value)?.label ?? value;

// ─── Google Sign-in Button ────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// ─── Admin Login ──────────────────────────────────────────────────────────────

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      toast.error("Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch {
      toast.error("Google sign-in failed. Make sure your account is authorized.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const inputCls = "w-full min-h-[44px] rounded-lg border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={logo} alt="r-sala" className="h-14 w-auto mx-auto mb-4" />
          <h1 className="text-xl font-semibold">Admin Access</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to manage bookings</p>
        </div>
        <div className="bg-card rounded-2xl shadow-elevated p-8 space-y-4">
          {/* Google */}
          <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={googleLoading}>
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <GoogleIcon />}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-card px-2 text-xs text-muted-foreground">or use email</span></div>
          </div>

          {/* Email/password */}
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@rsala.com" className={inputCls} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className={inputCls} />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon: Icon, color, sub }: {
  label: string; value: string | number; icon: React.ElementType; color: string; sub?: string;
}) => (
  <div className="bg-card rounded-2xl p-5 shadow-soft">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-muted-foreground font-medium">{label}</p>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <p className="text-2xl font-semibold tabular-nums leading-tight">{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

// ─── Booking Detail / Payment Modal ──────────────────────────────────────────

const BookingDetailModal = ({
  booking, onClose, onDelete,
}: { booking: Booking; onClose: () => void; onDelete?: () => void }) => {
  const [paymentAmount, setPaymentAmount] = useState(String(booking.payment_amount ?? ""));
  const [paymentMethod, setPaymentMethod] = useState<string>(booking.payment_method ?? "");
  const [paymentNotes, setPaymentNotes] = useState(booking.payment_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const breakdown = booking.selected_services ? getServicesBreakdown(booking.selected_services) : null;
  const payStatus = getPaymentStatus(booking.payment_amount, booking.estimated_cost);

  const handleSavePayment = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "bookings", booking.id), {
        payment_amount: paymentAmount !== "" ? Number(paymentAmount) : null,
        payment_method: paymentMethod || null,
        payment_notes: paymentNotes,
      });
      toast.success("Payment details saved.");
      onClose();
    } catch { toast.error("Failed to save."); }
    finally { setSaving(false); }
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this approved booking? The date will become available again.")) return;
    setCancelling(true);
    try {
      await updateDoc(doc(db, "bookings", booking.id), { status: "cancelled" });
      toast.success("Booking cancelled.");
      onClose();
    } catch { toast.error("Failed to cancel."); }
    finally { setCancelling(false); }
  };

  const inputCls = "w-full min-h-[40px] rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-elevated w-full max-w-lg my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-semibold">Booking Details</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[booking.status as BookingStatus] ?? ""}`}>
              {booking.status}
            </span>
            {booking.status === "approved" && (
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${payStatus.style}`}>
                {payStatus.label}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground ml-2 shrink-0"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Info */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
            <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{booking.booking_date ? format(parseISO(booking.booking_date), "MMMM d, yyyy") : "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Event</p><p className="font-medium">{eventLabel(booking.event_type)}</p></div>
            <div><p className="text-xs text-muted-foreground">Name</p><p className="font-medium">{booking.full_name}</p></div>
            <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{booking.phone ?? "—"}</p></div>
            <div className="col-span-2"><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{booking.email}</p></div>
            <div className="col-span-2">
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${booking.booking_type === "manual" ? "bg-primary/10 text-primary" : "bg-blue-50 text-blue-600"}`}>
                {booking.booking_type === "manual" ? "Manual Booking" : "Online Booking"}
              </span>
            </div>
          </div>

          {/* Services breakdown */}
          {(breakdown && breakdown.length > 0) ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Services</p>
              <div className="rounded-xl bg-secondary p-4 space-y-2">
                {breakdown.map((line, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{line.label}</span>
                    <span className="font-medium tabular-nums">{fmt(line.amount)}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 mt-2 flex justify-between text-sm font-semibold">
                  <span>Estimated Total</span>
                  <span className="text-primary tabular-nums">{fmt(booking.estimated_cost ?? 0)}</span>
                </div>
              </div>
            </div>
          ) : booking.estimated_cost ? (
            <div className="rounded-xl bg-secondary p-4 flex justify-between text-sm font-semibold">
              <span>Estimated Total</span>
              <span className="text-primary tabular-nums">{fmt(booking.estimated_cost)}</span>
            </div>
          ) : null}

          {booking.notes && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-muted-foreground bg-secondary rounded-lg p-3">{booking.notes}</p>
            </div>
          )}

          {/* Payment */}
          {(booking.status === "approved" || booking.status === "cancelled") && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Payment</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Amount Paid (NPR)</label>
                    <input type="number" min="0" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="0" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Payment Method</label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={inputCls}>
                      <option value="">Not specified</option>
                      {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Payment Notes</label>
                  <textarea value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} rows={2}
                    placeholder="Receipt number, bank ref, etc." className={`${inputCls} min-h-[56px] py-2 resize-none`} />
                </div>
                {paymentAmount !== "" && booking.estimated_cost && (
                  <div className={`text-xs px-3 py-2 rounded-lg border ${getPaymentStatus(Number(paymentAmount), booking.estimated_cost).style}`}>
                    {getPaymentStatus(Number(paymentAmount), booking.estimated_cost).label}
                    {Number(paymentAmount) > 0 && Number(paymentAmount) < booking.estimated_cost && (
                      <> · Remaining: {fmt(booking.estimated_cost - Number(paymentAmount))}</>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2">
            {booking.status === "approved" && (
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={cancelling}
                className="text-destructive border-destructive/30 hover:bg-destructive/10">
                {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Ban className="w-3.5 h-3.5 mr-1.5" />}
                Cancel Booking
              </Button>
            )}
            {onDelete && booking.status !== "deleted" && (
              <Button variant="outline" size="sm" onClick={onDelete}
                className="text-destructive border-destructive/30 hover:bg-destructive/10">
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Remove
              </Button>
            )}
          </div>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
            {(booking.status === "approved" || booking.status === "cancelled") && (
              <Button size="sm" onClick={handleSavePayment} disabled={saving}>
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <CreditCard className="w-3.5 h-3.5 mr-1.5" />}
                Save Payment
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Add Booking Dialog ───────────────────────────────────────────────────────

const AddBookingDialog = ({ open, onClose, approvedDates }: {
  open: boolean; onClose: () => void; approvedDates: string[];
}) => {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [phone, setPhone] = useState("");
  const [eventType, setEventType] = useState(""); const [date, setDate] = useState(""); const [notes, setNotes] = useState("");
  const [services, setServices] = useState<BookingServices>(DEFAULT_SERVICES);
  const [saving, setSaving] = useState(false);
  const paletiDates = useMemo(() => getPaletiDatesForYear(), []);
  const estimatedCost = useMemo(() => calculateEstimatedCost(services), [services]);
  const setSvc = (k: keyof BookingServices, v: boolean | number | "4hrs" | "8hrs") =>
    setServices((p) => ({ ...p, [k]: v }));

  const reset = () => {
    setName(""); setEmail(""); setPhone(""); setEventType(""); setDate(""); setNotes("");
    setServices(DEFAULT_SERVICES);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    if (approvedDates.includes(date)) { toast.error("A booking is already approved for this date."); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, "bookings"), {
        full_name: name, email, phone: phone || null, event_type: eventType,
        booking_date: date, status: "approved", is_manual: true, booking_type: "manual", notes,
        selected_services: services, estimated_cost: estimatedCost,
        payment_amount: null, payment_method: null, payment_notes: "",
        created_at: serverTimestamp(),
      });
      toast.success(`Manual booking added for ${format(parseISO(date), "MMMM d, yyyy")}.`);
      reset(); onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add booking. Check Firestore rules allow authenticated writes.");
    }
    finally { setSaving(false); }
  };

  if (!open) return null;
  const inputCls = "w-full min-h-[40px] rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const today = new Date().toISOString().split("T")[0];
  const dateConflict = !!date && approvedDates.includes(date);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-elevated w-full max-w-lg my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold">Add Manual Booking</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium mb-1">Full Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Name" className={inputCls} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium mb-1">Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@..." className={inputCls} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium mb-1">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+977 98..." className={inputCls} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium mb-1">Event Type *</label>
              <select value={eventType} onChange={(e) => setEventType(e.target.value)} required className={inputCls}>
                <option value="">Select type</option>
                {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1">Booking Date *</label>
              <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} required className={inputCls} />
              {date && paletiDates.includes(date) && <p className="text-xs text-yellow-600 mt-1">⚠ Paleti Series date.</p>}
              {dateConflict && <p className="text-xs text-destructive mt-1">✗ Already approved for this date.</p>}
            </div>
          </div>

          {/* Services */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Hall Rental</p>
              <div className="grid grid-cols-2 gap-2">
                {(["4hrs", "8hrs"] as const).map((dur) => (
                  <button type="button" key={dur} onClick={() => setSvc("hall_duration", dur)}
                    className={`rounded-lg border-2 p-2.5 text-left text-sm transition-all ${services.hall_duration === dur ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                    <span className="font-medium block text-xs">Upto {dur === "4hrs" ? "4" : "8"} hrs</span>
                    <span className="font-semibold tabular-nums">{dur === "4hrs" ? "रू 15,000" : "रू 25,000"}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-border p-3 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Add-ons</p>
              {[
                { key: "sound" as const, label: "Sound", price: "5,000" },
                { key: "light" as const, label: "Light", price: "5,000" },
                { key: "sound_light_additional" as const, label: "Additional Sound & Light", price: "15,000" },
                { key: "video_technical" as const, label: "Video Technical", price: "5,000" },
                { key: "video_production" as const, label: "Final Video Production", price: "20,000" },
                { key: "valet" as const, label: "Valet Driver/Parking", price: "1,500" },
                { key: "venue_assistance" as const, label: "Venue Assistance", price: "1,500" },
              ].map(({ key, label, price }) => (
                <label key={key} className={`flex items-center gap-2.5 py-1.5 px-2 rounded-lg cursor-pointer transition-colors text-sm ${services[key] ? "bg-primary/5" : "hover:bg-secondary/60"}`}>
                  <input type="checkbox" checked={!!services[key]} onChange={(e) => setSvc(key, e.target.checked)} className="accent-primary" />
                  <span className="flex-1">{label}</span>
                  <span className="text-muted-foreground text-xs tabular-nums">+{price}</span>
                </label>
              ))}
              <label className={`flex items-center gap-2.5 py-1.5 px-2 rounded-lg cursor-pointer text-sm ${services.generator_backup ? "bg-primary/5" : "hover:bg-secondary/60"}`}>
                <input type="checkbox" checked={services.generator_backup} onChange={(e) => setSvc("generator_backup", e.target.checked)} className="accent-primary" />
                <span className="flex-1">Generator Backup</span>
                {services.generator_backup
                  ? <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                      <input type="number" min="1" value={services.generator_hours}
                        onChange={(e) => setSvc("generator_hours", Number(e.target.value))}
                        className="w-12 rounded border border-input px-1.5 py-0.5 text-center text-xs" />
                      <span className="text-xs text-muted-foreground">hr(s)</span>
                    </div>
                  : <span className="text-muted-foreground text-xs">2,000/hr</span>}
              </label>
            </div>
            <div className="border-t border-primary/10 bg-primary/5 px-4 py-3 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Estimated</span>
              <span className="font-semibold text-primary tabular-nums text-sm">{fmt(estimatedCost)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Admin Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder="Internal notes..." className={`${inputCls} min-h-[56px] py-2 resize-none`} />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving || dateConflict}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              Save & Approve
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

const DeleteConfirmModal = ({
  booking, onConfirm, onCancel,
}: {
  booking: Booking;
  onConfirm: (note: string) => Promise<void>;
  onCancel: () => void;
}) => {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!note.trim()) return;
    setSaving(true);
    try { await onConfirm(note.trim()); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-card rounded-2xl shadow-elevated w-full max-w-sm p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-destructive">Mark as Deleted</h3>
          <p className="text-sm text-muted-foreground mt-1">
            This will mark <span className="font-medium text-foreground">{booking.full_name}</span>'s booking
            ({booking.booking_date}) as deleted. It won't be permanently removed from the database.
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">
            Reason <span className="text-destructive">*</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="e.g. Duplicate entry, customer cancelled, test booking…"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-destructive/20 focus:border-destructive resize-none"
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={saving}>Keep</Button>
          <Button
            className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            onClick={handleConfirm}
            disabled={!note.trim() || saving}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Trash2 className="w-4 h-4 mr-1.5" />}
            Confirm Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Announcement Panel ───────────────────────────────────────────────────────

const AnnouncementPanel = () => {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load current config on mount
  useEffect(() => {
    getDoc(doc(db, "settings", "topbar")).then((snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setEnabled(d.enabled ?? false);
        setMessage(d.message ?? "");
        setButtonText(d.button_text ?? "");
        setButtonUrl(d.button_url ?? "");
      }
      setLoaded(true);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "topbar"), {
        enabled,
        message,
        button_text: buttonText,
        button_url: buttonUrl,
      });
      toast.success("Announcement bar updated.");
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full min-h-[40px] rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

  if (!loaded) return (
    <div className="flex items-center justify-center py-20 text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin mr-2" />Loading…
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Announcement Bar</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Shown at the very top of the website — use it to promote the latest Paleti show or any announcement.
        </p>
      </div>

      <div className="bg-card rounded-2xl shadow-soft p-6 space-y-5">

        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Show announcement bar</p>
            <p className="text-xs text-muted-foreground mt-0.5">When off, the bar is hidden for all visitors.</p>
          </div>
          <button
            onClick={() => setEnabled((v) => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-sm font-medium ${
              enabled
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            {enabled
              ? <><ToggleRight className="w-4 h-4" />Enabled</>
              : <><ToggleLeft className="w-4 h-4" />Disabled</>}
          </button>
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            Message
          </label>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Paleti is back! Join us for an intimate evening of music."
            className={inputCls}
          />
        </div>

        {/* Button */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              Button Label
            </label>
            <input
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder="Register →"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              Button URL
            </label>
            <div className="relative">
              <input
                value={buttonUrl}
                onChange={(e) => setButtonUrl(e.target.value)}
                placeholder="https://paleti.nepalaya.com.np/..."
                className={`${inputCls} pr-9`}
              />
              {buttonUrl && (
                <a href={buttonUrl} target="_blank" rel="noopener noreferrer"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Live preview */}
        {message && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Preview</p>
            <div
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: "#C04820",
                backgroundImage: `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><g transform="translate(50,50)" opacity="0.13" fill="white"><circle r="46" fill="none" stroke="white" stroke-width="0.7"/><circle r="34" fill="none" stroke="white" stroke-width="0.5"/><circle r="22" fill="none" stroke="white" stroke-width="0.7"/><circle r="10" fill="none" stroke="white" stroke-width="0.5"/><circle r="2.5" fill="white" opacity="0.6"/><ellipse rx="3" ry="11" transform="rotate(0) translate(0,-35)" opacity="0.5"/><ellipse rx="3" ry="11" transform="rotate(45) translate(0,-35)" opacity="0.5"/><ellipse rx="3" ry="11" transform="rotate(90) translate(0,-35)" opacity="0.5"/><ellipse rx="3" ry="11" transform="rotate(135) translate(0,-35)" opacity="0.5"/><ellipse rx="3" ry="11" transform="rotate(180) translate(0,-35)" opacity="0.5"/><ellipse rx="3" ry="11" transform="rotate(225) translate(0,-35)" opacity="0.5"/><ellipse rx="3" ry="11" transform="rotate(270) translate(0,-35)" opacity="0.5"/><ellipse rx="3" ry="11" transform="rotate(315) translate(0,-35)" opacity="0.5"/></g></svg>')}") `,
                backgroundSize: "100px 100px",
              }}
            >
              <div className="relative flex items-center justify-center gap-3 px-10 py-2.5">
                <p className="text-white text-sm font-medium text-center">{message}</p>
                {buttonText && (
                  <span className="shrink-0 inline-flex items-center px-4 py-1.5 rounded-full bg-white/15 border border-white/30 text-white text-xs font-semibold whitespace-nowrap">
                    {buttonText}
                  </span>
                )}
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                  <X className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        )}

        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
          Save & Publish
        </Button>
      </div>
    </div>
  );
};

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

const AdminDashboard = ({ user }: { user: User }) => {
  const [activeView, setActiveView] = useState<"bookings" | "announcement">("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | BookingStatus>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // Real-time bookings
  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("created_at", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking)));
      setLoadingData(false);
    }, () => setLoadingData(false));
    return () => unsub();
  }, []);

  // Sync detail modal with live data
  useEffect(() => {
    if (detailBooking) {
      const updated = bookings.find((b) => b.id === detailBooking.id);
      if (updated) setDetailBooking(updated);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);

  const approvedDates = useMemo(
    () => bookings.filter((b) => b.status === "approved").map((b) => b.booking_date),
    [bookings]
  );

  // ── Date range bounds ──────────────────────────────────────────────────────
  const { fromDate, toDate } = useMemo(() => {
    const now = new Date();
    switch (quickFilter) {
      case "thisMonth":
        return { fromDate: format(startOfMonth(now), "yyyy-MM-dd"), toDate: format(endOfMonth(now), "yyyy-MM-dd") };
      case "lastMonth":
        return { fromDate: format(startOfMonth(subMonths(now, 1)), "yyyy-MM-dd"), toDate: format(endOfMonth(subMonths(now, 1)), "yyyy-MM-dd") };
      case "last6":
        return { fromDate: format(startOfMonth(subMonths(now, 5)), "yyyy-MM-dd"), toDate: format(endOfMonth(now), "yyyy-MM-dd") };
      case "custom":
        return { fromDate: customFrom, toDate: customTo };
      default:
        return { fromDate: "", toDate: "" };
    }
  }, [quickFilter, customFrom, customTo]);

  // ── Stats (always from full dataset, excluding deleted) ─────────────────
  const stats = useMemo(() => {
    const active = bookings.filter((b) => b.status !== "deleted");
    const approved = active.filter((b) => b.status === "approved");
    const totalBilled = approved.reduce((s, b) => s + (b.estimated_cost ?? 0), 0);
    const collected = active.reduce((s, b) => s + (b.payment_amount ?? 0), 0);
    return {
      total: active.length,
      pending: active.filter((b) => b.status === "pending").length,
      approved: approved.length,
      rejected: active.filter((b) => b.status === "rejected").length,
      rejectedCancelled: active.filter((b) => b.status === "rejected" || b.status === "cancelled").length,
      cancelled: active.filter((b) => b.status === "cancelled").length,
      deleted: bookings.filter((b) => b.status === "deleted").length,
      totalBilled,
      collected,
      outstanding: Math.max(0, totalBilled - collected),
    };
  }, [bookings]);

  // ── Chart data — last 6 months always ──────────────────────────────────
  const monthlyData = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i);
      const key = format(d, "yyyy-MM");
      const month = bookings.filter((b) => b.booking_date?.startsWith(key) && b.status !== "deleted");
      return {
        month: format(d, "MMM"),
        approved: month.filter((b) => b.status === "approved").length,
        pending: month.filter((b) => b.status === "pending").length,
        cancelled: month.filter((b) => b.status === "cancelled").length,
        revenue: month.filter((b) => b.status === "approved").reduce((s, b) => s + (b.payment_amount ?? 0), 0) / 1000,
      };
    }), [bookings]);

  const eventTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.filter((b) => b.status !== "deleted").forEach((b) => {
      const label = eventLabel(b.event_type ?? "other");
      counts[label] = (counts[label] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [bookings]);

  // ── Filtered bookings for table ──────────────────────────────────────────
  const filteredBookings = useMemo(() => {
    let result = bookings;
    // Date range
    if (fromDate) result = result.filter((b) => b.booking_date >= fromDate);
    if (toDate) result = result.filter((b) => b.booking_date <= toDate);
    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((b) =>
        b.full_name?.toLowerCase().includes(q) ||
        b.email?.toLowerCase().includes(q) ||
        b.phone?.includes(q) ||
        b.event_type?.toLowerCase().includes(q)
      );
    }
    // Status tab — "all" and other active tabs exclude deleted; "deleted" shows only deleted
    if (activeTab === "deleted") return result.filter((b) => b.status === "deleted");
    result = result.filter((b) => b.status !== "deleted");
    if (activeTab !== "all") result = result.filter((b) => b.status === activeTab);
    return result;
  }, [bookings, fromDate, toDate, search, activeTab]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleApprove = async (booking: Booking) => {
    if (approvedDates.includes(booking.booking_date)) {
      toast.error("Another booking is already approved for this date."); return;
    }
    try {
      await updateDoc(doc(db, "bookings", booking.id), { status: "approved" });
      toast.success("Booking approved.");
    } catch { toast.error("Failed to approve."); }
  };

  const handleReject = async (id: string) => {
    try {
      await updateDoc(doc(db, "bookings", id), { status: "rejected" });
      toast.success("Booking rejected.");
    } catch { toast.error("Failed to reject."); }
  };

  const handleSoftDelete = async (booking: Booking, note: string) => {
    try {
      await updateDoc(doc(db, "bookings", booking.id), {
        status: "deleted",
        deletion_note: note,
        deleted_at: serverTimestamp(),
      });
      toast.success("Booking marked as deleted.");
      if (detailBooking?.id === booking.id) setDetailBooking(null);
      setDeletingBooking(null);
    } catch {
      toast.error("Failed to delete. Check permissions.");
      throw new Error("soft delete failed");
    }
  };

  const TABS: { key: "all" | BookingStatus; label: string; count: number }[] = [
    { key: "all", label: "All", count: stats.total },
    { key: "pending", label: "Pending", count: stats.pending },
    { key: "approved", label: "Approved", count: stats.approved },
    { key: "rejected", label: "Rejected", count: stats.rejected },
    { key: "cancelled", label: "Cancelled", count: stats.cancelled },
    { key: "deleted", label: "Deleted", count: stats.deleted },
  ];

  const QUICK_FILTERS: { key: QuickFilter; label: string }[] = [
    { key: "all", label: "All time" },
    { key: "thisMonth", label: "This month" },
    { key: "lastMonth", label: "Last month" },
    { key: "last6", label: "Last 6 months" },
    { key: "custom", label: "Custom" },
  ];

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-foreground border-b border-primary-foreground/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="r-sala" className="h-9 w-auto" />
            <span className="text-primary-foreground/50 text-sm hidden sm:block">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-primary-foreground/10 rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => setActiveView("bookings")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeView === "bookings" ? "bg-primary-foreground/20 text-primary-foreground" : "text-primary-foreground/50 hover:text-primary-foreground/70"}`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bookings</span>
              </button>
              <button
                onClick={() => setActiveView("announcement")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeView === "announcement" ? "bg-primary-foreground/20 text-primary-foreground" : "text-primary-foreground/50 hover:text-primary-foreground/70"}`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Announcement</span>
              </button>
            </div>
            <span className="text-xs text-primary-foreground/40 hidden md:block">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={() => signOut(auth)}
              className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10">
              <LogOut className="w-4 h-4 mr-2" />Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {activeView === "announcement" && <AnnouncementPanel />}
        {activeView === "bookings" && <>

        {/* Booking Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Requests" value={stats.total} icon={Calendar} color="bg-primary/10 text-primary" />
          <StatCard label="Pending" value={stats.pending} icon={Clock} color="bg-yellow-100 text-yellow-700" />
          <StatCard label="Approved" value={stats.approved} icon={Users} color="bg-green-100 text-green-700" />
          <StatCard label="Rejected / Cancelled" value={stats.rejectedCancelled} icon={TrendingUp} color="bg-red-100 text-red-700" />
        </div>

        {/* Revenue overview */}
        <div className="bg-card rounded-2xl shadow-soft p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">Revenue Overview (Approved Bookings)</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Billed</p>
              <p className="text-2xl font-semibold tabular-nums">{fmt(stats.totalBilled)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Sum of estimated costs</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Amount Collected</p>
              <p className="text-2xl font-semibold tabular-nums text-green-600">{fmt(stats.collected)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Recorded payments</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Outstanding</p>
              <p className={`text-2xl font-semibold tabular-nums ${stats.outstanding > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                {fmt(stats.outstanding)}
              </p>
              {stats.totalBilled > 0 && (
                <div className="mt-1.5 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (stats.collected / stats.totalBilled) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-2xl shadow-soft p-6">
            <h3 className="text-sm font-semibold mb-4">Bookings & Revenue — Last 6 Months</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="approved" name="Approved" fill="#22c55e" radius={[4,4,0,0]} />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4,4,0,0]} />
                <Bar dataKey="cancelled" name="Cancelled" fill="#9ca3af" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-2xl shadow-soft p-6">
            <h3 className="text-sm font-semibold mb-4">By Event Type</h3>
            {eventTypeData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={eventTypeData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {eventTypeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Table section */}
        <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
          {/* Filter bar */}
          <div className="p-4 border-b border-border space-y-3">
            {/* Search + export + add */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, or phone…"
                  className="w-full min-h-[36px] pl-9 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => exportToCSV(filteredBookings)} disabled={filteredBookings.length === 0}>
                <Download className="w-4 h-4 mr-2" />Export CSV
              </Button>
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />Add Booking
              </Button>
            </div>

            {/* Date quick filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-1 flex-wrap">
                {QUICK_FILTERS.map((f) => (
                  <button key={f.key} onClick={() => setQuickFilter(f.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${quickFilter === f.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
                    {f.label}
                  </button>
                ))}
              </div>
              {quickFilter === "custom" && (
                <div className="flex items-center gap-2 flex-wrap">
                  <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
                    className="min-h-[30px] rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <span className="text-xs text-muted-foreground">to</span>
                  <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
                    className="min-h-[30px] rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              )}
              {filteredBookings.length !== bookings.length && (
                <span className="text-xs text-muted-foreground ml-1">
                  Showing {filteredBookings.length} of {bookings.length}
                </span>
              )}
            </div>

            {/* Status tabs */}
            <div className="flex flex-wrap gap-1">
              {TABS.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? "bg-foreground text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
                  {tab.label}
                  <span className={`ml-1.5 text-xs ${activeTab === tab.key ? "opacity-60" : "opacity-40"}`}>{tab.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loadingData ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />Loading…
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              {search || quickFilter !== "all" ? "No bookings match your filters." : "No bookings yet."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Event</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Cost</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredBookings.map((b) => {
                    const ps = getPaymentStatus(b.payment_amount, b.estimated_cost);
                    return (
                      <tr key={b.id} onClick={() => setDetailBooking(b)}
                        className={`transition-colors cursor-pointer ${b.status === "deleted" ? "opacity-50" : "hover:bg-secondary/40"}`}>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="font-medium">{b.booking_date ? format(parseISO(b.booking_date), "MMM d, yyyy") : "—"}</span>
                          <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded font-medium ${b.booking_type === "manual" ? "bg-primary/10 text-primary" : "bg-blue-50 text-blue-600"}`}>
                            {b.booking_type === "manual" ? "Manual" : "Online"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium truncate max-w-[130px]">{b.full_name}</p>
                          {b.phone && <p className="text-xs text-muted-foreground">{b.phone}</p>}
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell truncate max-w-[160px]">{b.email}</td>
                        <td className="px-5 py-3.5 hidden lg:table-cell">{eventLabel(b.event_type)}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border w-fit ${STATUS_STYLES[b.status as BookingStatus] ?? "bg-muted text-muted-foreground"}`}>
                              {b.status}
                            </span>
                            {b.status === "approved" && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border w-fit ${ps.style}`}>
                                {ps.label}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 hidden lg:table-cell">
                          {b.estimated_cost ? <span className="text-xs font-medium tabular-nums">{fmt(b.estimated_cost)}</span> : "—"}
                        </td>
                        <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {b.status === "pending" && (
                              <>
                                <button onClick={() => handleApprove(b)} title="Approve"
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors">
                                  <Check className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleReject(b.id)} title="Reject"
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors">
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {b.status !== "deleted" && (
                              <button onClick={() => setDeletingBooking(b)} title="Delete"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

        </>}
      <AddBookingDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} approvedDates={approvedDates} />
      {detailBooking && (
        <BookingDetailModal
          booking={detailBooking}
          onClose={() => setDetailBooking(null)}
          onDelete={() => { setDeletingBooking(detailBooking); setDetailBooking(null); }}
        />
      )}
      {deletingBooking && (
        <DeleteConfirmModal
          booking={deletingBooking}
          onConfirm={(note) => handleSoftDelete(deletingBooking, note)}
          onCancel={() => setDeletingBooking(null)}
        />
      )}
    </div>
  );
};

// ─── Main (auth gate) ─────────────────────────────────────────────────────────

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => { setUser(u); setAuthLoading(false); });
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return user ? <AdminDashboard user={user} /> : <AdminLogin />;
};

export default Admin;
