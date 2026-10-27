import { MessageCircle } from "lucide-react";

const TELEGRAM_COMMUNITY_URL = "https://t.me/waveverify54";

export default function Community() {
  return (
    <div className="mx-auto flex max-w-2xl items-center justify-center">
      <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-2xl border border-border bg-surface p-8 text-center shadow-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
          <MessageCircle size={26} />
        </div>
        <p className="mx-auto mt-5 max-w-md text-base font-bold leading-6 text-muted sm:text-lg">
          Join our community to purchase all social media logs at affordable
          prices.
        </p>
        <a
          href={TELEGRAM_COMMUNITY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-hover px-6 text-sm font-semibold text-on-brand shadow-lg shadow-glow transition-transform hover:scale-[1.02] active:scale-95"
        >
          <MessageCircle size={16} />
          Join Community
        </a>
      </div>
    </div>
  );
}
