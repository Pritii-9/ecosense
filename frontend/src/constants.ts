export const wasteOptions = ['Plastic', 'Paper', 'Glass', 'Organic', 'Metal'] as const

export type WasteOption = (typeof wasteOptions)[number]

export const wastePointMap: Record<WasteOption, number> = {
  Plastic: 5,
  Paper: 3,
  Glass: 4,
  Organic: 2,
  Metal: 6,
}

export const todayString = () => new Date().toISOString().split('T')[0]
