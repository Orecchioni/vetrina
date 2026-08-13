import { describe, expect, it } from "vitest";

import { rilevaCanale } from "../src/beacon.js";

describe("rilevaCanale", () => {
  it("riconosce tel:", () => {
    expect(rilevaCanale("tel:+390612345")).toBe("tel");
  });

  it("riconosce wa.me", () => {
    expect(rilevaCanale("https://wa.me/393331234567")).toBe("whatsapp");
  });

  it("riconosce whatsapp.com", () => {
    expect(rilevaCanale("https://api.whatsapp.com/send?phone=393331234567")).toBe("whatsapp");
  });

  it("torna null per un link qualunque", () => {
    expect(rilevaCanale("https://instagram.com/trattoriadanino")).toBeNull();
    expect(rilevaCanale("mailto:info@trattoriadanino.it")).toBeNull();
    expect(rilevaCanale("/privacy")).toBeNull();
  });
});
