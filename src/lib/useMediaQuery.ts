import { useSyncExternalStore } from 'react'

/** `true` tant que la media query correspond (mise à jour au redimensionnement). */
export function useMediaQuery(requete: string): boolean {
  return useSyncExternalStore(
    (rappel) => {
      const mq = window.matchMedia(requete)
      mq.addEventListener('change', rappel)
      return () => mq.removeEventListener('change', rappel)
    },
    () => window.matchMedia(requete).matches,
    () => false,
  )
}
