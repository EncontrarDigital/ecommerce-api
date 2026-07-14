/**
 * Enum para unidades de medida de produtos
 * Usado especialmente para produtos orgânicos e a granel
 */
export enum ProductUnit {
  // Unidades de massa
  KILOGRAM = 'kg',
  GRAM = 'g',
  MILLIGRAM = 'mg',
  
  // Unidades de volume
  LITER = 'litro',
  MILLILITER = 'ml',
  
  // Unidades de contagem
  UNIT = 'unidade',
  PACKAGE = 'pacote',
  BOX = 'caixa',
  DOZEN = 'duzia',
  
  // Outras
  METER = 'metro',
  CENTIMETER = 'cm',
}

/**
 * Helper para obter o label amigável da unidade
 */
export function getUnitLabel(unit: string): string {
  const labels: Record<string, string> = {
    kg: 'Quilograma',
    g: 'Grama',
    mg: 'Miligrama',
    litro: 'Litro',
    ml: 'Mililitro',
    unidade: 'Unidade',
    pacote: 'Pacote',
    caixa: 'Caixa',
    duzia: 'Dúzia',
    metro: 'Metro',
    cm: 'Centímetro',
  };
  return labels[unit] || unit;
}

/**
 * Helper para validar se a unidade é válida
 */
export function isValidUnit(unit: string): boolean {
  return Object.values(ProductUnit).includes(unit as ProductUnit);
}
