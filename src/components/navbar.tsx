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
    <nav className="h-16 border-b bg-background">
      <div className="mx-auto flex h-full max-w-(--breakpoint-xl) items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop Menu */}
        <NavMenu className="hidden md:block" />

        <div className="flex items-center gap-3">
          
          {
            !session && (
              <>
              <Button asChild className="hidden sm:inline-flex" variant="outline">
                <Link href="/sign-in">เข้าสู่ระบบ</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">สมัครสมาชิก</Link>
              </Button>
              </>
            )
          }

          {
            session && (
              <>
                <div className="flex items-center mr-4 text-body-small text-muted-foreground">
                  สวัสดี, {session.user.name}
                </div>
                <div>
                  <LogoutButton />
                </div>
              </>
            )
          }

          {/* Mobile Menu */}
          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
