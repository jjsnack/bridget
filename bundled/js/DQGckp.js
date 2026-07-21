import { A as createRenderEffect, C as Show, E as createComponent, L as onCleanup, M as createSignal, O as createEffect, R as onMount, _ as template, a as isMobile, d as insert, k as createMemo, l as addEventListener, m as setAttribute, p as render, u as delegateEvents, v as use, x as For } from "./BAeMdM.js";
import { t as CustomCursor } from "./CZkXrZ.js";
//#region assets/ts/grid.tsx
/**
* Grid archetype (`type: grid`, `layouts/grid/single.html`).
* A tag-filtered image grid; clicking a frame opens a viewer with a vertical
* thumbnail rail of the current (filtered) set beside a full-size stage —
* prev/next cycle within the filtered set, matching gregorcollienne.com/focus.
* A column stepper (mirroring the gallery's threshold control) adjusts the
* masonry column count on desktop.
*
* Grid + filter bar + stepper are server-rendered; this module is a
* progressive enhancement (mirrors post.tsx): it wires those existing DOM
* nodes and portals the viewer overlay. No desktop/mobile split — one CSS
* layout swaps the rail from a left column to a bottom strip at the tablet
* breakpoint.
*/
var _tmpl$ = /*#__PURE__*/ template(`<button class="gridNav prev"type=button>&#x2039;`), _tmpl$2 = /*#__PURE__*/ template(`<button class="gridNav next"type=button>&#x203A;`), _tmpl$3 = /*#__PURE__*/ template(`<div class=gridViewer role=dialog aria-modal=true aria-label="Image viewer"><button class=gridClose type=button></button><ol class=gridRail aria-label=Thumbnails></ol><div class=gridStage>`), _tmpl$4 = /*#__PURE__*/ template(`<li><button class=gridRailItem type=button><img loading=lazy draggable=false>`, true, false, false), _tmpl$5 = /*#__PURE__*/ template(`<figcaption>`), _tmpl$6 = /*#__PURE__*/ template(`<figure class=gridStageFrame><img draggable=false>`);
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
function Grid(props) {
	const items = createMemo(() => parseItems(props.gridButtons));
	const mobile = isMobile();
	const [activeTag, setActiveTag] = createSignal("*");
	const [open, setOpen] = createSignal(false);
	const [pos, setPos] = createSignal(0);
	const [overImage, setOverImage] = createSignal(false);
	let trigger = null;
	let closeBtn;
	let rail;
	const filtered = createMemo(() => activeTag() === "*" ? items() : items().filter((it) => it.tags.includes(activeTag())));
	const current = createMemo(() => filtered()[pos()] ?? null);
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
	const openAt = (btn) => {
		const p = filtered().findIndex((it) => it.index === Number(btn.dataset.index ?? 0));
		if (p < 0) return;
		trigger = btn;
		setPos(p);
		setOpen(true);
	};
	const close = () => {
		setOpen(false);
		trigger?.focus();
	};
	const next = () => {
		setPos((p) => (p + 1) % filtered().length);
	};
	const prev = () => {
		setPos((p) => (p + filtered().length - 1) % filtered().length);
	};
	const onKey = (e) => {
		if (!open()) return;
		if (e.key === "Escape") close();
		else if (e.key === "ArrowRight") next();
		else if (e.key === "ArrowLeft") prev();
	};
	createEffect(() => {
		document.body.style.overflow = open() ? "hidden" : "";
	});
	onCleanup(() => {
		document.body.style.overflow = "";
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
		if (!open()) return;
		(rail?.querySelector(".gridRailItem.active"))?.scrollIntoView({
			block: "nearest",
			inline: "nearest"
		});
	});
	onMount(() => {
		const c = new AbortController();
		const { signal } = c;
		props.gridButtons.forEach((btn) => btn.addEventListener("click", () => openAt(btn), { signal }));
		props.tagButtons.forEach((btn) => btn.addEventListener("click", () => setActiveTag(btn.dataset.tag ?? "*"), { signal }));
		window.addEventListener("keydown", onKey, { signal });
		onCleanup(() => c.abort());
	});
	return [createComponent(Show, {
		get when() {
			return open();
		},
		get children() {
			var _el$ = _tmpl$3(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.nextSibling;
			_el$2.$$click = close;
			var _ref$ = closeBtn;
			typeof _ref$ === "function" ? use(_ref$, _el$2) : closeBtn = _el$2;
			insert(_el$2, () => props.closeText);
			var _ref$2 = rail;
			typeof _ref$2 === "function" ? use(_ref$2, _el$3) : rail = _el$3;
			insert(_el$3, createComponent(For, {
				get each() {
					return filtered();
				},
				children: (it, i) => (() => {
					var _el$7 = _tmpl$4(), _el$8 = _el$7.firstChild, _el$9 = _el$8.firstChild;
					_el$8.$$click = () => setPos(i());
					createRenderEffect((_p$) => {
						var _v$ = !!(i() === pos()), _v$2 = i() === pos() ? "true" : void 0, _v$3 = it.thumbUrl, _v$4 = it.caption;
						_v$ !== _p$.e && _el$8.classList.toggle("active", _p$.e = _v$);
						_v$2 !== _p$.t && setAttribute(_el$8, "aria-current", _p$.t = _v$2);
						_v$3 !== _p$.a && setAttribute(_el$9, "src", _p$.a = _v$3);
						_v$4 !== _p$.o && setAttribute(_el$9, "alt", _p$.o = _v$4);
						return _p$;
					}, {
						e: void 0,
						t: void 0,
						a: void 0,
						o: void 0
					});
					return _el$7;
				})()
			}));
			_el$4.addEventListener("mouseleave", () => setOverImage(false));
			_el$4.addEventListener("mouseenter", () => setOverImage(true));
			addEventListener(_el$4, "click", mobile ? void 0 : next, true);
			insert(_el$4, createComponent(Show, {
				get when() {
					return current();
				},
				keyed: true,
				children: (it) => (() => {
					var _el$0 = _tmpl$6(), _el$1 = _el$0.firstChild;
					insert(_el$0, createComponent(Show, {
						get when() {
							return it.caption !== "";
						},
						get children() {
							var _el$10 = _tmpl$5();
							insert(_el$10, () => it.caption);
							return _el$10;
						}
					}), null);
					createRenderEffect((_p$) => {
						var _v$5 = it.hiUrl, _v$6 = it.hiW, _v$7 = it.hiH, _v$8 = it.caption;
						_v$5 !== _p$.e && setAttribute(_el$1, "src", _p$.e = _v$5);
						_v$6 !== _p$.t && setAttribute(_el$1, "width", _p$.t = _v$6);
						_v$7 !== _p$.a && setAttribute(_el$1, "height", _p$.a = _v$7);
						_v$8 !== _p$.o && setAttribute(_el$1, "alt", _p$.o = _v$8);
						return _p$;
					}, {
						e: void 0,
						t: void 0,
						a: void 0,
						o: void 0
					});
					return _el$0;
				})()
			}), null);
			insert(_el$4, createComponent(Show, {
				when: mobile,
				get children() {
					return [(() => {
						var _el$5 = _tmpl$();
						_el$5.$$click = (e) => {
							e.stopPropagation();
							prev();
						};
						createRenderEffect(() => setAttribute(_el$5, "aria-label", props.prevText));
						return _el$5;
					})(), (() => {
						var _el$6 = _tmpl$2();
						_el$6.$$click = (e) => {
							e.stopPropagation();
							next();
						};
						createRenderEffect(() => setAttribute(_el$6, "aria-label", props.nextText));
						return _el$6;
					})()];
				}
			}), null);
			return _el$;
		}
	}), createComponent(Show, {
		when: !mobile,
		get children() {
			return createComponent(CustomCursor, {
				active: () => open() && overImage(),
				cursorText: () => props.nextText
			});
		}
	})];
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
