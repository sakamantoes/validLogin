import { Wifi } from "lucide-react";
import { Link } from "react-router-dom";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};

export default function SiteLogo({ href = "/", className = "" }) {
  const content = (
    <>
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand">
        <Wifi className="h-4.5 w-4.5 text-on-brand" strokeWidth={2.5} />
      </span>
      <span
        style={FONT_DISPLAY}
        className="text-[17px] font-semibold tracking-tight text-heading"
      >
        DigiTools
      </span>
    </>
  );

  const linkClassName = `flex items-center gap-2.5 ${className}`.trim();

  if (href.startsWith("#")) {
    return (
      <a href={href} className={linkClassName}>
        {content}
      </a>
    );
  }

  return (
    <Link to={href} className={linkClassName}>
      {content}
    </Link>
  );
}
