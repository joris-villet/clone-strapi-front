// components/Navbar.tsx

'use client'; 

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/deploy', label: 'Deploy' },
    { path: '/monitoring', label: 'Monitoring' },
    { path: '/terminal', label: 'Terminal' }
  ];
  
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex space-x-6">
        {navItems.map((item) => (
          <Link 
            href={item.path} 
            key={item.path}
            className={`text-white hover:text-gray-300 transition-colors ${
              pathname === item.path ? 'font-bold border-b-2 border-white' : ''
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;