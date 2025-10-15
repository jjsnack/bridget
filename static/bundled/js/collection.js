import { c as createSignal, e as createEffect, o as onCleanup, i as insert, g as createRenderEffect, s as setAttribute, t as template, a as createComponent, F as For, r as render, h as onMount, V as ViewportProvider, f as Show } from "./BANJ5N.js";
var _tmpl$$1 = /* @__PURE__ */ template(`<div class=collection-tile><a><div class=tile-image><img loading=lazy></div><div class=tile-title>`);
function CollectionTile(props) {
  const [currentImageIndex, setCurrentImageIndex] = createSignal(0);
  const [isHovering, setIsHovering] = createSignal(false);
  let intervalId = null;
  createEffect(() => {
    if (isHovering() && !props.isMobile && props.collection.images.length > 1) {
      intervalId = setInterval(() => {
        setCurrentImageIndex((prev) => {
          const maxIndex = Math.min(4, props.collection.images.length);
          return (prev + 1) % maxIndex;
        });
      }, 500);
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      setCurrentImageIndex(0);
    }
  });
  onCleanup(() => {
    if (intervalId) {
      clearInterval(intervalId);
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
  const titlePosition = () => currentImageIndex() % 4;
  const currentImage = () => {
    var _a;
    const img = props.collection.images[currentImageIndex()];
    return (img == null ? void 0 : img.loRes) || ((_a = props.collection.images[0]) == null ? void 0 : _a.loRes) || "";
  };
  return (() => {
    var _el$ = _tmpl$$1(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.firstChild, _el$5 = _el$3.nextSibling;
    _el$.addEventListener("mouseleave", handleMouseLeave);
    _el$.addEventListener("mouseenter", handleMouseEnter);
    insert(_el$5, () => props.collection.title.toUpperCase());
    createRenderEffect((_p$) => {
      var _a, _b;
      var _v$ = props.collection.permalink, _v$2 = `${props.collection.heroWidth} / ${props.collection.heroHeight}`, _v$3 = currentImage(), _v$4 = props.collection.title, _v$5 = currentImageIndex() > 0 ? `${(((_a = props.collection.images[currentImageIndex()]) == null ? void 0 : _a.width) || props.collection.heroWidth) > (((_b = props.collection.images[currentImageIndex()]) == null ? void 0 : _b.height) || props.collection.heroHeight) ? "50%" : "50%"} 50%` : "50% 50%", _v$6 = !!(titlePosition() === 0), _v$7 = !!(titlePosition() === 1), _v$8 = !!(titlePosition() === 2), _v$9 = !!(titlePosition() === 3), _v$10 = !!(isHovering() && !props.isMobile);
      _v$ !== _p$.e && setAttribute(_el$2, "href", _p$.e = _v$);
      _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$3.style.setProperty("aspect-ratio", _v$2) : _el$3.style.removeProperty("aspect-ratio"));
      _v$3 !== _p$.a && setAttribute(_el$4, "src", _p$.a = _v$3);
      _v$4 !== _p$.o && setAttribute(_el$4, "alt", _p$.o = _v$4);
      _v$5 !== _p$.i && ((_p$.i = _v$5) != null ? _el$4.style.setProperty("object-position", _v$5) : _el$4.style.removeProperty("object-position"));
      _v$6 !== _p$.n && _el$5.classList.toggle("position-bottom", _p$.n = _v$6);
      _v$7 !== _p$.s && _el$5.classList.toggle("position-right", _p$.s = _v$7);
      _v$8 !== _p$.h && _el$5.classList.toggle("position-top", _p$.h = _v$8);
      _v$9 !== _p$.r && _el$5.classList.toggle("position-left", _p$.r = _v$9);
      _v$10 !== _p$.d && _el$5.classList.toggle("rotating", _p$.d = _v$10);
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
      d: void 0
    });
    return _el$;
  })();
}
var _tmpl$ = /* @__PURE__ */ template(`<div class=collection-grid>`);
function CollectionGrid(props) {
  const isMobile = window.matchMedia("(hover: none)").matches && !window.navigator.userAgent.includes("Win");
  return (() => {
    var _el$ = _tmpl$();
    insert(_el$, createComponent(For, {
      get each() {
        return props.collections;
      },
      children: (collection) => createComponent(CollectionTile, {
        collection,
        isMobile
      })
    }));
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
