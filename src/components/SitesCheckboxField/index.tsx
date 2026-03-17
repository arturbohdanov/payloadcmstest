'use client'

import React, { useState, useEffect } from 'react'
import { useField } from '@payloadcms/ui'

export default function SitesCheckboxField({ path }: { path: string }) {
  const { value, setValue } = useField<number[]>({ path })
  
  const [sites, setSites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Ensure value is always an array of numbers
  const currentValues = Array.isArray(value) ? value.map(Number) : []

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

  const handleCheckboxChange = (siteId: number, checked: boolean) => {
    let newValues: number[] = []
    
    if (checked) {
      if (!currentValues.includes(siteId)) {
        newValues = [...currentValues, siteId]
      } else {
        newValues = currentValues
      }
    } else {
      newValues = currentValues.filter((v: number) => v !== siteId)
    }
    
    setValue(newValues)
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
        Отели <span style={{ color: 'var(--theme-error-400)' }}>*</span>
      </label>
      
      <p style={{ fontSize: '13px', color: 'var(--theme-elevation-400)', marginBottom: '1rem', marginTop: 0 }}>
        Выберите отели, на которых будет отображаться эта акция
      </p>

      {sites.length === 0 ? (
        <div style={{ color: 'var(--theme-elevation-500)', fontSize: '13px' }}>
          Отели не найдены. Сначала создайте отель в меню слева.
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.75rem',
          background: 'var(--theme-elevation-50)',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: '4px',
          padding: '1rem'
        }}>
          {sites.map((site) => {
            const isChecked = currentValues.some(v => String(v) === String(site.id))
            
            return (
              <label 
                key={site.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  fontSize: '14px',
                  color: 'var(--theme-elevation-800)',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleCheckboxChange(Number(site.id), e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                    accentColor: 'var(--theme-success-400)' // Colors to somewhat match Payload
                  }}
                />
                <span style={{ fontWeight: isChecked ? 600 : 400 }}>
                  Отель {site.name}
                </span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
