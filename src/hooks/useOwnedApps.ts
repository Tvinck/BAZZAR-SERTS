import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/* ═══════════════════════════════════════════════════════════
   useOwnedApps — какие приложения уже куплены/установлены этим
   устройством (по UDID). Нужен, чтобы карточки показывали
   «Установить», а не «Купить», для уже приобретённых приложений.

   Запрос кэшируется на уровне модуля: сколько бы карточек ни
   рендерилось в каталоге, сеть дёргается один раз за сессию
   (на один UDID). markOwned позволяет оптимистично добавить id
   после успешной покупки без перезагрузки.
   ═══════════════════════════════════════════════════════════ */

let cachedUdid: string | null = null
let cachedPromise: Promise<Set<string>> | null = null
let cachedSet = new Set<string>()

function loadOwned(udid: string): Promise<Set<string>> {
  if (cachedPromise && cachedUdid === udid) return cachedPromise
  cachedUdid = udid
  cachedPromise = Promise.resolve(
    supabase
      .from('user_app_purchases')
      .select('app_id')
      .eq('udid', udid)
      .in('status', ['paid', 'free'])
      .then(({ data }) => {
        cachedSet = new Set((data ?? []).map((r: { app_id: string }) => r.app_id))
        return cachedSet
      })
  )
  return cachedPromise
}

export function useOwnedApps() {
  const udid = typeof window !== 'undefined' ? localStorage.getItem('apple_udid') : null
  const [owned, setOwned] = useState<Set<string>>(cachedSet)

  useEffect(() => {
    let alive = true
    if (!udid) return
    loadOwned(udid).then((s) => { if (alive) setOwned(new Set(s)) })
    return () => { alive = false }
  }, [udid])

  const markOwned = (appId: string) => {
    cachedSet.add(appId)
    setOwned(new Set(cachedSet))
  }

  return { owned, markOwned, udid }
}
