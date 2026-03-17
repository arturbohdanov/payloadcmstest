import { getPayload } from 'payload'
import React from 'react'
import { notFound } from 'next/navigation'
import config from '@/payload.config'

export default async function SubdomainPage(props: { params: Promise<{ domain: string }> }) {
  const params = await props.params
  const domain = params.domain
  
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  console.log('Subdomain check:', { domain })

  // The user might have entered 'hotel1' or 'hotel1.localhost' in the URL field. 
  // Let's try matching the exact domain, or just the subdomain prefix.
  const subdomainPrefix = domain.split('.')[0]

  // Find the site by url matching the incoming domain or subdomain prefix
  const sites = await payload.find({
    collection: 'sites',
    where: {
      or: [
        { url: { equals: domain } },
        { url: { equals: subdomainPrefix } }
      ]
    },
    limit: 1,
  })
  
  const site = sites.docs[0]

  console.log('Found site in DB:', site?.name || 'none')

  // If no site matches this domain, return 404
  if (!site) {
    console.log('Returning 404 for domain', domain)
    notFound()
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', margin: 0 }}>
      <h1 style={{ textAlign: 'center' }}>{site.name}</h1>
    </div>
  )
}
