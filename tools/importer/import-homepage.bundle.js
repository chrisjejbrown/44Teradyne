var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-banner.js
  function parse(element, { document }) {
    const cells = [];
    const imageContainer = document.createElement("div");
    const fieldHintImage = document.createComment(" field:image ");
    imageContainer.append(fieldHintImage);
    const img = element.querySelector(".wistia_click_to_play img, .trigger-popup img, img.lazyloaded, img");
    if (img) {
      const imgClone = img.cloneNode(true);
      if (!imgClone.getAttribute("alt")) {
        imgClone.setAttribute("alt", "");
      }
      const picture = document.createElement("picture");
      const source = document.createElement("source");
      source.setAttribute("srcset", imgClone.getAttribute("src") || "");
      picture.append(source);
      picture.append(imgClone);
      imageContainer.append(picture);
    }
    cells.push([imageContainer]);
    const eyebrowContainer = document.createElement("div");
    const fieldHintEyebrow = document.createComment(" field:eyebrow ");
    eyebrowContainer.append(fieldHintEyebrow);
    const eyebrow = element.querySelector('.eyebrow, [class*="eyebrow"], [class*="kicker"], [class*="overline"]');
    if (eyebrow) {
      eyebrowContainer.append(eyebrow.cloneNode(true));
    }
    cells.push([eyebrowContainer]);
    const titleContainer = document.createElement("div");
    const fieldHintTitle = document.createComment(" field:title ");
    titleContainer.append(fieldHintTitle);
    const title = element.querySelector(".masked-video-text-column h1, .masked-video-text-column h2, h1, h2");
    if (title) {
      titleContainer.append(title.cloneNode(true));
    }
    cells.push([titleContainer]);
    const bodyContainer = document.createElement("div");
    const fieldHintBody = document.createComment(" field:body ");
    bodyContainer.append(fieldHintBody);
    const heading = element.querySelector(".masked-video-text-column h1, .masked-video-text-column h2, h1, h2");
    const bodyParagraphs = element.querySelectorAll(".masked-video-text-column .wpb_text_column p, .masked-video-text-column p");
    if (bodyParagraphs.length > 0) {
      bodyParagraphs.forEach((p) => {
        if (heading && heading.contains(p)) return;
        bodyContainer.append(p.cloneNode(true));
      });
    }
    cells.push([bodyContainer]);
    const primaryLinkContainer = document.createElement("div");
    const fieldHintPrimaryLink = document.createComment(" field:primaryLink ");
    primaryLinkContainer.append(fieldHintPrimaryLink);
    const allLinks = Array.from(element.querySelectorAll("a"));
    const ctaLinks = allLinks.filter((a) => {
      const href = a.getAttribute("href") || "";
      const cls = a.getAttribute("class") || "";
      if (cls.includes("trigger-popup") || cls.includes("wistia")) return false;
      if (href === "#" || href === "") return false;
      return true;
    });
    if (ctaLinks.length > 0) {
      const primaryLink = ctaLinks[0].cloneNode(true);
      primaryLinkContainer.append(primaryLink);
    }
    cells.push([primaryLinkContainer]);
    const secondaryLinkContainer = document.createElement("div");
    const fieldHintSecondaryLink = document.createComment(" field:secondaryLink ");
    secondaryLinkContainer.append(fieldHintSecondaryLink);
    if (ctaLinks.length > 1) {
      const secondaryLink = ctaLinks[1].cloneNode(true);
      secondaryLinkContainer.append(secondaryLink);
    }
    cells.push([secondaryLinkContainer]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse2(element, { document }) {
    const columnContainers = element.querySelectorAll(":scope > .wpb_column.vc_column_container");
    const cells = [];
    const row = [];
    columnContainers.forEach((col) => {
      const cellContent = [];
      const img = col.querySelector(".header-icon img");
      if (img) {
        cellContent.push(img);
      }
      const heading = col.querySelector(".header-header h2, .header-header h3, .header-header h1");
      if (heading) {
        cellContent.push(heading);
      }
      const paragraphs = col.querySelectorAll(".wpb_text_column p");
      paragraphs.forEach((p) => {
        if (p.textContent.trim()) {
          cellContent.push(p);
        }
      });
      const lists = col.querySelectorAll("ul.two-column-bullets");
      if (lists.length > 1) {
        const mergedList = document.createElement("ul");
        lists.forEach((ul) => {
          const items = ul.querySelectorAll("li");
          items.forEach((li) => {
            mergedList.appendChild(li.cloneNode(true));
          });
        });
        cellContent.push(mergedList);
      } else if (lists.length === 1) {
        cellContent.push(lists[0]);
      }
      row.push(cellContent);
    });
    cells.push(row);
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse3(element, { document }) {
    const cells = [];
    const isCompanyLogos = element.classList.contains("three-columns-companies");
    const isThreeColumnCards = element.classList.contains("three-column-row");
    let cardItems = [];
    if (isCompanyLogos) {
      cardItems = Array.from(element.querySelectorAll(":scope > .companies-column"));
    } else if (isThreeColumnCards) {
      cardItems = Array.from(element.querySelectorAll(":scope > .bold-links"));
    } else {
      cardItems = Array.from(element.querySelectorAll(".companies-column, .bold-links"));
    }
    cardItems.forEach((item) => {
      const imgEl = item.querySelector("img");
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      if (imgEl) {
        const picture = document.createElement("picture");
        const newImg = document.createElement("img");
        newImg.src = imgEl.getAttribute("src") || "";
        newImg.alt = imgEl.getAttribute("alt") || imgEl.getAttribute("title") || "";
        picture.appendChild(newImg);
        imageCell.appendChild(picture);
      }
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      if (isCompanyLogos) {
        const linkEl = item.querySelector("figure a, .wpb_wrapper > a");
        const descP = item.querySelector(".wpb_text_column .wpb_wrapper p");
        if (descP) {
          const p = document.createElement("p");
          p.textContent = descP.textContent.trim();
          textCell.appendChild(p);
        }
        if (linkEl && linkEl.getAttribute("href")) {
          const link = document.createElement("p");
          const a = document.createElement("a");
          a.href = linkEl.getAttribute("href");
          a.textContent = linkEl.getAttribute("href");
          link.appendChild(a);
          textCell.appendChild(link);
        }
      } else {
        const h2El = item.querySelector(".three-col-card h2");
        const h3El = item.querySelector(".three-col-card h3");
        const descEl = item.querySelector(".three-col-excerpt .wpb_wrapper p, .three-col-excerpt p");
        const ctaEl = item.querySelector(".blue-link a");
        if (h2El) {
          const h2 = document.createElement("h2");
          h2.textContent = h2El.textContent.trim();
          textCell.appendChild(h2);
        }
        if (h3El) {
          const h3 = document.createElement("h3");
          h3.textContent = h3El.textContent.trim();
          textCell.appendChild(h3);
        }
        if (descEl) {
          const p = document.createElement("p");
          p.innerHTML = descEl.innerHTML.trim();
          textCell.appendChild(p);
        }
        if (ctaEl) {
          const linkP = document.createElement("p");
          const a = document.createElement("a");
          a.href = ctaEl.getAttribute("href") || "";
          a.textContent = ctaEl.textContent.trim();
          linkP.appendChild(a);
          textCell.appendChild(linkP);
        }
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel.js
  function parse4(element, { document }) {
    const slides = element.querySelectorAll(".wpsisac-image-slide");
    const cells = [];
    slides.forEach((slide) => {
      const img = slide.querySelector("img");
      const mediaCell = document.createDocumentFragment();
      mediaCell.appendChild(document.createComment(" field:media_image "));
      if (img) {
        const picture = document.createElement("picture");
        const newImg = document.createElement("img");
        newImg.src = img.src || img.getAttribute("src") || "";
        newImg.alt = img.alt || img.getAttribute("alt") || "";
        picture.appendChild(newImg);
        mediaCell.appendChild(picture);
      }
      const contentCell = document.createDocumentFragment();
      contentCell.appendChild(document.createComment(" field:content_text "));
      const link = slide.querySelector("a");
      if (link) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = link.href || link.getAttribute("href") || "";
        const linkText = img && (img.alt || img.getAttribute("alt")) || "";
        a.textContent = linkText;
        p.appendChild(a);
        contentCell.appendChild(p);
      }
      cells.push([mediaCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/teradyne-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, ["#CybotCookiebotDialog"]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header#masthead",
        "footer",
        "aside.country-selector",
        "noscript",
        "link"
      ]);
    }
  }

  // tools/importer/transformers/teradyne-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const { template } = payload;
      if (!template || !template.sections || template.sections.length < 2) return;
      const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document };
      const sections = template.sections;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) continue;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadata);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-banner": parse,
    "columns": parse2,
    "cards": parse3,
    "carousel": parse4
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    urls: [
      "https://www.teradyne.com"
    ],
    description: "Teradyne corporate homepage with hero banner, product highlights, and company information",
    blocks: [
      {
        name: "hero-banner",
        instances: [".masked-video-row"]
      },
      {
        name: "columns",
        instances: [".vc_custom_1750270793937"]
      },
      {
        name: "cards",
        instances: [".three-columns-companies", "#three-column-container .three-column-row"]
      },
      {
        name: "carousel",
        instances: [".wpsisac-slick-carousal-wrp"]
      }
    ],
    sections: [
      {
        id: "section-1-hero",
        name: "Hero Section",
        selector: ".masked-video-row",
        style: "dark-gradient",
        blocks: ["hero-banner"],
        defaultContent: []
      },
      {
        id: "section-2-features",
        name: "Two-Column Features",
        selector: ".vc_custom_1750270793937",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "section-3-companies",
        name: "Teradyne Companies",
        selector: ".vc_custom_1750270777936",
        style: null,
        blocks: ["cards"],
        defaultContent: [".teradyne-companies", ".we-solve h2"]
      },
      {
        id: "section-4-events",
        name: "Events Carousel",
        selector: "#slider-row",
        style: "light-grey",
        blocks: ["carousel"],
        defaultContent: ["#slider-row .teradyne-companies"]
      },
      {
        id: "section-5-cards",
        name: "Three-Column Cards",
        selector: "#three-column-container",
        style: null,
        blocks: ["cards"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
