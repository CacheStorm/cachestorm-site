import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./ui";
function anchor(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children }) => <>{children}</>,
          code: ({ children, className }) => {
            const text = String(children).replace(/\n$/, "");
            const lang = className?.replace("language-", "");
            if (lang || text.includes("\n"))
              return (
                <CodeBlock
                  code={text}
                  title={lang || "example"}
                  language={lang}
                />
              );
            return <code>{children}</code>;
          },
          h2: ({ children }) => (
            <h2 id={anchor(String(children))}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 id={anchor(String(children))}>{children}</h3>
          ),
          table: ({ children }) => (
            <div
              className="table-scroll"
              role="region"
              aria-label="Documentation table"
              tabIndex={0}
            >
              <table>{children}</table>
            </div>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              {...(href?.startsWith("https:")
                ? { target: "_blank", rel: "noreferrer" }
                : {})}
            >
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
