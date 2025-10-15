const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["js/CdBZIP.js","js/BANJ5N.js","js/DI0nXp.js"])))=>i.map(i=>d[i]);
import { c as createSignal, a as createComponent, b as createContext, u as useContext, r as render, d as createResource, e as createEffect, V as ViewportProvider, S as Switch, M as Match, f as Show, t as template, l as lazy } from "./BANJ5N.js";
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
    promise = Promise.all(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
          link.crossOrigin = "";
        }
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  return promise.then(() => baseModule()).catch((err) => {
    const e = new Event("vite:preloadError", {
      cancelable: true
    });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  });
};
async function getImageJSON() {
  if (document.title.split(" | ")[0] === "404") {
    return [];
  }
  try {
    const response = await fetch(`${window.location.href}index.json`, {
      headers: {
        Accept: "application/json"
      }
    });
    const data = await response.json();
    return data.sort((a, b) => {
      if (a.index < b.index) {
        return -1;
      }
      return 1;
    });
  } catch (_) {
    return [];
  }
}
var prefix = "Invariant failed";
function invariant(condition, message) {
  if (condition) {
    return;
  }
  {
    throw new Error(prefix);
  }
}
function increment(num, length) {
  return (num + 1) % length;
}
function decrement(num, length) {
  return (num + length - 1) % length;
}
function expand(num) {
  return ("0000" + num.toString()).slice(-4);
}
async function loadGsap() {
  const g = await __vitePreload(() => import("./C37wwR.js"), true ? [] : void 0);
  return g.gsap;
}
function getThresholdSessionIndex() {
  const s = sessionStorage.getItem("thresholdsIndex");
  if (s === null) return 2;
  return parseInt(s);
}
const thresholds = [{
  threshold: 20,
  trailLength: 20
}, {
  threshold: 40,
  trailLength: 10
}, {
  threshold: 80,
  trailLength: 5
}, {
  threshold: 140,
  trailLength: 5
}, {
  threshold: 200,
  trailLength: 5
}];
const makeStateContext = (state, setState) => {
  return [state, {
    setIndex: (index) => {
      setState((s) => {
        return {
          ...s,
          index
        };
      });
    },
    incIndex: () => {
      setState((s) => {
        return {
          ...s,
          index: increment(s.index, s.length)
        };
      });
    },
    decIndex: () => {
      setState((s) => {
        return {
          ...s,
          index: decrement(s.index, s.length)
        };
      });
    },
    incThreshold: () => {
      setState((s) => {
        return {
          ...s,
          ...updateThreshold(s.threshold, thresholds, 1)
        };
      });
    },
    decThreshold: () => {
      setState((s) => {
        return {
          ...s,
          ...updateThreshold(s.threshold, thresholds, -1)
        };
      });
    }
  }];
};
const StateContext = createContext();
function updateThreshold(currentThreshold, thresholds2, stride) {
  const i = thresholds2.findIndex((t) => t.threshold === currentThreshold) + stride;
  if (i < 0 || i >= thresholds2.length) return thresholds2[i - stride];
  sessionStorage.setItem("thresholdsIndex", i.toString());
  return thresholds2[i];
}
function StateProvider(props) {
  const defaultState = {
    index: -1,
    // eslint-disable-next-line solid/reactivity
    length: props.length,
    threshold: thresholds[getThresholdSessionIndex()].threshold,
    trailLength: thresholds[getThresholdSessionIndex()].trailLength
  };
  const [state, setState] = createSignal(defaultState);
  const contextValue = makeStateContext(state, setState);
  return createComponent(StateContext.Provider, {
    value: contextValue,
    get children() {
      return props.children;
    }
  });
}
function useState() {
  const uc = useContext(StateContext);
  invariant(uc);
  return uc;
}
var _tmpl$ = /* @__PURE__ */ template(`<div>Error`);
const container = document.getElementsByClassName("container")[0];
const Desktop = lazy(async () => await __vitePreload(() => import("./CdBZIP.js"), true ? __vite__mapDeps([0,1]) : void 0));
const Mobile = lazy(async () => await __vitePreload(() => import("./DI0nXp.js"), true ? __vite__mapDeps([2,1]) : void 0));
function Main() {
  const [ijs] = createResource(getImageJSON);
  const isMobile = window.matchMedia("(hover: none)").matches && !window.navigator.userAgent.includes("Win");
  const [scrollable, setScollable] = createSignal(true);
  createEffect(() => {
    if (scrollable()) {
      container.classList.remove("disableScroll");
    } else {
      container.classList.add("disableScroll");
    }
  });
  return createComponent(Show, {
    get when() {
      return ijs.state === "ready";
    },
    get children() {
      return createComponent(ViewportProvider, {
        get children() {
          return createComponent(StateProvider, {
            get length() {
              var _a;
              return ((_a = ijs()) == null ? void 0 : _a.length) ?? 0;
            },
            get children() {
              return createComponent(Switch, {
                get fallback() {
                  return _tmpl$();
                },
                get children() {
                  return [createComponent(Match, {
                    when: isMobile,
                    get children() {
                      return createComponent(Mobile, {
                        get ijs() {
                          return ijs() ?? [];
                        },
                        get closeText() {
                          return container.dataset.close;
                        },
                        get loadingText() {
                          return container.dataset.loading;
                        },
                        setScrollable: setScollable
                      });
                    }
                  }), createComponent(Match, {
                    when: !isMobile,
                    get children() {
                      return createComponent(Desktop, {
                        get ijs() {
                          return ijs() ?? [];
                        },
                        get prevText() {
                          return container.dataset.prev;
                        },
                        get closeText() {
                          return container.dataset.close;
                        },
                        get nextText() {
                          return container.dataset.next;
                        },
                        get loadingText() {
                          return container.dataset.loading;
                        }
                      });
                    }
                  })];
                }
              });
            }
          });
        }
      });
    }
  });
}
render(() => createComponent(Main, {}), container);
export {
  __vitePreload as _,
  invariant as a,
  decrement as d,
  expand as e,
  increment as i,
  loadGsap as l,
  useState as u
};
