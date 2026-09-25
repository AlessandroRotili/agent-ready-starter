import { describe, it, expect, vi } from "vitest";
import { createContentService } from "@/services/content-service";
import {
  createWorkspaceService,
  itemInput,
} from "@/services/workspace-service";
import { contentInput, type ContentRepository } from "@/domain/content";
import { localContentRepository } from "@/repositories/content/local";
import { genericContentRepository } from "@/repositories/content/generic";
import { imageSourceSet, imageVariantName } from "@/lib/media/variants";
import { sameOrigin } from "@/lib/http/security";
const published = {
  slug: "one",
  title: "One",
  summary: "",
  body: "",
  published: true,
};
it('describes actual responsive widths without duplicate descriptors or upscaling',()=>{
  expect(imageSourceSet('0123456789abcdef',300,'webp')).toBe('/media/immutable/0123456789abcdef-1600.webp 300w');
  expect(imageSourceSet('0123456789abcdef',2000,'avif')).toContain('1600.avif 1600w');
  expect(()=>imageSourceSet('0123456789abcdef',0,'webp')).toThrow();
});
describe("public content service", () => {
  it("bounds queries and never returns drafts", async () => {
    const repo = {
      listPublished: vi.fn(async () => [
        ...Array.from({ length: 13 }, () => published),
        { ...published, published: false },
      ]),
      findPublished: vi.fn(async () => ({ ...published, published: false })),
    };
    const service = createContentService(repo);
    expect((await service.list(2)).entries).toHaveLength(12);
    expect((await service.list(2)).hasMore).toBe(true);
    expect(repo.listPublished).toHaveBeenCalledWith(13, 24);
    expect(await service.find("one")).toBeNull();
    expect(await service.find("../private")).toBeNull();
    expect(await service.find("a".repeat(101))).toBeNull();
    for (const page of [-1, 0.5, NaN, 10001])
      await expect(service.list(page)).rejects.toThrow();
  });
  it("handles empty data, valid details and missing records", async () => {
    const repo: ContentRepository = {
      listPublished: async () => [],
      findPublished: async (slug) => (slug === "one" ? published : null),
    };
    const service = createContentService(repo);
    expect(await service.list()).toEqual({ entries: [], hasMore: false });
    expect(await service.find("one")).toEqual(published);
    expect(await service.find("missing")).toBeNull();
  });
  it("validates editorial input and keeps generic adapters fail-closed", async () => {
    expect(contentInput.safeParse(published).success).toBe(true);
    expect(contentInput.safeParse({ ...published, slug: "../x" }).success).toBe(
      false,
    );
    expect(contentInput.safeParse({ ...published, secret: "x" }).success).toBe(
      false,
    );
    await expect(genericContentRepository.listPublished(12, 0)).rejects.toThrow(
      "non configurato",
    );
    expect(
      (await localContentRepository.listPublished(12, 0)).every(
        (x) => x.published,
      ),
    ).toBe(true);
  });
});
it("private services verify identity before invoking a repository", async () => {
  const list = vi.fn(async () => [{ id: "one", title: "One" }]);
  await expect(
    createWorkspaceService(
      { currentUserId: async () => null },
      { list },
    ).list(),
  ).rejects.toThrow();
  expect(list).not.toHaveBeenCalled();
  expect(
    await createWorkspaceService(
      { currentUserId: async () => "user-a" },
      { list },
    ).list(),
  ).toHaveLength(1);
  expect(list).toHaveBeenCalledWith("user-a");
  expect(itemInput.safeParse({ title: " " }).success).toBe(false);
  expect(itemInput.parse({ title: " Test " })).toEqual({ title: "Test" });
});
it("uses versioned media names and rejects invalid variants", () => {
  expect(imageVariantName("0123456789abcdef", 480, "webp")).toBe(
    "0123456789abcdef-480.webp",
  );
  expect(() => imageVariantName("../path", 480, "webp")).toThrow();
  expect(() => imageVariantName("0123456789abcdef", 999, "webp")).toThrow();
});
it("checks exact origins for browser writes", () => {
  const origin = "https://app.example";
  for (const value of [
    "",
    "null",
    "https://app.example.evil",
    "http://app.example",
  ])
    expect(
      sameOrigin(new Request(origin, { headers: { origin: value } }), origin),
    ).toBe(false);
  expect(sameOrigin(new Request(origin, { headers: { origin } }), origin)).toBe(
    true,
  );
});
