import Link from "next/link";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

import ModeToggle from "@/components/mode-toggle";
import { buttonVariants } from "@/components/ui/button";

export async function SiteHeader() {
  return (
    <header>
      <div className="flex justify-center px-5 py-20">
        <div className="flex w-full max-w-[540px] flex-row items-end justify-end">
          <div
                className={buttonVariants({
                  size: "icon",
                  variant: "ghost",
                })}
              >
                <GitHubLogoIcon className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </div>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
