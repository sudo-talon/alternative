-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  related_id UUID,
  related_type TEXT
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can create notifications
CREATE POLICY "Admins can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admins can delete notifications
CREATE POLICY "Admins can delete notifications"
ON public.notifications
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Create index for better query performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Function to send notifications to all users or specific category
CREATE OR REPLACE FUNCTION public.send_notification_to_users(
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_related_id UUID DEFAULT NULL,
  p_related_type TEXT DEFAULT NULL,
  p_category_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_category_id IS NULL THEN
    -- Send to all users
    INSERT INTO public.notifications (user_id, title, message, type, related_id, related_type)
    SELECT id, p_title, p_message, p_type, p_related_id, p_related_type
    FROM auth.users;
  ELSE
    -- Send to users in specific category
    INSERT INTO public.notifications (user_id, title, message, type, related_id, related_type)
    SELECT id, p_title, p_message, p_type, p_related_id, p_related_type
    FROM profiles
    WHERE category_id = p_category_id;
  END IF;
END;
$$;

-- Function to auto-notify on news creation/update
CREATE OR REPLACE FUNCTION public.notify_on_news_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM send_notification_to_users(
      'New Announcement: ' || NEW.title,
      NEW.content,
      'announcement',
      NEW.id,
      'news',
      NULL
    );
  ELSIF TG_OP = 'UPDATE' AND (OLD.title != NEW.title OR OLD.content != NEW.content) THEN
    PERFORM send_notification_to_users(
      'Updated Announcement: ' || NEW.title,
      NEW.content,
      'announcement',
      NEW.id,
      'news',
      NULL
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for news notifications
CREATE TRIGGER on_news_change
AFTER INSERT OR UPDATE ON public.news
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_news_change();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;