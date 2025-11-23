"use client"

import { useParams } from 'next/navigation'
import VendorDetailsPage from '../_components/VendorDetailsPage'

function page() {
    const { id } = useParams()
  return (
    <div>
        <VendorDetailsPage verndorId={id as string} />
    </div>
  )
}

export default page