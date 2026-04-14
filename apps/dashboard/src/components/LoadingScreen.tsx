import { LoadingSpinner } from '@micro/ui'

export function LoadingScreen() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}
