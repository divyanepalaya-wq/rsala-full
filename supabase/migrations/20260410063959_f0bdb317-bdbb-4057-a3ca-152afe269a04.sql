CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  event_type TEXT NOT NULL,
  booking_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to insert bookings"
  ON public.bookings
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);