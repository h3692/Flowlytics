import { COLOR_MAP } from '../simulation/constants';

const LEGEND_ITEMS = [
  // Structure
  { name: 'Wall', color: COLOR_MAP.Wall },
  { name: 'Floor', color: COLOR_MAP.Floor },
  { name: 'Entrance', color: COLOR_MAP.Entrance },
  { name: 'Checkout', color: COLOR_MAP.Checkout },
  // Perimeter
  { name: 'Meat', color: COLOR_MAP.Meat },
  { name: 'Dairy', color: COLOR_MAP.Dairy },
  { name: 'Produce', color: COLOR_MAP.Produce },
  { name: 'Bakery', color: COLOR_MAP.Bakery },
  { name: 'Frozen', color: COLOR_MAP.Frozen },
  // Center Store
  { name: 'Cereal', color: COLOR_MAP.Cereal },
  { name: 'Juice', color: COLOR_MAP.Juice },
  { name: 'Soda', color: COLOR_MAP.Soda },
  { name: 'Pasta', color: COLOR_MAP.Pasta },
  { name: 'Sauce', color: COLOR_MAP.Sauce },
  { name: 'Chips', color: COLOR_MAP.Chips },
  { name: 'Cookies', color: COLOR_MAP.Cookies },
  { name: 'Oil/Condiments', color: COLOR_MAP['Oil/Condiments'] },
  { name: 'Water', color: COLOR_MAP.Water },
  { name: 'Household', color: COLOR_MAP.Household },
  { name: 'Pet Food', color: COLOR_MAP['Pet Food'] },
  { name: 'Baby', color: COLOR_MAP.Baby },
  { name: 'Tea/Coffee', color: COLOR_MAP['Tea/Coffee'] },
  { name: 'Canned Veg', color: COLOR_MAP['Canned Veg'] },
];

export function Legend() {
  return (
    <div className="glass-card p-6 h-full">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <svg className="h-6 w-6 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
        Product Legend
      </h2>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {LEGEND_ITEMS.map(item => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded flex-shrink-0 border border-dark-border"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-300 truncate">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
