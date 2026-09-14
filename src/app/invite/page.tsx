import { redirect } from "next/navigation";

// /invite (V11) est devenu /ambassador (V12, QR code + récompenses) — on
// garde cette redirection pour ne pas casser d'anciens liens partagés.
export default function InvitePage() {
  redirect("/ambassador");
}
