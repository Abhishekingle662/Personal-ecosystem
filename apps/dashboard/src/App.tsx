import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@micro/ui'

import { Shell } from './components/Shell'
import { LoadingScreen } from './components/LoadingScreen'

// Lazy-loaded app routes
const Home = lazy(() => import('./routes/Home'))
const Settings = lazy(() => import('./routes/Settings'))
const JobTracker = lazy(() => import('../../job-tracker/src/JobTrackerApp'))
const EmailComposer = lazy(() => import('../../email-composer/src/EmailComposerApp'))
const LinkedInGen = lazy(() => import('../../linkedin-gen/src/LinkedInGenApp'))
const Journal = lazy(() => import('../../journal/src/JournalApp'))
const Habits = lazy(() => import('../../habits/src/HabitsApp'))
const Snippets = lazy(() => import('../../snippets/src/SnippetsApp'))

export function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs/*" element={<JobTracker />} />
            <Route path="/email/*" element={<EmailComposer />} />
            <Route path="/linkedin/*" element={<LinkedInGen />} />
            <Route path="/journal/*" element={<Journal />} />
            <Route path="/habits/*" element={<Habits />} />
            <Route path="/snippets/*" element={<Snippets />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </Shell>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          },
        }}
      />
    </BrowserRouter>
  )
}
