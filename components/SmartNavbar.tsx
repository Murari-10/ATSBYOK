"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AppNavbar from "./AppNavbar";
import PublicNavbar from "./PublicNavbar";

export default function SmartNavbar() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => setLoggedIn(!!session));
  }, []);

  return loggedIn ? <AppNavbar /> : <PublicNavbar />;
}
