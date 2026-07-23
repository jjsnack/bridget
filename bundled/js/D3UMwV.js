import { A as createComponent, C as use, E as For, L as on, N as createRenderEffect, O as Show, R as onCleanup, S as template, a as useImageState, b as setStyleProperty, g as insert, h as delegateEvents, j as createEffect, n as useMobileState, y as setAttribute, z as onMount } from "./main.js";
import { t as Gallery } from "./D4UST3.js";
//#region assets/ts/mobile/collection.tsx
var _tmpl$ = /*#__PURE__*/ template(`<div class=collection>`), _tmpl$2 = /*#__PURE__*/ template(`<img>`);
function getRandom(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function onIntersection(element, trigger) {
	new IntersectionObserver((entries, observer) => {
		for (const entry of entries) if (trigger(entry)) {
			observer.disconnect();
			break;
		}
	}).observe(element);
}
function Collection() {
	const imageState = useImageState();
	const imgs = Array(imageState().length);
	const [mobile, { setIndex, setIsOpen }] = useMobileState();
	const handleClick = (i) => {
		if (mobile.isAnimating()) return;
		setIndex(i);
		setIsOpen(true);
	};
	const scrollToActive = () => {
		const index = mobile.index();
		if (index < 0) return;
		imgs[index].scrollIntoView({
			behavior: "auto",
			block: "center"
		});
	};
	onMount(() => {
		imgs.forEach((img, i) => {
			if (i < 5) img.src = img.dataset.src;
			img.addEventListener("click", () => {
				handleClick(i);
			}, { passive: true });
			img.addEventListener("keydown", () => {
				handleClick(i);
			}, { passive: true });
			onIntersection(img, (entry) => {
				if (entry.intersectionRatio <= 0) return false;
				if (i + 5 < imgs.length) imgs[i + 5].src = imgs[i + 5].dataset.src;
				return true;
			});
		});
	});
	createEffect(on(mobile.isOpen, () => {
		if (!mobile.isOpen()) scrollToActive();
	}, { defer: true }));
	return (() => {
		var _el$ = _tmpl$();
		insert(_el$, createComponent(For, {
			get each() {
				return imageState().images;
			},
			children: (ij, i) => (() => {
				var _el$2 = _tmpl$2();
				_el$2.$$keydown = () => {
					handleClick(i());
				};
				_el$2.$$click = () => {
					handleClick(i());
				};
				var _ref$ = imgs[i()];
				typeof _ref$ === "function" ? use(_ref$, _el$2) : imgs[i()] = _el$2;
				createRenderEffect((_p$) => {
					var _v$ = ij.loImgH, _v$2 = ij.loImgW, _v$3 = ij.loUrl, _v$4 = ij.alt, _v$5 = `translate3d(${i() !== 0 ? getRandom(-25, 25) : 0}%, ${i() !== 0 ? getRandom(-35, 35) : 0}%, 0)`;
					_v$ !== _p$.e && setAttribute(_el$2, "height", _p$.e = _v$);
					_v$2 !== _p$.t && setAttribute(_el$2, "width", _p$.t = _v$2);
					_v$3 !== _p$.a && setAttribute(_el$2, "data-src", _p$.a = _v$3);
					_v$4 !== _p$.o && setAttribute(_el$2, "alt", _p$.o = _v$4);
					_v$5 !== _p$.i && setStyleProperty(_el$2, "transform", _p$.i = _v$5);
					return _p$;
				}, {
					e: void 0,
					t: void 0,
					a: void 0,
					o: void 0,
					i: void 0
				});
				return _el$2;
			})()
		}));
		return _el$;
	})();
}
delegateEvents(["click", "keydown"]);
//#endregion
//#region assets/ts/mobile/layout.tsx
function Mobile(props) {
	const imageState = useImageState();
	const [mobile] = useMobileState();
	createEffect(() => {
		const container = document.getElementsByClassName("container").item(0);
		if (container === null) return;
		if (mobile.isScrollLocked()) container.classList.add("disableScroll");
		else container.classList.remove("disableScroll");
	});
	onCleanup(() => {
		document.getElementsByClassName("container").item(0)?.classList.remove("disableScroll");
	});
	return createComponent(Show, {
		get when() {
			return imageState().length > 0;
		},
		get children() {
			return [createComponent(Collection, {}), createComponent(Gallery, {
				get closeText() {
					return props.closeText;
				},
				get loadingText() {
					return props.loadingText;
				}
			})];
		}
	});
}
//#endregion
export { Mobile as default };
