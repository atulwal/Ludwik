import React from 'react'

function Navbar() {
    const links = [
        { name: "Market", href: "#market" },
        { name: "Latest Tweets", href: "#latesttweets" },
        { name: "GitHub", href: "#github" },
    ]
  return (
    <nav className='relative bg-black text-white rounded-full max-w-fit mx-auto px-10 border border-amber-50'>
        <div className='flex p-4 gap-12 justify-center items-center text-lg '>
            {links.map((link) => (
          <a key={link.name} href={link.href}
            className="rounded-full transition-all duration-300 hover:bg-linear-to-b hover:from-[#2d2f45] hover:to-[#1f2133]">
            {link.name}
          </a>
        ))}
        </div>
    </nav>
  )
}

export default Navbar
