import { c as createSignal, e as createEffect, o as onCleanup, g as insert, h as createRenderEffect, j as classList, s as style, k as setAttribute, t as template, m as delegateEvents, n as useViewport, p as onMount, a as createComponent, q as createMemo, F as For, r as render, V as ViewportProvider, f as Show } from "./BsD8YY.js";
var _tmpl$$1 = /* @__PURE__ */ template(`<div class=collection-tile><a><div class=tile-image><img loading=lazy></div><div class=tile-title>`);
const CYCLE_DELAY_MS = 500;
function CollectionTile(props) {
  const [currentImageIndex, setCurrentImageIndex] = createSignal(0);
  const [isHovering, setIsHovering] = createSignal(false);
  const [isTouching, setIsTouching] = createSignal(false);
  const [isDragging, setIsDragging] = createSignal(false);
  const [titlePositionIndex, setTitlePositionIndex] = createSignal(0);
  let imageIntervalId = null;
  let titleRotationIntervalId = null;
  let dragOffset = {
    x: 0,
    y: 0
  };
  createEffect(() => {
    const shouldCycle = props.collection.images.length > 1 && (isHovering() && !props.isMobile || isTouching() && props.isMobile);
    if (shouldCycle) {
      imageIntervalId = setInterval(() => {
        setCurrentImageIndex((prev) => {
          const maxIndex = Math.min(4, props.collection.images.length);
          return (prev + 1) % maxIndex;
        });
      }, CYCLE_DELAY_MS);
    } else {
      if (imageIntervalId) {
        clearInterval(imageIntervalId);
        imageIntervalId = null;
      }
      setCurrentImageIndex(0);
    }
  });
  onCleanup(() => {
    if (imageIntervalId) {
      clearInterval(imageIntervalId);
    }
    if (titleRotationIntervalId) {
      clearInterval(titleRotationIntervalId);
    }
  });
  createEffect(() => {
    const shouldRotateTitle = (props.preset === "square" || props.preset === "landscape") && isHovering() && !props.isMobile;
    if (shouldRotateTitle) {
      titleRotationIntervalId = setInterval(() => {
        setTitlePositionIndex((prev) => (prev + 1) % 4);
      }, CYCLE_DELAY_MS);
    } else {
      if (titleRotationIntervalId) {
        clearInterval(titleRotationIntervalId);
        titleRotationIntervalId = null;
      }
      setTitlePositionIndex(0);
    }
  });
  const handleMouseEnter = () => {
    if (!props.isMobile) {
      setIsHovering(true);
    }
  };
  const handleMouseLeave = () => {
    if (!props.isMobile) {
      setIsHovering(false);
    }
  };
  const handleTouchStart = () => {
    if (props.isMobile) {
      setIsTouching(true);
    }
  };
  const handleTouchEnd = () => {
    if (props.isMobile) {
      setIsTouching(false);
    }
  };
  let hasDragged = false;
  const handleMouseDown = (e) => {
    if (props.isMobile || !props.position || !props.onPositionUpdate || !props.onBringToFront) {
      return;
    }
    e.preventDefault();
    dragOffset = {
      x: e.clientX - props.position.x,
      y: e.clientY - props.position.y
    };
    hasDragged = false;
    setIsDragging(true);
    props.onBringToFront();
  };
  const handleMouseMove = (e) => {
    if (!isDragging() || !props.onPositionUpdate || !props.position) {
      return;
    }
    hasDragged = true;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    props.onPositionUpdate(newX, newY);
  };
  const handleMouseUp = () => {
    if (isDragging()) {
      setIsDragging(false);
    }
  };
  createEffect(() => {
    if (isDragging()) {
      const handleGlobalMouseMove = (e) => handleMouseMove(e);
      const handleGlobalMouseUp = () => handleMouseUp();
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
      onCleanup(() => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
      });
    }
  });
  const currentImage = () => {
    var _a;
    const img = props.collection.images[currentImageIndex()];
    return (img == null ? void 0 : img.loRes) || ((_a = props.collection.images[0]) == null ? void 0 : _a.loRes) || "";
  };
  const tileStyles = () => {
    if (!props.position) return void 0;
    return {
      position: "absolute",
      left: `${props.position.x}px`,
      top: `${props.position.y}px`,
      width: `${props.position.width}px`,
      height: "auto",
      "z-index": props.position.zIndex.toString(),
      cursor: isDragging() ? "grabbing" : "grab"
      // Show draggable cursor on desktop
    };
  };
  const imageStyles = () => {
    var _a, _b;
    const baseStyles = {
      "object-position": currentImageIndex() > 0 ? `${(((_a = props.collection.images[currentImageIndex()]) == null ? void 0 : _a.width) || props.collection.heroWidth) > (((_b = props.collection.images[currentImageIndex()]) == null ? void 0 : _b.height) || props.collection.heroHeight) ? "50%" : "50%"} 50%` : "50% 50%"
    };
    if (props.position) {
      return {
        ...baseStyles,
        width: `${props.position.width}px`,
        height: `${props.position.height}px`
      };
    }
    return baseStyles;
  };
  const titleText = props.collection.title.toUpperCase();
  const shouldShowTitle = () => {
    if (props.isMobile) {
      return true;
    }
    if (props.preset === "portrait") {
      return true;
    }
    if (props.preset === "square" || props.preset === "landscape") {
      return isHovering() || isDragging();
    }
    return true;
  };
  return (() => {
    var _el$ = _tmpl$$1(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.firstChild, _el$5 = _el$3.nextSibling;
    _el$.addEventListener("touchcancel", handleTouchEnd);
    _el$.$$touchend = handleTouchEnd;
    _el$.$$touchstart = handleTouchStart;
    _el$.$$mousedown = handleMouseDown;
    _el$.addEventListener("mouseleave", handleMouseLeave);
    _el$.addEventListener("mouseenter", handleMouseEnter);
    _el$2.$$click = (e) => {
      if (hasDragged) {
        e.preventDefault();
      }
    };
    insert(_el$5, titleText);
    createRenderEffect((_p$) => {
      var _v$ = {
        "tile--mobile": props.isMobile,
        "tile--desktop": !props.isMobile,
        [`tile--${props.preset}`]: true
      }, _v$2 = tileStyles(), _v$3 = props.collection.permalink, _v$4 = `${props.collection.heroWidth} / ${props.collection.heroHeight}`, _v$5 = currentImage(), _v$6 = props.collection.title, _v$7 = imageStyles(), _v$8 = !!(titlePositionIndex() === 0), _v$9 = !!(titlePositionIndex() === 1), _v$10 = !!(titlePositionIndex() === 2), _v$11 = !!(titlePositionIndex() === 3), _v$12 = shouldShowTitle() ? "1" : "0", _v$13 = shouldShowTitle() ? "visible" : "hidden", _v$14 = shouldShowTitle() ? "auto" : "none", _v$15 = shouldShowTitle() ? "opacity 200ms ease, visibility 0ms linear 0ms" : "opacity 200ms ease, visibility 0ms linear 200ms";
      _p$.e = classList(_el$, _v$, _p$.e);
      _p$.t = style(_el$, _v$2, _p$.t);
      _v$3 !== _p$.a && setAttribute(_el$2, "href", _p$.a = _v$3);
      _v$4 !== _p$.o && ((_p$.o = _v$4) != null ? _el$3.style.setProperty("aspect-ratio", _v$4) : _el$3.style.removeProperty("aspect-ratio"));
      _v$5 !== _p$.i && setAttribute(_el$4, "src", _p$.i = _v$5);
      _v$6 !== _p$.n && setAttribute(_el$4, "alt", _p$.n = _v$6);
      _p$.s = style(_el$4, _v$7, _p$.s);
      _v$8 !== _p$.h && _el$5.classList.toggle("tile-title--position-bottom", _p$.h = _v$8);
      _v$9 !== _p$.r && _el$5.classList.toggle("tile-title--position-right", _p$.r = _v$9);
      _v$10 !== _p$.d && _el$5.classList.toggle("tile-title--position-top", _p$.d = _v$10);
      _v$11 !== _p$.l && _el$5.classList.toggle("tile-title--position-left", _p$.l = _v$11);
      _v$12 !== _p$.u && ((_p$.u = _v$12) != null ? _el$5.style.setProperty("opacity", _v$12) : _el$5.style.removeProperty("opacity"));
      _v$13 !== _p$.c && ((_p$.c = _v$13) != null ? _el$5.style.setProperty("visibility", _v$13) : _el$5.style.removeProperty("visibility"));
      _v$14 !== _p$.w && ((_p$.w = _v$14) != null ? _el$5.style.setProperty("pointer-events", _v$14) : _el$5.style.removeProperty("pointer-events"));
      _v$15 !== _p$.m && ((_p$.m = _v$15) != null ? _el$5.style.setProperty("transition", _v$15) : _el$5.style.removeProperty("transition"));
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0,
      n: void 0,
      s: void 0,
      h: void 0,
      r: void 0,
      d: void 0,
      l: void 0,
      u: void 0,
      c: void 0,
      w: void 0,
      m: void 0
    });
    return _el$;
  })();
}
delegateEvents(["mousedown", "touchstart", "touchend", "click"]);
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }
  /**
   * Generate next random number between 0 and 1
   */
  next() {
    let t = this.seed += 1831565813;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  /**
   * Generate random integer between min (inclusive) and max (inclusive)
   */
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  /**
   * Generate random float between min and max
   */
  nextFloat(min, max) {
    return this.next() * (max - min) + min;
  }
}
function getTileSizeMultiplier(width, height, rng) {
  const aspectRatio = width / height;
  if (aspectRatio < 0.8) {
    const rand2 = rng.next();
    if (rand2 > 0.7) return 1.3;
    if (rand2 > 0.4) return 1.1;
    return 0.95;
  }
  if (aspectRatio >= 0.8 && aspectRatio <= 1.2) {
    const rand2 = rng.next();
    if (rand2 > 0.6) return 1.4;
    if (rand2 > 0.3) return 1.2;
    return 1;
  }
  const rand = rng.next();
  if (rand > 0.6) return 1.5;
  if (rand > 0.3) return 1.3;
  return 1.1;
}
function checkCollision(bounds1, bounds2, buffer) {
  return !(bounds1.x + bounds1.width + buffer < bounds2.x || bounds1.x > bounds2.x + bounds2.width + buffer || bounds1.y + bounds1.height + buffer < bounds2.y || bounds1.y > bounds2.y + bounds2.height + buffer);
}
function findNonCollidingPosition(tileWidth, tileHeight, existingPositions, containerWidth, containerHeight, rng, maxAttempts = 100, baseTileWidth = 400) {
  const buffer = 80;
  const edgeMargin = 50;
  const scaleFactor = baseTileWidth / 400;
  const approximateRowHeight = Math.max(250, 300 * scaleFactor);
  const maxRows = Math.ceil(containerHeight / approximateRowHeight);
  for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
    for (let attempt = 0; attempt < Math.ceil(maxAttempts / maxRows); attempt++) {
      const rowBaseY = edgeMargin + rowIndex * approximateRowHeight;
      const yOffset = rng.nextFloat(-40, 40);
      const y = Math.max(edgeMargin, Math.min(rowBaseY + yOffset, containerHeight - tileHeight - edgeMargin));
      const maxX = containerWidth - tileWidth - edgeMargin;
      if (maxX < edgeMargin) continue;
      const xOffset = rng.nextFloat(-30, 30);
      const baseX = edgeMargin + (maxX - edgeMargin) * rng.next();
      const x = Math.max(edgeMargin, Math.min(baseX + xOffset, maxX));
      const newBounds = { x, y, width: tileWidth, height: tileHeight };
      let hasCollision = false;
      for (const existing of existingPositions) {
        if (checkCollision(newBounds, existing, buffer)) {
          hasCollision = true;
          break;
        }
      }
      if (!hasCollision) {
        return { x, y };
      }
    }
  }
  return null;
}
function calculateTilePositions(collections, containerWidth, containerHeight, baseTileWidth) {
  const rng = new SeededRandom(12345);
  const positions = [];
  for (const collection of collections) {
    const aspectRatio = collection.heroWidth / collection.heroHeight;
    const sizeMultiplier = getTileSizeMultiplier(
      collection.heroWidth,
      collection.heroHeight,
      rng
    );
    const tileWidth = baseTileWidth * sizeMultiplier;
    const tileHeight = tileWidth / aspectRatio;
    const position = findNonCollidingPosition(
      tileWidth,
      tileHeight,
      positions,
      containerWidth,
      containerHeight,
      rng,
      100,
      // maxAttempts
      baseTileWidth
      // Pass base tile width for spacing calculation
    );
    if (position) {
      positions.push({
        x: position.x,
        y: position.y,
        width: tileWidth,
        height: tileHeight,
        zIndex: 1
      });
    } else {
      const fallbackY = positions.length * 400;
      positions.push({
        x: 100,
        y: fallbackY,
        width: tileWidth,
        height: tileHeight,
        zIndex: 1
      });
    }
  }
  return positions;
}
var _tmpl$ = /* @__PURE__ */ template(`<div class=collection-grid>`);
function CollectionGrid(props) {
  const isMobile = window.matchMedia("(hover: none)").matches && !window.navigator.userAgent.includes("Win");
  const [preset, config] = useViewport();
  const [positions, setPositions] = createSignal([]);
  const [containerHeight, setContainerHeight] = createSignal(3e3);
  const [windowDimensions, setWindowDimensions] = createSignal({
    width: window.innerWidth,
    height: window.innerHeight
  });
  onMount(() => {
    let resizeTimeout = null;
    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(() => {
        setWindowDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }, 200);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      window.removeEventListener("resize", handleResize);
    };
  });
  let zIndexCounter = 100;
  createEffect(() => {
    const currentPreset = preset();
    const currentConfig = config();
    const dimensions = windowDimensions();
    if (currentPreset !== "mobile" && currentConfig.collectionBaseTileWidth) {
      const containerWidth = dimensions.width;
      const estimatedHeight = Math.max(3e3, props.collections.length * 600);
      const calculatedPositions = calculateTilePositions(props.collections, containerWidth, estimatedHeight, currentConfig.collectionBaseTileWidth);
      setPositions(calculatedPositions);
      const maxY = calculatedPositions.reduce((max, pos) => Math.max(max, pos.y + pos.height), 0);
      setContainerHeight(maxY + 100);
    }
  });
  const updateTilePosition = (index, x, y) => {
    setPositions((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          x,
          y
        };
      }
      return updated;
    });
  };
  const bringToFront = (index) => {
    zIndexCounter++;
    setPositions((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          zIndex: zIndexCounter
        };
      }
      return updated;
    });
  };
  const useAbsoluteLayout = () => {
    return preset() !== "mobile" && config().collectionBaseTileWidth !== void 0;
  };
  return (() => {
    var _el$ = _tmpl$();
    insert(_el$, createComponent(For, {
      get each() {
        return props.collections;
      },
      children: (collection, index) => createComponent(CollectionTile, {
        collection,
        isMobile,
        get preset() {
          return preset();
        },
        get position() {
          return createMemo(() => !!useAbsoluteLayout())() ? positions()[index()] : void 0;
        },
        get onPositionUpdate() {
          return useAbsoluteLayout() && !isMobile ? (x, y) => updateTilePosition(index(), x, y) : void 0;
        },
        get onBringToFront() {
          return useAbsoluteLayout() && !isMobile ? () => bringToFront(index()) : void 0;
        }
      })
    }));
    createRenderEffect((_p$) => {
      var _v$ = !!useAbsoluteLayout(), _v$2 = useAbsoluteLayout() ? {
        position: "relative",
        "min-height": `${containerHeight()}px`
      } : void 0;
      _v$ !== _p$.e && _el$.classList.toggle("collection-grid--absolute", _p$.e = _v$);
      _p$.t = style(_el$, _v$2, _p$.t);
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$;
  })();
}
function CollectionApp() {
  const [collections, setCollections] = createSignal([]);
  onMount(() => {
    const dataElement = document.getElementById("collection-data");
    if (dataElement == null ? void 0 : dataElement.textContent) {
      try {
        const data = JSON.parse(dataElement.textContent);
        setCollections(data);
      } catch (error) {
        console.error("Failed to parse collection data:", error);
      }
    }
  });
  return createComponent(Show, {
    get when() {
      return collections().length > 0;
    },
    get children() {
      return createComponent(ViewportProvider, {
        get children() {
          return createComponent(CollectionGrid, {
            get collections() {
              return collections();
            }
          });
        }
      });
    }
  });
}
const container = document.getElementById("collection-app");
if (container) {
  render(() => createComponent(CollectionApp, {}), container);
}
