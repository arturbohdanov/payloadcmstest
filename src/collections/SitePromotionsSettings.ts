import type { CollectionConfig } from 'payload'

export const SitePromotionsSettings: CollectionConfig = {
  slug: 'site-promotions-settings',
  admin: {
    useAsTitle: 'id',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [({ data }) => `Акции в разделе (${data?.site})`]
      }
    },
    {
      name: 'site',
      type: 'relationship',
      relationTo: 'sites',
      required: true,
      unique: true,
      label: 'Отель',
    },
    {
      name: 'allPromotions',
      label: 'Акции (Раздел)',
      type: 'relationship',
      relationTo: 'promotions',
      hasMany: true,
      admin: {
        components: {
          Field: '@/components/PromotionsListField',
        }
      },
      maxDepth: 1,
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req, operation }) => {
        if (req.context?.skipSync) return doc

        const payload = req.payload
        const currentPromos = (doc.allPromotions || []) as any[]
        const prevPromos = (previousDoc?.allPromotions || []) as any[]

        const currentPromoIds = currentPromos.map((p) => (typeof p === 'object' && p !== null ? p.id : p))
        const prevPromoIds = prevPromos.map((p) => (typeof p === 'object' && p !== null ? p.id : p))

        const addedPromos = currentPromoIds.filter((id) => !prevPromoIds.includes(id))
        const removedPromos = prevPromoIds.filter((id) => !currentPromoIds.includes(id))

        if (addedPromos.length === 0 && removedPromos.length === 0) return doc;

        const siteId = typeof doc.site === 'object' && doc.site !== null ? doc.site.id : doc.site

        for (const promoId of addedPromos) {
          try {
            const promo = await payload.findByID({
              collection: 'promotions',
              id: promoId,
              req,
              context: { skipSync: true },
            })
            const currentSites = (promo.sites || []) as any[]
            const siteIds = currentSites.map((s) => (typeof s === 'object' && s !== null ? s.id : s))
            
            if (!siteIds.includes(siteId)) {
              await payload.update({
                collection: 'promotions',
                id: promoId,
                data: { sites: [...siteIds, siteId] },
                req,
                context: { skipSync: true },
              })
            }
          } catch (e) {}
        }

        for (const promoId of removedPromos) {
          try {
            const promo = await payload.findByID({
              collection: 'promotions',
              id: promoId,
              req,
              context: { skipSync: true },
            })
            const currentSites = (promo.sites || []) as any[]
            const siteIds = currentSites.map((s) => (typeof s === 'object' && s !== null ? s.id : s))
            
            if (siteIds.includes(siteId)) {
              await payload.update({
                collection: 'promotions',
                id: promoId,
                data: { sites: siteIds.filter((id) => id !== siteId) },
                req,
                context: { skipSync: true },
              })
            }
          } catch (e) {}
        }

        return doc
      },
    ],
  },
}
