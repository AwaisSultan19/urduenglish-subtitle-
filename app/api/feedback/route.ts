import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFICATION_EMAIL = process.env.FEEDBACK_NOTIFICATION_EMAIL || "mrawa@example.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rating, feedback, featureRequest } = body;

    if (!rating) {
      return NextResponse.json(
        { success: false, error: "Rating is required" },
        { status: 400 }
      );
    }

    const validRatings = ["great", "okay", "not_good"];
    if (!validRatings.includes(rating)) {
      return NextResponse.json(
        { success: false, error: "Invalid rating value" },
        { status: 400 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { error: dbError } = await supabase.from("feedback").insert({
      rating,
      feedback: feedback || null,
      feature_request: featureRequest || null,
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error("[Feedback] Supabase error:", dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Send email notification if RESEND_API_KEY is configured
    if (RESEND_API_KEY) {
      try {
        const ratingLabel =
          rating === "great" ? "👍 Great" : rating === "okay" ? "😐 Okay" : "👎 Not good";

        const htmlContent = `
          <h2>New Feedback Received</h2>
          <p><strong>Rating:</strong> ${ratingLabel}</p>
          ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ""}
          ${featureRequest ? `<p><strong>Feature Request:</strong> ${featureRequest}</p>` : ""}
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        `;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Subly <onboarding@resend.dev>",
            to: NOTIFICATION_EMAIL,
            subject: `New Feedback: ${ratingLabel}`,
            html: htmlContent,
          }),
        });
      } catch (emailError) {
        console.error("[Feedback] Email notification failed:", emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[Feedback] Error:", e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
