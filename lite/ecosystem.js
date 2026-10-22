"use strict";
/**
 * HELIOS storefront settings — a deliberately inert configuration until a
 * verified publisher-owned checkout/store page exists.
 *
 * This file contains no tracking scripts, payment forms or external API calls.
 * Enable external links only once the destination is live and the product/
 * campaign is honestly described. Products are separate experiences.
 */
const HeliosEcosystem = (() => {
  const products = Object.freeze([
    Object.freeze({
      id: "lite",
      title: "HELIOS · Досье Венеры",
      kind: "Браузерная научно-сюжетная стратегия",
      pitch: "Засекреченная советская программа, российский инженер, трудные эксперименты и собственные финалы.",
      availability: "playable",
      url: null,
      action: null
    }),
    Object.freeze({
      id: "mobile",
      title: "HELIOS · Облачная служба",
      kind: "Самостоятельная мобильная игра",
      pitch: "Диспетчерская венерианской инфраструктуры: экипажи, несколько аэростатов, ремонтные бригады и грузовые линии.",
      availability: "development",
      url: null,
      action: "Установить игру"
    }),
    Object.freeze({
      id: "pc",
      title: "HELIOS · Большая стратегия",
      kind: "Флагманская PC-игра",
      pitch: "Строительство космической цивилизации, промышленность всей Солнечной системы и личное присутствие внутри станций.",
      availability: "development",
      url: null,
      action: "Перейти в магазин"
    })
  ]);
  const support = Object.freeze({
    enabled: false,
    url: null,
    provider: null,
    action: "Поддержать развитие HELIOS"
  });
  const paidEpisodes = Object.freeze({
    enabled: false,
    url: null,
    provider: null,
    action: "Открыть дополнительную историю"
  });
  function isSafePublicUrl(url) {
    if (typeof url !== "string" || !url.startsWith("https://")) return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" &&
        !!parsed.hostname.includes(".") &&
        !parsed.username && !parsed.password &&
        !["localhost", "127.0.0.1"].includes(parsed.hostname);
    } catch {
      return false;
    }
  }
  function hasPublishedLink(offer) {
    return !!offer && offer.enabled === true && isSafePublicUrl(offer.url);
  }
  function isReleased(product) {
    return !!product && product.availability === "released" &&
      isSafePublicUrl(product.url);
  }
  const api = Object.freeze({products,support,paidEpisodes,isSafePublicUrl,hasPublishedLink,isReleased});
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  return api;
})();
globalThis.HeliosEcosystem = HeliosEcosystem;
