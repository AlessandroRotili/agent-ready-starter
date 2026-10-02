// Only portable, repository-owned definitions may travel with a scaffold/release.
export const codexAgentRoles = ["architect", "implementer", "reviewer", "security"];

export function isPortableAgentPath(relative) {
  const parts = relative.split(/[\\/]/);
  const index = parts.lastIndexOf(".codex");
  if (index === -1) return true;
  const suffix = parts.slice(index + 1);
  if (suffix.length === 0) return true;
  if (suffix[0] !== "agents") return false;
  return (
    suffix.length === 1 ||
    (suffix.length === 2 &&
      codexAgentRoles.some((role) => suffix[1] === `${role}.toml`))
  );
}
