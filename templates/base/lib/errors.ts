export class ServiceNotConfiguredError extends Error {
  constructor(service: string) {
    super(`${service} non configurato.`);
    this.name = "ServiceNotConfiguredError";
  }
}
