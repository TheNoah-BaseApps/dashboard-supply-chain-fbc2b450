'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  BarChart3, 
  FileText, 
  AlertCircle,
  User,
  Truck,
  Users,
  TruckIcon,
  BookOpen,
  DollarSign,
  ShoppingBag,
  PackageCheck,
  UserCog
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Suppliers', href: '/suppliers', icon: Package },
  { name: 'Inventory', href: '/inventory', icon: Warehouse },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Audit Logs', href: '/audit-logs', icon: FileText },
  { name: 'Validations', href: '/validations', icon: AlertCircle },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Warehouse', href: '/warehouse', icon: Warehouse },
  { name: 'Logistics', href: '/logistics', icon: Truck },
  { name: 'Vendors', href: '/vendors', icon: Users },
  { name: 'Assets', href: '/assets', icon: Package },
  { name: 'Asset Movements', href: '/asset-movements', icon: TruckIcon },
  { name: 'Catalogues', href: '/catalogues', icon: BookOpen },
  { name: 'Sales', href: '/sales', icon: DollarSign },
  { name: 'Order & Purchases', href: '/order-purchases', icon: ShoppingBag },
  { name: 'Supply Chain Orders', href: '/supply-chain-orders', icon: PackageCheck },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Customer Management', href: '/customer-management', icon: Users },
  { name: 'Demand Management', href: '/demand-management', icon: Package },
  { name: 'Partner Management', href: '/partner-management', icon: Users },
  { name: 'Staffing Management', href: '/staffing-management', icon: Users },
  { name: 'Gig Worker Management', href: '/gig-worker-management', icon: UserCog },
  { name: 'Distribution Management', href: '/distribution-management', icon: Truck },
  { name: 'Shipment Tracking', href: '/shipment-tracking', icon: Package },
  { name: 'Trucking & Mobility', href: '/trucking-mobility', icon: TruckIcon },
];

export default function Sidebar({ isOpen, currentPath, userRole }) {
  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 transition-transform duration-300 z-30',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <nav className="h-full overflow-y-auto p-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => {}}
        />
      )}
    </>
  );
}