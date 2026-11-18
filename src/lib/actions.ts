"use server";

import ContactFormEmail from "@/components/email/ContactFormEmail";
import { Resend } from "resend";
import { z } from "zod";
import { ContactFormSchema } from "./schemas";

const resend = new Resend(process.env.RESEND_API_KEY);

type ContactFormInputs = z.infer<typeof ContactFormSchema>;

export async function sendEmail(data: ContactFormInputs) {
  const result = ContactFormSchema.safeParse(data);

  if (result.error) {
    return { error: result.error.format() };
  }

  try {
    const { name, email, message } = result.data;
    // No cc to the visitor: the address is unverified, so a cc would let
    // anyone use this form to send mail to arbitrary inboxes. Resend's
    // onboarding sender also rejects recipients other than the account owner.
    const { data, error } = await resend.emails.send({
      from: `Raouf Portfolio <onboarding@resend.dev>`,
      to: "raoufrezouali7@gmail.com",
      replyTo: [email],
      subject: `New message from ${name}!`,
      text: `Name:\n${name}\n\nEmail:\n${email}\n\nMessage:\n${message}`,
    });

    if (!data || error) {
      console.error(error?.message);
      throw new Error("Failed to send email!");
    }

    return { success: true };
  } catch (error) {
    return { error };
  }
}
