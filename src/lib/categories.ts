import type { CategoryNode } from './types';

export const categories: CategoryNode[] = [
  {
    id: 'pc-components',
    name: 'PC Components',
    slug: 'pc-components',
    children: [
      { id: 'graphics-cards', name: 'Graphics Cards', slug: 'graphics-cards', image: '/images/cat-gpu.jpg' },
      { id: 'processors', name: 'Processors', slug: 'processors', image: '/images/cat-processors.jpg' },
      {
        id: 'motherboards',
        name: 'Motherboards',
        slug: 'motherboards',
        image: '/images/cat-motherboard.jpg',
        children: [
          { id: 'intel-mb', name: 'Intel Motherboards', slug: 'intel-motherboards' },
          { id: 'amd-mb', name: 'AMD Motherboards', slug: 'amd-motherboards' },
        ],
      },
      { id: 'memory', name: 'Memory', slug: 'memory' },
      {
        id: 'storage',
        name: 'Storage',
        slug: 'storage',
        children: [
          { id: 'ssd-nvme', name: 'SSD NVMe', slug: 'ssd-nvme' },
          { id: 'ssd-sata', name: 'SSD SATA', slug: 'ssd-sata' },
          { id: 'hdd', name: 'HDD', slug: 'hdd' },
          { id: 'storage-acc', name: 'Storage Accessories', slug: 'storage-accessories' },
        ],
      },
    ],
  },
  {
    id: 'cases-cooling',
    name: 'Cases & Cooling',
    slug: 'cases-cooling',
    children: [
      {
        id: 'pc-cases',
        name: 'PC Cases',
        slug: 'pc-cases',
        image: '/images/cat-case.jpg',
        children: [
          { id: 'gamemax-cases', name: 'GAMEMAX Cases', slug: 'gamemax-cases' },
          { id: 'xeron-cases', name: 'XERON Cases', slug: 'xeron-cases' },
        ],
      },
      { id: 'power-supplies', name: 'Power Supplies', slug: 'power-supplies' },
      { id: 'air-coolers', name: 'Air Coolers', slug: 'air-coolers' },
      { id: 'aio-liquid', name: 'AIO Liquid Cooling', slug: 'aio-liquid-cooling' },
      { id: 'case-fans', name: 'Case Fans', slug: 'case-fans' },
      { id: 'thermal-paste', name: 'Thermal Paste', slug: 'thermal-paste' },
      { id: 'cooling-acc', name: 'Cooling Accessories', slug: 'cooling-accessories' },
    ],
  },
  {
    id: 'gaming-accessories',
    name: 'Gaming Accessories',
    slug: 'gaming-accessories',
    image: '/images/cat-accessories.jpg',
    children: [
      { id: 'mice', name: 'Mice', slug: 'mice' },
      { id: 'keyboards', name: 'Keyboards', slug: 'keyboards' },
      { id: 'headsets', name: 'Headsets', slug: 'headsets' },
      { id: 'mouse-pads', name: 'Mouse Pads', slug: 'mouse-pads' },
      { id: 'monitors', name: 'Monitors', slug: 'monitors', image: '/images/cat-monitor.jpg' },
    ],
  },
  {
    id: 'ready-pcs',
    name: 'Ready-made PCs',
    slug: 'ready-made-pcs',
    children: [
      { id: 'gaming-pcs', name: 'Gaming PCs', slug: 'gaming-pcs' },
      { id: 'office-pcs', name: 'Office PCs', slug: 'office-pcs' },
    ],
  },
  {
    id: 'furniture',
    name: 'Furniture & Room Setup',
    slug: 'furniture-room-setup',
    children: [
      { id: 'gaming-chairs', name: 'Gaming Chairs', slug: 'gaming-chairs' },
      { id: 'gaming-desks', name: 'Gaming Desks and Tables', slug: 'gaming-desks' },
    ],
  },
];

export const homeCategoryTiles = [
  { name: 'Processors', slug: 'processors', image: '/images/cat-processors.jpg' },
  { name: 'Graphics Cards', slug: 'graphics-cards', image: '/images/cat-gpu.jpg' },
  { name: 'Motherboards', slug: 'motherboards', image: '/images/cat-motherboard.jpg' },
  { name: 'Memory', slug: 'memory', image: '/images/cat-processors.jpg' },
  { name: 'Storage', slug: 'storage', image: '/images/cat-motherboard.jpg' },
  { name: 'Cooling', slug: 'air-coolers', image: '/images/cat-case.jpg' },
  { name: 'Monitors', slug: 'monitors', image: '/images/cat-monitor.jpg' },
  { name: 'PC Cases', slug: 'pc-cases', image: '/images/cat-case.jpg' },
];

export const brands = [
  'GIGABYTE', 'Intel', 'AMD', 'HAVIT', 'GAMEMAX', 'XERON', 'AORUS', 'AOC',
  'MSI', 'ASUS', 'SAMSUNG', 'KINGSTON', 'TEAMGROUP', 'CORSAIR', 'PNY',
  'WESTERN DIGITAL', 'ZOTAC', 'LEXAR', 'ViewSonic', 'FANTECH',
];

export function flattenCategories(nodes: CategoryNode[] = categories): CategoryNode[] {
  const result: CategoryNode[] = [];
  for (const n of nodes) {
    result.push(n);
    if (n.children) result.push(...flattenCategories(n.children));
  }
  return result;
}

export function findCategory(slug: string): CategoryNode | undefined {
  return flattenCategories().find((c) => c.slug === slug);
}
