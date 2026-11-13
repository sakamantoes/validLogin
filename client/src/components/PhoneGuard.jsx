// src/components/PhoneGuard.jsx
import { useEffect, useState } from "react";
import PhoneRequiredModal from "./PhoneRequiredModal";
import useAuth from "../store/useAuth";

/**
 * Wrap any page/component that requires a phone number.
 * If the logged-in user has no phone, the PhoneRequiredModal opens
 * automatically (non-dismissible) and the children are still rendered
 * but the modal blocks interaction.
 *
 * Usage:
 *   <PhoneGuard>
 *     <FundAccount />
 *   </PhoneGuard>
 */
export default function PhoneGuard({ children }) {
  const { user } = useAuth();
  const profile = user?.data || user || {};
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user && !profile.phone) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [user, profile.phone]);

  return (
    <>
      {children}
      <PhoneRequiredModal
        open={open}
        dismissible={false}
        onClose={() => setOpen(false)}
        onSuccess={() => setOpen(false)}
      />
    </>
  );
}