import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Booking } from "@/types/booking";

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("created_at", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setBookings(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Booking)));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  return { bookings, loading };
}
