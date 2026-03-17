import React from 'react'
import Link from 'next/link'

export default async function SiteNav() {
  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

  const sitesRes = await fetch(`${serverURL}/api/sites?limit=100`, { cache: 'no-store' })
  const sitesData = await sitesRes.json()
  
  const homeSettingsRes = await fetch(`${serverURL}/api/homepage-settings?limit=100`, { cache: 'no-store' })
  const homeSettingsData = await homeSettingsRes.json()
  
  const allSettingsRes = await fetch(`${serverURL}/api/site-promotions-settings?limit=100`, { cache: 'no-store' })
  const allSettingsData = await allSettingsRes.json()

  const siteGroups = sitesData?.docs?.map((site: any) => {
    const homeSetting = homeSettingsData?.docs?.find((hs: any) => {
      const hsSiteId = typeof hs.site === 'object' ? hs.site?.id : hs.site
      return String(hsSiteId) === String(site.id)
    })
    const allSetting = allSettingsData?.docs?.find((as: any) => {
      const asSiteId = typeof as.site === 'object' ? as.site?.id : as.site
      return String(asSiteId) === String(site.id)
    })
    return {
      id: site.id,
      name: site.name,
      homeSettingsId: homeSetting?.id,
      allSettingsId: allSetting?.id,
    }
  }) || []

  if (siteGroups.length === 0) return null

  return (
    <div style={{ padding: '0 0.5rem', marginBottom: '2rem' }}>
      <hr style={{ borderTop: '1px solid var(--theme-elevation-150)', margin: '1rem 0' }} />
      <span 
        className="nav__label" 
        style={{ padding: '0 0.5rem', color: 'var(--theme-elevation-800)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
      >
        Сайты
      </span>

      <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0' }}>
        {siteGroups.map((group: any) => (
          <li key={group.id} style={{ marginBottom: '0.5rem' }}>
            <details open style={{ cursor: 'pointer' }}>
              <summary style={{ 
                padding: '0.5rem', 
                fontWeight: 600, 
                display: 'flex', 
                alignItems: 'center',
                gap: '0.5rem',
                borderRadius: '4px',
                color: 'var(--theme-elevation-800)',
                userSelect: 'none'
              }}>
                Отель {group.name}
              </summary>
              
              <ul style={{ 
                listStyle: 'none', 
                padding: '0',
                margin: '0.25rem 0 0 1rem',
                borderLeft: '1px solid var(--theme-elevation-150)' 
              }}>
                <li>
                  <Link 
                    href={`/admin/collections/sites/${group.id}`}
                    style={{ display: 'block', padding: '0.4rem 1rem', fontSize: '14px', textDecoration: 'none', color: 'var(--theme-elevation-500)' }}
                  >
                    Настройки отеля
                  </Link>
                </li>
                {group.homeSettingsId && (
                  <li>
                    <Link 
                      href={`/admin/collections/homepage-settings/${group.homeSettingsId}`}
                      style={{ display: 'block', padding: '0.4rem 1rem', fontSize: '14px', textDecoration: 'none', color: 'var(--theme-elevation-500)' }}
                    >
                      Акции на главной
                    </Link>
                  </li>
                )}
                {group.allSettingsId && (
                  <li>
                    <Link 
                      href={`/admin/collections/site-promotions-settings/${group.allSettingsId}`}
                      style={{ display: 'block', padding: '0.4rem 1rem', fontSize: '14px', textDecoration: 'none', color: 'var(--theme-elevation-500)' }}
                    >
                      Акции (Раздел)
                    </Link>
                  </li>
                )}
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </div>
  )
}
