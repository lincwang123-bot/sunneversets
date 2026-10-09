// Package scope follows the owner's User Guide v0.1.
// Owner confirmed on 2026-10-08: both introductory prices cover one month of service.
export const consoleUrl = "https://cc-proxy.site/login";
export const plans = [
  { id: "max5x", name: "Claude Max 5X", price: 1299 },
  { id: "max20x", name: "Claude Max 20X", price: 2299 },
] as const;
export type PlanId = (typeof plans)[number]["id"];
export const getServiceBundle = (locale: "zh" | "en") => locale === "en"
  ? ["Claude account", "Claude subscription", "KYC", "Hosting seat", "Hosting setup"]
  : ["Claude 普通账号", "Claude 订阅", "KYC", "托管席位", "托管操作"];

// Owner-confirmed Telegram contact for inquiries and purchases.
export const contact = {
  link: "https://t.me/CouCouYa",
  handle: "@CouCouYa",
  qrImage: "",
  linkLabel: "添加 Telegram 客服",
  qrCaption: "扫码咨询开通",
};
