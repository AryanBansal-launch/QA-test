import React from 'react'
import Link from 'next/link'
const page = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      About us Page edit again
      <Link href="/">Home</Link>
      <Link href="/contact">Contact</Link>
    </div>
  )
}

export default page
