import {
  Match,
  Show,
  Switch,
  createEffect,
  createResource,
  createSignal,
  lazy,
  type JSX
} from 'solid-js'
import { render } from 'solid-js/web'

import { getImageJSON } from './resources'
import { StateProvider } from './state'
import { lmchabotLayout } from './lmchabotLayout'

import '../scss/style.scss'

/**
 * interfaces
 */

export interface Container extends HTMLDivElement {
  dataset: {
    next: string
    close: string
    prev: string
    loading: string
  }
}

// container
const container = document.getElementsByClassName('container')[0] as Container

// lazy components
const Desktop = lazy(async () => await import('./desktop/layout'))
const Mobile = lazy(async () => await import('./mobile/layout'))

function Main(): JSX.Element {
  // variables
  const [ijs] = createResource(getImageJSON)
  const isMobile =
    window.matchMedia('(hover: none)').matches &&
    !window.navigator.userAgent.includes('Win')

  // states
  const [scrollable, setScollable] = createSignal(true)

  createEffect(() => {
    if (scrollable()) {
      container.classList.remove('disableScroll')
    } else {
      container.classList.add('disableScroll')
    }
  })

  return (
    <>
      <Show when={ijs.state === 'ready'}>
        <StateProvider length={ijs()?.length ?? 0}>
          <Switch fallback={<div>Error</div>}>
            <Match when={isMobile}>
              <Mobile
                ijs={ijs() ?? []}
                closeText={container.dataset.close}
                loadingText={container.dataset.loading}
                setScrollable={setScollable}
              />
            </Match>
            <Match when={!isMobile}>
              <Desktop
                ijs={ijs() ?? []}
                prevText={container.dataset.prev}
                closeText={container.dataset.close}
                nextText={container.dataset.next}
                loadingText={container.dataset.loading}
              />
            </Match>
          </Switch>
        </StateProvider>
      </Show>
    </>
  )
}

render(() => <Main />, container)

// Initialize LM Chabot layout system for collections pages
// Check if we're on a collections page by looking for c-projects elements
const checkAndInitializeLMChabot = (): void => {
  const projectsContainer = document.querySelector('.c-projects')
  if (projectsContainer) {
    console.log('Collections page detected, initializing LM Chabot layout')
    lmchabotLayout.initialize()
  }
}

// Run after a brief delay to ensure DOM is ready
setTimeout(checkAndInitializeLMChabot, 100)

// Also check on DOM content loaded as backup
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndInitializeLMChabot)
} else {
  checkAndInitializeLMChabot()
}
