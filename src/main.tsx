import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'

// MoOS is the default experience. The original single-page portfolio stays
// available at ?view=classic. Each view imports its own stylesheet, so only
// one set of styles is ever loaded.
const isClassic = new URLSearchParams(window.location.search).get('view') === 'classic'

let App = lazy(() => import('./os/MoOS.tsx'))
if (isClassic) App = lazy(() => import('./classic/ClassicApp.tsx'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <App />
    </Suspense>
  </StrictMode>,
)
