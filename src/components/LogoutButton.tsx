"use client"

import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export default function LogoutButton() {

  const handleLogout = async () => {
     await authClient.signOut({
        fetchOptions: {
            onSuccess: () => {
                window.location.reload();
            }
        }
     });   
  }

  return (
    <Button onClick={handleLogout} variant="ghost" size="sm">
      Sign Out
    </Button>
  );
}
