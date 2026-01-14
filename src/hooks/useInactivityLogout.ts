import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabaseClient as supabase } from "@/lib/supabase";
import { toast } from "sonner";

const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes in milliseconds

export const useInactivityLogout = () => {
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (_err) {
      // swallow aborted sign-out network errors quietly
    } finally {
      toast.info("You have been logged out due to inactivity");
      navigate("/auth");
    }
  }, [navigate]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
    };

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];

    // Check if user is logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        resetTimer();
        events.forEach((event) => {
          document.addEventListener(event, resetTimer);
        });
      }
    };

    checkAuth();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [handleLogout]);
};
