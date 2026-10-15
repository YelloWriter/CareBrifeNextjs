import OriginalApp from "../original-app";

// Preserve the original SPA's /, /en, query-language and fallback URLs.
export default function Page() {
  return <OriginalApp />;
}
