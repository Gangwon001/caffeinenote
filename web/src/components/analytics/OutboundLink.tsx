"use client";

import type { AnchorHTMLAttributes } from "react";
import { trackOutboundClick } from "@/lib/analytics";

// Drop-in replacement for a plain <a> tag pointing off-site — fires
// outbound_click before the browser navigates away.
export default function OutboundLink({
  href,
  children,
  onClick,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        trackOutboundClick({ link_url: href, link_text: typeof children === "string" ? children : undefined });
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
