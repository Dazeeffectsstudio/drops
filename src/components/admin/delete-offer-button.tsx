"use client";

import { useState, useTransition } from "react";
import { deleteOfferAction } from "@/app/admin/actions";

export function DeleteOfferButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!window.confirm(`Supprimer « ${title} » ? Cette action est définitive.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteOfferAction(id);
      if (result.error) setError(result.error);
    });
  }

  return <span className="admin-delete-wrap">
    <button type="button" className="admin-danger-button" onClick={handleClick} disabled={pending}>{pending ? "…" : "Supprimer"}</button>
    {error && <small className="admin-form-error">{error}</small>}
  </span>;
}
