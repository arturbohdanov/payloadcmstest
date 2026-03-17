import type { CollectionConfig } from 'payload'

export const Sites: CollectionConfig = {
  slug: 'sites',
  orderable: true,
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true, // Make publicly readable so we can fetch it easily on the frontend
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Название сайта',
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'URL',
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation === 'create') {
          const payload = req.payload
          try {
            // 1. Create Homepage Settings doc
            const homeSettingsQuery = await payload.find({
              collection: 'homepage-settings',
              where: { site: { equals: doc.id } },
              limit: 1, req,
            })
            if (homeSettingsQuery.totalDocs === 0) {
              await payload.create({
                collection: 'homepage-settings',
                data: {
                  site: doc.id,
                  homepagePromotions: [],
                },
                req,
              })
            }
            
            // 2. Create All Promotions Settings doc
            const allSettingsQuery = await payload.find({
              collection: 'site-promotions-settings',
              where: { site: { equals: doc.id } },
              limit: 1, req,
            })
            if (allSettingsQuery.totalDocs === 0) {
              await payload.create({
                collection: 'site-promotions-settings',
                data: {
                  site: doc.id,
                  allPromotions: [],
                },
                req,
              })
            }
          } catch (error) {
            console.error('Error creating linked settings collections for Site:', error)
          }
        }
        return doc
      },
    ],
  },
}
