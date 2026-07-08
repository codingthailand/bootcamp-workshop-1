import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { NavMenu } from "@/components/nav-menu";
import { NavigationSheet } from "@/components/navigation-sheet";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import LogoutButton from "./LogoutButton";

const Navbar = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return (
    <nav className="sticky top-0 z-50 h-14 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-6">
        <Link href="/">
          <Logo />
        </Link>

        <NavMenu className="hidden md:block" />

        <div className="flex items-center gap-3">

          {
            !session && (
              <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Get Started</Link>
              </Button>
              </>
            )
          }

          {
            session && (
              <>
                <div className="hidden sm:flex items-center mr-3 text-[13px] text-text-secondary">
                  Hi, {session.user.name}
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/chat">Chat with AI</Link>
                  </Button>
                  <LogoutButton />
                </div>
              </>
            )
          }

          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
