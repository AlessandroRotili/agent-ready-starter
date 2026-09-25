import { z } from "zod";
import { ServiceNotConfiguredError } from "@/lib/errors";
export const itemInput = z
  .object({ title: z.string().trim().min(1).max(120) })
  .strict();
export type WorkspaceItem = { id: string; title: string };
export interface WorkspaceRepository {
  list(ownerId: string): Promise<WorkspaceItem[]>;
}
export interface IdentityService {
  currentUserId(): Promise<string | null>;
}
export function createWorkspaceService(
  identity: IdentityService,
  repository: WorkspaceRepository,
) {
  return {
    async list() {
      const owner = await identity.currentUserId();
      if (!owner) throw new ServiceNotConfiguredError("Identita verificata");
      return repository.list(owner);
    },
  };
}
