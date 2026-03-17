import type { CollectionConfig } from 'payload'

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      label: 'Название акции',
      type: 'text',
      required: true,
    },
    {
      name: 'sites',
      label: 'Показывать в разделе',
      type: 'relationship',
      relationTo: 'sites',
      hasMany: true,
      required: true,
      admin: {
        description: 'Отметьте отели, где должна быть доступна эта акция, и при необходимости закрепите ее на главной.',
        components: {
          Field: '@/components/CombinedSitesCheckboxField',
        }
      },
      maxDepth: 1,
    },
    {
      name: 'showOnHomepageSites',
      label: 'Показывать на главной',
      type: 'relationship',
      relationTo: 'sites',
      hasMany: true,
      admin: {
        hidden: true,
      },
      maxDepth: 1,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-check "All sites" if "Homepage" is checked for a given site
        const sites = Array.isArray(data.sites) ? [...data.sites] : []
        const homepageSites = Array.isArray(data.showOnHomepageSites) ? data.showOnHomepageSites : []
        
        for (const homepageSiteId of homepageSites) {
          if (!sites.includes(homepageSiteId)) {
            sites.push(homepageSiteId)
          }
        }
        
        data.sites = sites
        return data
      }
    ],
    afterChange: [
      async ({ doc, previousDoc, req, operation }) => {
        if (req.context?.skipSync) return doc

        const payload = req.payload
        
        // ---- 1. Sync 'sites' with SitePromotionsSettings
        const currentSites = (doc.sites || []) as any[]
        const prevSites = (previousDoc?.sites || []) as any[]
        const currentSiteIds = currentSites.map((s) => (typeof s === 'object' && s !== null ? s.id : s))
        const prevSiteIds = prevSites.map((s) => (typeof s === 'object' && s !== null ? s.id : s))

        const addedSites = currentSiteIds.filter((id) => !prevSiteIds.includes(id))
        const removedSites = prevSiteIds.filter((id) => !currentSiteIds.includes(id))
        
        // Loop Added 
        for (const siteId of addedSites) {
          try {
            const settingsQuery = await payload.find({
              collection: 'site-promotions-settings',
              where: { site: { equals: siteId } },
              limit: 1, req, context: { skipSync: true },
            })
            if (settingsQuery.docs[0]) {
              const settings = settingsQuery.docs[0]
              const currentPromos = (settings.allPromotions || []) as any[]
              const promoIds = currentPromos.map((p) => (typeof p === 'object' && p !== null ? p.id : p))
              if (!promoIds.includes(doc.id)) {
                await payload.update({
                  collection: 'site-promotions-settings', id: settings.id,
                  data: { allPromotions: [...promoIds, doc.id] }, req, context: { skipSync: true },
                })
              }
            } else {
              await payload.create({
                 collection: 'site-promotions-settings',
                 data: { site: siteId, allPromotions: [doc.id] }, req, context: { skipSync: true }
              })
            }
          } catch (e) {}
        }
        
        // Loop Removed
        for (const siteId of removedSites) {
          try {
            const settingsQuery = await payload.find({
              collection: 'site-promotions-settings',
              where: { site: { equals: siteId } },
              limit: 1, req, context: { skipSync: true },
            })
            if (settingsQuery.docs[0]) {
              const settings = settingsQuery.docs[0]
              const currentPromos = (settings.allPromotions || []) as any[]
              const promoIds = currentPromos.map((p) => (typeof p === 'object' && p !== null ? p.id : p))
              if (promoIds.includes(doc.id)) {
                await payload.update({
                  collection: 'site-promotions-settings', id: settings.id,
                  data: { allPromotions: promoIds.filter((id) => id !== doc.id) }, req, context: { skipSync: true },
                })
              }
            }
          } catch (e) {}
        }
        
        // ---- 2. Sync 'showOnHomepageSites' with HomepageSettings
        const currentHomeSites = (doc.showOnHomepageSites || []) as any[]
        const prevHomeSites = (previousDoc?.showOnHomepageSites || []) as any[]
        const currentHomeSiteIds = currentHomeSites.map((s) => (typeof s === 'object' && s !== null ? s.id : s))
        const prevHomeSiteIds = prevHomeSites.map((s) => (typeof s === 'object' && s !== null ? s.id : s))

        const addedHomeSites = currentHomeSiteIds.filter((id) => !prevHomeSiteIds.includes(id))
        const removedHomeSites = prevHomeSiteIds.filter((id) => !currentHomeSiteIds.includes(id))
        
        for (const siteId of addedHomeSites) {
          try {
            const settingsQuery = await payload.find({
              collection: 'homepage-settings',
              where: { site: { equals: siteId } },
              limit: 1, req, context: { skipSync: true },
            })
            if (settingsQuery.docs[0]) {
              const settings = settingsQuery.docs[0]
              const currentPromos = (settings.homepagePromotions || []) as any[]
              const promoIds = currentPromos.map((p) => (typeof p === 'object' && p !== null ? p.id : p))
              if (!promoIds.includes(doc.id)) {
                await payload.update({
                  collection: 'homepage-settings', id: settings.id,
                  data: { homepagePromotions: [...promoIds, doc.id] }, req, context: { skipSync: true },
                })
              }
            } else {
              await payload.create({
                 collection: 'homepage-settings',
                 data: { site: siteId, homepagePromotions: [doc.id] }, req, context: { skipSync: true }
              })
            }
          } catch (e) {}
        }

        for (const siteId of removedHomeSites) {
          try {
            const settingsQuery = await payload.find({
              collection: 'homepage-settings',
              where: { site: { equals: siteId } },
              limit: 1, req, context: { skipSync: true },
            })
            if (settingsQuery.docs[0]) {
              const settings = settingsQuery.docs[0]
              const currentPromos = (settings.homepagePromotions || []) as any[]
              const promoIds = currentPromos.map((p) => (typeof p === 'object' && p !== null ? p.id : p))
              if (promoIds.includes(doc.id)) {
                await payload.update({
                  collection: 'homepage-settings', id: settings.id,
                  data: { homepagePromotions: promoIds.filter((id) => id !== doc.id) }, req, context: { skipSync: true },
                })
              }
            }
          } catch (e) {}
        }

        return doc
      },
    ],
    afterDelete: [
      async ({ id, doc, req }) => {
        if (req.context?.skipSync) return
        const payload = req.payload
        
        const siteIds = (doc.sites || []).map((s: any) => (typeof s === 'object' && s !== null ? s.id : s))
        for (const siteId of siteIds) {
          try {
            const settingsQuery = await payload.find({
              collection: 'site-promotions-settings',
              where: { site: { equals: siteId } }, limit: 1, req, context: { skipSync: true },
            })
            if (settingsQuery.docs[0]) {
              const settings = settingsQuery.docs[0]
              const promoIds = (settings.allPromotions || []).map((p: any) => (typeof p === 'object' ? p.id : p))
              await payload.update({
                collection: 'site-promotions-settings', id: settings.id,
                data: { allPromotions: promoIds.filter((iterId: any) => iterId !== id) }, req, context: { skipSync: true },
              })
            }
          } catch (e) {}
        }
        
        const homeSiteIds = (doc.showOnHomepageSites || []).map((s: any) => (typeof s === 'object' && s !== null ? s.id : s))
        for (const siteId of homeSiteIds) {
          try {
            const settingsQuery = await payload.find({
              collection: 'homepage-settings',
              where: { site: { equals: siteId } }, limit: 1, req, context: { skipSync: true },
            })
            if (settingsQuery.docs[0]) {
              const settings = settingsQuery.docs[0]
              const promoIds = (settings.homepagePromotions || []).map((p: any) => (typeof p === 'object' ? p.id : p))
              await payload.update({
                collection: 'homepage-settings', id: settings.id,
                data: { homepagePromotions: promoIds.filter((iterId: any) => iterId !== id) }, req, context: { skipSync: true },
              })
            }
          } catch (e) {}
        }
      }
    ]
  },
}

