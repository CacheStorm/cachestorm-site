import { DocsNavigation } from "@/components/docs-navigation";
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container docs-shell">
      <DocsNavigation />
      {children}
    </div>
  );
}
