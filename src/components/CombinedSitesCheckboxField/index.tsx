'use client'

import React, { useState, useEffect } from 'react'
import { useField } from '@payloadcms/ui'

export default function CombinedSitesCheckboxField() {
  const { value: sitesValue, setValue: setSitesValue } = useField<number[]>({ path: 'sites' })
  const { value: homeValue, setValue: setHomeValue } = useField<number[]>({ path: 'showOnHomepageSites' })
  
  const [sites, setSites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Ensure arrays
  const currentSites = Array.isArray(sitesValue) ? sitesValue.map(Number) : []
  const currentHome = Array.isArray(homeValue) ? homeValue.map(Number) : []

  // Fetch ALL sites to show as available options
  useEffect(() => {
    const fetchSites = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/sites?limit=1000`)
        const data = await res.json()
        
        if (data && data.docs) {
          setSites(data.docs)
        }
      } catch (err) {
        console.error('Failed to fetch sites for checkboxes:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSites()
  }, [])

  const handleSiteChange = (siteId: number, checked: boolean) => {
    let newSites = [...currentSites]
    let newHome = [...currentHome]

    if (checked) {
      if (!newSites.includes(siteId)) newSites.push(siteId)
    } else {
      newSites = newSites.filter(id => id !== siteId)
      // Automatically uncheck "homepage" if "site" is unchecked
      newHome = newHome.filter(id => id !== siteId)
    }

    setSitesValue(newSites)
    setHomeValue(newHome)
  }

  const handleHomeChange = (siteId: number, checked: boolean) => {
    let newSites = [...currentSites]
    let newHome = [...currentHome]

    if (checked) {
      if (!newHome.includes(siteId)) newHome.push(siteId)
      // Automatically check "site" if "homepage" is checked
      if (!newSites.includes(siteId)) newSites.push(siteId) 
    } else {
      newHome = newHome.filter(id => id !== siteId)
    }

    setSitesValue(newSites)
    setHomeValue(newHome)
  }

  if (loading) {
    return <div style={{ padding: '1rem 0', color: 'var(--theme-elevation-500)', fontSize: '13px' }}>Загрузка отелей...</div>
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <label style={{ 
        display: 'block', 
        marginBottom: '0.75rem', 
        fontWeight: 600, 
        color: 'var(--theme-elevation-800)',
        fontSize: '13px'
      }}>
        Настройки публикации в отелях <span style={{ color: 'var(--theme-error-400)' }}>*</span>
      </label>
      
      <p style={{ fontSize: '13px', color: 'var(--theme-elevation-400)', marginBottom: '1rem', marginTop: 0 }}>
        Выберите отели, где должна выводиться акция. Показывать на главной можно, только если акция доступна в разделе этого отеля.
      </p>

      {sites.length === 0 ? (
        <div style={{ color: 'var(--theme-elevation-500)', fontSize: '13px' }}>
          Отели не найдены. Сначала создайте отель в меню слева.
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            background: 'var(--theme-elevation-50)', 
            borderBottom: '1px solid var(--theme-elevation-150)',
            padding: '0.75rem 1rem' 
          }}>
            <div style={{ flex: 1, fontSize: '12px', fontWeight: 600, color: 'var(--theme-elevation-500)', textTransform: 'uppercase' }}>Название отеля</div>
            <div style={{ width: '160px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--theme-elevation-500)', textTransform: 'uppercase' }}>В разделе</div>
            <div style={{ width: '160px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--theme-elevation-500)', textTransform: 'uppercase' }}>На главной</div>
          </div>
          
          {/* Body */}
          <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--theme-bg)' }}>
            {sites.map((site, index) => {
              const siteId = Number(site.id)
              const isSiteChecked = currentSites.includes(siteId)
              const isHomeChecked = currentHome.includes(siteId)
              const isLast = index === sites.length - 1
              
              return (
                <label 
                  key={site.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0.75rem 1rem',
                    borderBottom: isLast ? 'none' : '1px solid var(--theme-elevation-100)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--theme-elevation-50)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ flex: 1, fontWeight: isSiteChecked ? 600 : 400, color: 'var(--theme-elevation-800)', fontSize: '14px' }}>
                    Отель {site.name}
                  </div>
                  
                  <div style={{ width: '160px', display: 'flex', justifyContent: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isSiteChecked}
                      onChange={(e) => handleSiteChange(siteId, e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        accentColor: 'var(--theme-success-400)'
                      }}
                    />
                  </div>
                  
                  <div style={{ width: '160px', display: 'flex', justifyContent: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isHomeChecked}
                      disabled={!isSiteChecked}
                      onChange={(e) => handleHomeChange(siteId, e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: isSiteChecked ? 'pointer' : 'not-allowed',
                        opacity: isSiteChecked ? 1 : 0.4,
                        accentColor: 'var(--theme-success-400)'
                      }}
                    />
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
