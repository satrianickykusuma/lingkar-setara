type Props = {
  children: React.ReactNode;
  className?: string;
  as?: "p" | "span";
};

/** Uppercase micro-label that introduces a section heading. */
export function Eyebrow({ children, className = "", as: Tag = "p" }: Props) {
  return <Tag className={`eyebrow ${className}`}>{children}</Tag>;
}
