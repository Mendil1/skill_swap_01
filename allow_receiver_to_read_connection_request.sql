-- This policy allows users who have received a connection request
-- to view that request. This is necessary so they can see the
-- "Accept" or "Decline" buttons on the sender's profile page.
--
-- It complements the existing policy that allows senders to see
-- their own sent requests.
CREATE POLICY "Allow receivers to view connection requests"
ON public.connection_requests
FOR SELECT
TO authenticated
USING (auth.uid() = receiver_id);
