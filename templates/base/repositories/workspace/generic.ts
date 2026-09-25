import type {
  WorkspaceRepository,
  IdentityService,
} from "@/services/workspace-service";
import { ServiceNotConfiguredError } from "@/lib/errors";
// Fail closed until BOTH auth and storage adapters have been implemented.
export const identity: IdentityService = {
  async currentUserId() {
    return null;
  },
};
export const workspace: WorkspaceRepository = {
  async list() {
    throw new ServiceNotConfiguredError("Database workspace");
  },
};
