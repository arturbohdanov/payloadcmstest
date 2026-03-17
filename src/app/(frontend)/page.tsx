import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import Link from 'next/link'

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const sitesRes = await payload.find({ collection: 'sites', limit: 100 })
  const homeSettingsRes = await payload.find({ collection: 'homepage-settings', limit: 100, depth: 2 })
  const allSettingsRes = await payload.find({ collection: 'site-promotions-settings', limit: 100, depth: 2 })
  const promosRes = await payload.find({ collection: 'promotions', limit: 200, depth: 0 })

  const allPromos = promosRes.docs

  const siteGroups = sitesRes.docs.map((site: any) => {
    const homeSetting = homeSettingsRes.docs.find((hs: any) => {
      const id = typeof hs.site === 'object' ? hs.site?.id : hs.site
      return String(id) === String(site.id)
    })
    const allSetting = allSettingsRes.docs.find((as: any) => {
      const id = typeof as.site === 'object' ? as.site?.id : as.site
      return String(id) === String(site.id)
    })
    const homePromos = (homeSetting?.homepagePromotions || []).map(
      (p: any) => typeof p === 'object' ? p.name : `ID: ${p}`
    )
    const allPromosList = (allSetting?.allPromotions || []).map(
      (p: any) => typeof p === 'object' ? p.name : `ID: ${p}`
    )
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const siteUrl = site.url ? `${protocol}://${site.url}.localhost:3000` : null
    return { id: site.id, name: site.name, siteUrl, homePromos, allPromos: allPromosList }
  })

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: #f5f4f0; color: #1c1c1a; font-family: 'Inter', sans-serif; min-height: 100vh; font-size: 16px; }
    a { text-decoration: none; color: inherit; }
    ::selection { background: rgba(0,0,0,0.1); }
  `

  const label: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#888',
    marginBottom: '10px',
    display: 'block',
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem 5rem' }}>

        {/* ── Nav ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1c1c1a', letterSpacing: '0.05em' }}>HOTELS</span>
          <Link href="/admin" style={{ fontSize: '12px', color: '#888', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>
            Admin →
          </Link>
        </div>

        {/* ── Hero ── */}
        <div style={{ marginBottom: '3rem', borderBottom: '1px solid #1e1e1e', paddingBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 300, lineHeight: 1.15, color: '#1c1c1a', letterSpacing: '-0.02em' }}>
            Promotions<br />
            <span style={{ color: '#aaa' }}>Overview</span>
          </h1>
          <p style={{ fontSize: '13px', color: '#888', marginTop: '0.75rem', letterSpacing: '0.04em' }}>
            {sitesRes.totalDocs} hotels · {allPromos.length} promotions
          </p>
        </div>

        {siteGroups.length === 0 ? (
          <div style={{ padding: '2.5rem', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center', color: '#888' }}>
            <p style={{ fontSize: '15px', marginBottom: '0.75rem' }}>No hotels yet.</p>
            <Link href="/admin/collections/sites/create" style={{ fontSize: '13px', color: '#555', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Create first →</Link>
          </div>
        ) : (
          <>
            {/* ── Sites ── */}
            <div style={{ marginBottom: '2.5rem' }}>
              <span style={label}>Sites</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {siteGroups.map((g: any) => (
                  <a key={g.id} href={g.siteUrl || '#'} style={{
                    padding: '6px 14px',
                    border: '1px solid #d0cdc7',
                    borderRadius: '2px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#444',
                    letterSpacing: '0.03em',
                    transition: 'border-color 0.15s, color 0.15s',
                  }}>
                    {g.name} ↗
                  </a>
                ))}
              </div>
            </div>

            <div style={{ height: '1px', background: '#ddd', marginBottom: '2.5rem' }} />

            {/* ── Per-hotel summary ── */}
            <div style={{ marginBottom: '2.5rem' }}>
              <span style={label}>Order by Hotel</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {siteGroups.map((group: any, idx: number) => (
                  <div key={group.id} style={{ borderBottom: '1px solid #e0ddd8', padding: '1.25rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '15px', fontWeight: 600, color: '#1c1c1a', letterSpacing: '0.01em' }}>{group.name}</span>
                      {group.siteUrl && (
                        <a href={group.siteUrl} style={{ fontSize: '12px', color: '#aaa', letterSpacing: '0.04em' }}>↗</a>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', paddingLeft: '0.75rem', borderLeft: '2px solid #e0ddd8' }}>
                      {/* Homepage */}
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999', marginBottom: '0.5rem' }}>Homepage</p>
                        {group.homePromos.length === 0 ? (
                          <p style={{ fontSize: '13px', color: '#bbb' }}>—</p>
                        ) : group.homePromos.map((name: string, i: number) => (
                          <div key={i} style={{ fontSize: '14px', color: '#444', lineHeight: '1.9', display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                            <span style={{ fontSize: '11px', color: '#bbb', minWidth: '16px' }}>{i + 1}</span>
                            <span>{name}</span>
                          </div>
                        ))}
                      </div>
                      {/* Section */}
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999', marginBottom: '0.5rem' }}>Section</p>
                        {group.allPromos.length === 0 ? (
                          <p style={{ fontSize: '13px', color: '#bbb' }}>—</p>
                        ) : group.allPromos.map((name: string, i: number) => (
                          <div key={i} style={{ fontSize: '14px', color: '#444', lineHeight: '1.9', display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                            <span style={{ fontSize: '11px', color: '#bbb', minWidth: '16px' }}>{i + 1}</span>
                            <span>{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Matrix ── */}
            {allPromos.length > 0 && (
              <>
                <div style={{ height: '1px', background: '#ddd', marginBottom: '2.5rem' }} />
                <div>
                  <span style={label}>Matrix</span>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ borderCollapse: 'collapse', fontSize: '13px', width: '100%', minWidth: '360px' }}>
                      <thead>
                        <tr>
                          <th rowSpan={2} style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 500, color: '#888', borderBottom: '1px solid #ddd', borderRight: '1px solid #e0ddd8', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                            Promotion
                          </th>
                          {siteGroups.map((g: any) => (
                            <th key={g.id} colSpan={2} style={{ textAlign: 'center', padding: '8px 6px', fontWeight: 600, color: '#555', borderBottom: '1px solid #e0ddd8', borderLeft: '1px solid #e0ddd8', letterSpacing: '0.04em' }}>
                              {g.name}
                            </th>
                          ))}
                        </tr>
                        <tr>
                          {siteGroups.map((g: any) => (
                            <React.Fragment key={g.id}>
                              <th style={{ textAlign: 'center', padding: '5px 6px', fontSize: '11px', fontWeight: 500, color: '#aaa', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid #ddd', borderLeft: '1px solid #e0ddd8' }}>Гл</th>
                              <th style={{ textAlign: 'center', padding: '5px 6px', fontSize: '11px', fontWeight: 500, color: '#aaa', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid #ddd', borderLeft: '1px dashed #e0ddd8' }}>Рзд</th>
                            </React.Fragment>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {allPromos.map((promo: any, rowIdx: number) => (
                          <tr key={promo.id} style={{ borderBottom: '1px solid #ebe9e4', background: rowIdx % 2 === 0 ? 'transparent' : '#efede8' }}>
                            <td style={{ padding: '9px 12px', color: '#555', fontWeight: 500, borderRight: '1px solid #e0ddd8', whiteSpace: 'nowrap' }}>
                              {promo.name}
                            </td>
                            {siteGroups.map((g: any) => {
                              const inHome = g.homePromos.includes(promo.name)
                              const inAll = g.allPromos.includes(promo.name)
                              return (
                                <React.Fragment key={g.id}>
                                  <td style={{ textAlign: 'center', padding: '9px 6px', borderLeft: '1px solid #e0ddd8', color: inHome ? '#1a7f4b' : '#ccc', fontWeight: inHome ? 700 : 400, fontSize: '15px' }}>
                                    {inHome ? '+' : '−'}
                                  </td>
                                  <td style={{ textAlign: 'center', padding: '9px 6px', borderLeft: '1px dashed #e0ddd8', color: inAll ? '#1a7f4b' : '#ccc', fontWeight: inAll ? 700 : 400, fontSize: '15px' }}>
                                    {inAll ? '+' : '−'}
                                  </td>
                                </React.Fragment>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}
