import { A as createComponent, i as ImageStateProvider, n as useMobileState, t as MobileStateProvider, v as render, z as onMount } from "./main.js";
import { t as Gallery } from "./D4UST3.js";
//#region assets/ts/mobileStage.tsx
function Bridge(props) {
	const [, { setIndex, setIsOpen }] = useMobileState();
	onMount(() => props.onReady((index) => {
		setIndex(index);
		setIsOpen(true);
	}));
	return createComponent(Gallery, {
		get closeText() {
			return props.closeText;
		},
		get loadingText() {
			return props.loadingText;
		},
		get swipe() {
			return props.swipe;
		},
		get counter() {
			return props.counter;
		}
	});
}
/**
* Reuse the scatter gallery's mobile focus view (the slide-up swiper curtain)
* as a standalone lightbox for the post and grid archetypes. Builds its own
* provider tree so it stays independent of the page's other islands; `images`
* must be ordered so each entry's `index` equals its position (the swiper
* realIndex the gallery tracks).
*/
function mountMobileStage(images, closeText, loadingText, options = {}) {
	const root = document.createElement("div");
	root.className = "mobileStageRoot";
	document.body.appendChild(root);
	let open = () => {};
	const dispose = render(() => createComponent(ImageStateProvider, {
		images,
		get children() {
			return createComponent(MobileStateProvider, { get children() {
				return createComponent(Bridge, {
					onReady: (fn) => open = fn,
					closeText,
					loadingText,
					get swipe() {
						return options.swipe;
					},
					get counter() {
						return options.counter;
					}
				});
			} });
		}
	}), root);
	return {
		open: (index) => open(index),
		dispose: () => {
			dispose();
			root.remove();
		}
	};
}
//#endregion
export { mountMobileStage as t };
