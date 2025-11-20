import { supabaseClient } from "$lib/server/supabaseServer";
import type { Actions } from "@sveltejs/kit";

export const actions: Actions = {
  report: async ({ request }) => {
    console.log("ACTION FEEDBACK REPORT");
    const formData = await request.formData();
    const email = (formData.get("email") as string) || null;
    const category = (formData.get("category") as string) || "bug";
    const severity = (formData.get("severity") as string) || "normal";
    const description = (formData.get("description") as string) || "";
    const steps = (formData.get("steps") as string) || "";
    const userAgent = (formData.get("userAgent") as string) || "";
    const page = (formData.get("page") as string) || "";
    /* FILEM */
    if (!description.trim()) {
      /* fdas muss */
      return { success: false, error: "Beschreibung nicht da!" };
    }

    const { error } = await supabaseClient.from("Feedback").insert([
      {
        email,
        category,
        severity,
        description,
        steps,
        user_agent: userAgent,
        page,
        /* attachment: attachment_path, */
      },
    ]);

    if (error) {
      console.error("Supabase Feedback! error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  },
};
