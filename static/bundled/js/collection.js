import { i as insert, a as createComponent, g as createRenderEffect, s as setAttribute, F as For, t as template, r as render, c as createSignal, o as onMount, V as ViewportProvider, f as Show } from "./CJ_0R0.js";
var _tmpl$ = /* @__PURE__ */ template(`<div class=collection-grid>`), _tmpl$2 = /* @__PURE__ */ template(`<div class=collection-tile><a><div class=tile-image><img loading=lazy></div><div class=tile-title>`);
function CollectionGrid(props) {
  return (() => {
    var _el$ = _tmpl$();
    insert(_el$, createComponent(For, {
      get each() {
        return props.collections;
      },
      children: (collection) => (() => {
        var _el$2 = _tmpl$2(), _el$3 = _el$2.firstChild, _el$4 = _el$3.firstChild, _el$5 = _el$4.firstChild, _el$6 = _el$4.nextSibling;
        insert(_el$6, () => collection.title.toUpperCase());
        createRenderEffect((_p$) => {
          var _a;
          var _v$ = collection.permalink, _v$2 = `${collection.heroWidth} / ${collection.heroHeight}`, _v$3 = (_a = collection.images[0]) == null ? void 0 : _a.loRes, _v$4 = collection.title;
          _v$ !== _p$.e && setAttribute(_el$3, "href", _p$.e = _v$);
          _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$4.style.setProperty("aspect-ratio", _v$2) : _el$4.style.removeProperty("aspect-ratio"));
          _v$3 !== _p$.a && setAttribute(_el$5, "src", _p$.a = _v$3);
          _v$4 !== _p$.o && setAttribute(_el$5, "alt", _p$.o = _v$4);
          return _p$;
        }, {
          e: void 0,
          t: void 0,
          a: void 0,
          o: void 0
        });
        return _el$2;
      })()
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
