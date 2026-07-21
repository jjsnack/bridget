import { D as createEffect, I as onCleanup, L as onMount, O as createMemo, R as untrack, S as Show, T as createComponent, _ as use, a as isMobile, b as For, f as render, g as template, j as createSignal, k as createRenderEffect, l as delegateEvents, p as setAttribute, u as insert } from "./C3xGhw.js";
//#region assets/ts/grid.tsx
/**
* Grid archetype (`type: grid`, `layouts/grid/single.html`).
* A tag-filtered image grid; clicking a frame opens a viewer with a looping
* vertical thumbnail rail beside a full-size stage. Scrolling advances the
* image (wheel on desktop, arrows on touch); a live counter in the nav shows
* current / total.
*
* Grid + filter bar are server-rendered; this module is a progressive
* enhancement (mirrors post.tsx): it wires those existing DOM nodes and
* portals the viewer overlay. No desktop/mobile split — one CSS layout swaps
* the rail from a left column to a bottom strip at the tablet breakpoint.
*/
var _tmpl$ = /*#__PURE__*/ template(`<figcaption>`), _tmpl$2 = /*#__PURE__*/ template(`<figure class=gridStageFrame><img draggable=false>`), _tmpl$3 = /*#__PURE__*/ template(`<button class="gridNav prev"type=button>&#x2039;`), _tmpl$4 = /*#__PURE__*/ template(`<button class="gridNav next"type=button>&#x203A;`), _tmpl$5 = /*#__PURE__*/ template(`<div class=gridViewer role=dialog aria-modal=true aria-label="Image viewer"><button class=gridClose type=button></button><ol class=gridRail aria-label=Thumbnails></ol><div class=gridStage>`), _tmpl$6 = /*#__PURE__*/ template(`<li><button class=gridRailItem type=button><img loading=lazy draggable=false>`, true, false, false);
var RAIL_REPEAT = 5;
var RAIL_MID = Math.floor(RAIL_REPEAT / 2);
var RAIL_GROW = .3;
var RAIL_LIFT = 30;
var RAIL_FADE = .55;
var COL_MIN = 1;
var COL_MAX = 5;
var COL_DEFAULT = 3;
var COL_KEY = "gridColumns";
function parseItems(buttons) {
	return buttons.map((btn) => ({
		index: Number(btn.dataset.index ?? 0),
		tags: (btn.dataset.tags ?? "").split(" ").filter(Boolean),
		hiUrl: btn.dataset.hiUrl ?? "",
		hiW: Number(btn.dataset.hiW ?? 0),
		hiH: Number(btn.dataset.hiH ?? 0),
		thumbUrl: btn.querySelector("img")?.getAttribute("src") ?? "",
		caption: btn.dataset.caption ?? ""
	}));
}
function setupColumns(main) {
	const control = document.querySelector(".gridColumns");
	const items = main.querySelector(".gridItems");
	if (control == null || items == null) return;
	const dec = control.querySelector(".dec");
	const inc = control.querySelector(".inc");
	const nums = Array.from(control.querySelectorAll(".num"));
	const stored = Number(sessionStorage.getItem(COL_KEY));
	let cols = Number.isInteger(stored) && stored >= COL_MIN && stored <= COL_MAX ? stored : COL_DEFAULT;
	const apply = () => {
		items.style.setProperty("--grid-cols", String(cols));
		items.dataset.cols = String(cols);
		const digits = String(cols).padStart(nums.length, "0");
		nums.forEach((el, i) => el.innerText = digits[i] ?? "0");
		sessionStorage.setItem(COL_KEY, String(cols));
	};
	dec?.addEventListener("click", () => {
		if (cols > COL_MIN) {
			cols -= 1;
			apply();
		}
	});
	inc?.addEventListener("click", () => {
		if (cols < COL_MAX) {
			cols += 1;
			apply();
		}
	});
	apply();
}
function setCounter(current, total) {
	const el = document.querySelector(".gridCount");
	if (el == null) return;
	const digits = String(current).padStart(3, "0") + String(total).padStart(3, "0");
	el.querySelectorAll(".num").forEach((span, i) => {
		span.innerText = digits[i] ?? "0";
	});
}
function Grid(props) {
	const items = createMemo(() => parseItems(props.gridButtons));
	const mobile = isMobile();
	const [activeTag, setActiveTag] = createSignal("*");
	const [open, setOpen] = createSignal(false);
	const [pos, setPos] = createSignal(0);
	const [railIndex, setRailIndex] = createSignal(0);
	let trigger = null;
	let closeBtn;
	let rail;
	const vertical = !mobile;
	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	let noRebaseUntil = 0;
	let scrollRAF = 0;
	const filtered = createMemo(() => activeTag() === "*" ? items() : items().filter((it) => it.tags.includes(activeTag())));
	const current = createMemo(() => filtered()[pos()] ?? null);
	const railRows = createMemo(() => {
		const f = filtered();
		const rows = [];
		for (let c = 0; c < RAIL_REPEAT; c++) rows.push(...f);
		return rows;
	});
	createEffect(() => {
		const tag = activeTag();
		props.gridButtons.forEach((btn) => {
			const tags = (btn.dataset.tags ?? "").split(" ").filter(Boolean);
			btn.classList.toggle("hidden", tag !== "*" && !tags.includes(tag));
		});
		props.tagButtons.forEach((btn) => {
			const on = (btn.dataset.tag ?? "*") === tag;
			btn.classList.toggle("active", on);
			btn.setAttribute("aria-pressed", String(on));
		});
	});
	createEffect(() => {
		setCounter(pos() + 1, filtered().length);
	});
	const kidStart = (k) => vertical ? k.offsetTop : k.offsetLeft;
	const kidSize = (k) => vertical ? k.offsetHeight : k.offsetWidth;
	const railPos = (el) => vertical ? el.scrollTop : el.scrollLeft;
	const setRailPos = (el, v) => {
		if (vertical) el.scrollTop = v;
		else el.scrollLeft = v;
	};
	const railViewport = (el) => vertical ? el.clientHeight : el.clientWidth;
	const scrollToRail = (i, smooth) => {
		const li = rail?.children[i];
		if (li == null) return;
		if (smooth) noRebaseUntil = performance.now() + 700;
		li.scrollIntoView({
			behavior: smooth ? "smooth" : "auto",
			block: "center",
			inline: "center"
		});
	};
	const onRailScroll = () => {
		if (scrollRAF !== 0) return;
		scrollRAF = requestAnimationFrame(() => {
			scrollRAF = 0;
			const el = rail;
			const n = filtered().length;
			if (el == null || n === 0) return;
			const kids = el.children;
			if (kids.length <= n) return;
			const oneSet = kidStart(kids[n]) - kidStart(kids[0]);
			let wrapped = false;
			if (oneSet > 0 && performance.now() >= noRebaseUntil) {
				const p = railPos(el);
				if (p < oneSet) {
					setRailPos(el, p + oneSet);
					wrapped = true;
				} else if (p >= oneSet * (RAIL_REPEAT - 1)) {
					setRailPos(el, p - oneSet);
					wrapped = true;
				}
			}
			if (wrapped) {
				el.classList.add("noAnim");
				requestAnimationFrame(() => el.classList.remove("noAnim"));
			}
			const mid = railPos(el) + railViewport(el) / 2;
			const range = oneSet / n * 1.3;
			let best = 0;
			let bestDist = Infinity;
			for (let i = 0; i < kids.length; i++) {
				const k = kids[i];
				const dist = Math.abs(kidStart(k) + kidSize(k) / 2 - mid);
				if (dist < bestDist) {
					bestDist = dist;
					best = i;
				}
				const near = Math.max(0, 1 - dist / range);
				const t = near * near * (3 - 2 * near);
				if (!reduceMotion) {
					const lift = RAIL_LIFT * t;
					k.style.transform = vertical ? `translateX(${lift}px) scale(${1 + RAIL_GROW * t})` : `translateY(${-lift}px) scale(${1 + RAIL_GROW * t})`;
				}
				k.style.opacity = String(RAIL_FADE + (1 - RAIL_FADE) * t);
				k.style.zIndex = t > .02 ? String(Math.round(t * 100) + 1) : "0";
			}
			setRailIndex(best);
			setPos(best % n);
		});
	};
	const next = () => scrollToRail(railIndex() + 1, true);
	const prev = () => scrollToRail(railIndex() - 1, true);
	const goTo = (flat) => scrollToRail(flat, true);
	const openAt = (btn) => {
		const n = filtered().length;
		const p = filtered().findIndex((it) => it.index === Number(btn.dataset.index ?? 0));
		if (p < 0) return;
		trigger = btn;
		setPos(p);
		setRailIndex(RAIL_MID * n + p);
		setOpen(true);
	};
	const close = () => {
		setOpen(false);
		trigger?.focus();
	};
	const onKey = (e) => {
		if (!open()) return;
		if (e.key === "Escape") close();
		else if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
		else if (e.key === "ArrowLeft" || e.key === "ArrowUp") prev();
	};
	const onWheel = (e) => {
		if (!open() || rail == null) return;
		e.preventDefault();
		setRailPos(rail, railPos(rail) + (vertical ? e.deltaY : e.deltaY || e.deltaX));
	};
	createEffect(() => {
		document.body.style.overflow = open() ? "hidden" : "";
		document.body.classList.toggle("gridViewing", open());
	});
	onCleanup(() => {
		document.body.style.overflow = "";
		document.body.classList.remove("gridViewing");
	});
	createEffect(() => {
		const isOpen = open();
		Array.from(document.body.children).forEach((el) => {
			if (el !== props.root) el.toggleAttribute("inert", isOpen);
		});
		if (isOpen) closeBtn?.focus();
	});
	onCleanup(() => {
		Array.from(document.body.children).forEach((el) => {
			el.toggleAttribute("inert", false);
		});
	});
	createEffect(() => {
		if (!open() || rail == null) return;
		const el = rail;
		requestAnimationFrame(() => {
			scrollToRail(untrack(railIndex), false);
			onRailScroll();
		});
		el.addEventListener("scroll", onRailScroll, { passive: true });
		onCleanup(() => {
			el.removeEventListener("scroll", onRailScroll);
			if (scrollRAF !== 0) {
				cancelAnimationFrame(scrollRAF);
				scrollRAF = 0;
			}
		});
	});
	onMount(() => {
		const c = new AbortController();
		const { signal } = c;
		props.gridButtons.forEach((btn) => btn.addEventListener("click", () => openAt(btn), { signal }));
		props.tagButtons.forEach((btn) => btn.addEventListener("click", () => setActiveTag(btn.dataset.tag ?? "*"), { signal }));
		window.addEventListener("keydown", onKey, { signal });
		window.addEventListener("wheel", onWheel, {
			signal,
			passive: false
		});
		onCleanup(() => c.abort());
	});
	return createComponent(Show, {
		get when() {
			return open();
		},
		get children() {
			var _el$ = _tmpl$5(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.nextSibling;
			_el$2.$$click = close;
			var _ref$ = closeBtn;
			typeof _ref$ === "function" ? use(_ref$, _el$2) : closeBtn = _el$2;
			insert(_el$2, () => props.closeText);
			var _ref$2 = rail;
			typeof _ref$2 === "function" ? use(_ref$2, _el$3) : rail = _el$3;
			insert(_el$3, createComponent(For, {
				get each() {
					return railRows();
				},
				children: (row, i) => {
					const active = () => i() === railIndex();
					return (() => {
						var _el$0 = _tmpl$6(), _el$1 = _el$0.firstChild, _el$10 = _el$1.firstChild;
						_el$1.$$click = () => goTo(i());
						createRenderEffect((_p$) => {
							var _v$5 = !!active(), _v$6 = active() ? "true" : void 0, _v$7 = row.thumbUrl, _v$8 = row.caption;
							_v$5 !== _p$.e && _el$1.classList.toggle("active", _p$.e = _v$5);
							_v$6 !== _p$.t && setAttribute(_el$1, "aria-current", _p$.t = _v$6);
							_v$7 !== _p$.a && setAttribute(_el$10, "src", _p$.a = _v$7);
							_v$8 !== _p$.o && setAttribute(_el$10, "alt", _p$.o = _v$8);
							return _p$;
						}, {
							e: void 0,
							t: void 0,
							a: void 0,
							o: void 0
						});
						return _el$0;
					})();
				}
			}));
			insert(_el$4, createComponent(Show, {
				get when() {
					return current();
				},
				get children() {
					var _el$5 = _tmpl$2(), _el$6 = _el$5.firstChild;
					insert(_el$5, createComponent(Show, {
						get when() {
							return (current()?.caption ?? "") !== "";
						},
						get children() {
							var _el$7 = _tmpl$();
							insert(_el$7, () => current()?.caption);
							return _el$7;
						}
					}), null);
					createRenderEffect((_p$) => {
						var _v$ = current()?.hiUrl, _v$2 = current()?.hiW, _v$3 = current()?.hiH, _v$4 = current()?.caption;
						_v$ !== _p$.e && setAttribute(_el$6, "src", _p$.e = _v$);
						_v$2 !== _p$.t && setAttribute(_el$6, "width", _p$.t = _v$2);
						_v$3 !== _p$.a && setAttribute(_el$6, "height", _p$.a = _v$3);
						_v$4 !== _p$.o && setAttribute(_el$6, "alt", _p$.o = _v$4);
						return _p$;
					}, {
						e: void 0,
						t: void 0,
						a: void 0,
						o: void 0
					});
					return _el$5;
				}
			}), null);
			insert(_el$4, createComponent(Show, {
				when: mobile,
				get children() {
					return [(() => {
						var _el$8 = _tmpl$3();
						_el$8.$$click = prev;
						createRenderEffect(() => setAttribute(_el$8, "aria-label", props.prevText));
						return _el$8;
					})(), (() => {
						var _el$9 = _tmpl$4();
						_el$9.$$click = next;
						createRenderEffect(() => setAttribute(_el$9, "aria-label", props.nextText));
						return _el$9;
					})()];
				}
			}), null);
			return _el$;
		}
	});
}
function initGrid() {
	const main = document.querySelector(".grid");
	if (main == null) return;
	const gridButtons = Array.from(main.querySelectorAll(".gridItem"));
	if (gridButtons.length === 0) return;
	const tagButtons = Array.from(main.querySelectorAll(".gridTag"));
	setupColumns(main);
	const ds = document.querySelector(".container")?.dataset;
	const root = document.createElement("div");
	root.className = "gridOverlayRoot";
	document.body.appendChild(root);
	render(() => createComponent(Grid, {
		gridButtons,
		tagButtons,
		root,
		get closeText() {
			return ds?.close ?? "close";
		},
		get nextText() {
			return ds?.next ?? "next";
		},
		get prevText() {
			return ds?.prev ?? "prev";
		}
	}), root);
}
delegateEvents(["click"]);
//#endregion
export { initGrid };
