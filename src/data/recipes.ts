export type Ingredient = { name: string; emoji: string; quantity: number; unit: string; category: string };
export type Recipe = {
  id: string; name: string; tag: string; color: string;
  minutes: number; cost: number; kcal: number; protein: number; carbs: number; fat: number;
  restrictions: string[]; appliances: string[]; goals: string[];
  ingredients: Ingredient[]; steps: string[];
};

export const recipes: Recipe[] = [
  {
    id: 'arroz', name: 'Arroz com frango', tag: 'Refeição prática', color: '#E9D9F5',
    minutes: 25, cost: 11.75,
    kcal: 420, protein: 49, carbs: 30, fat: 12,
    restrictions: [], appliances: ['Fogão'], goals: ['Refeição prática', 'Rico em proteína', 'Conforto e sabor'],
    ingredients: [
      { name: 'Peito de frango', emoji: '🍗', quantity: 150, unit: 'g', category: 'Proteínas' },
      { name: 'Arroz', emoji: '🍚', quantity: 80, unit: 'g', category: 'Mercearia' },
      { name: 'Brócolis', emoji: '🥦', quantity: 100, unit: 'g', category: 'Frutas e verduras' },
      { name: 'Cenoura', emoji: '🥕', quantity: 0.5, unit: 'un.', category: 'Frutas e verduras' },
    ],
    steps: ['Cozinhe o arroz conforme as instruções da embalagem.', 'Corte o frango em cubos e cozinhe em uma panela com um fio de azeite até dourar e atingir 74 °C no centro.', 'Acrescente os vegetais picados e cozinhe até ficarem macios. Misture ao arroz e ajuste os temperos.'],
  },
  {
    id: 'macarrao', name: 'Macarrão com frango e brócolis', tag: 'Rico em proteína', color: '#F3D6DF',
    minutes: 20, cost: 12.5,
    kcal: 410, protein: 40, carbs: 45, fat: 9,
    restrictions: ['Glúten'], appliances: ['Fogão'], goals: ['Rico em proteína', 'Refeição prática'],
    ingredients: [
      { name: 'Peito de frango', emoji: '🍗', quantity: 150, unit: 'g', category: 'Proteínas' },
      { name: 'Macarrão', emoji: '🍝', quantity: 100, unit: 'g', category: 'Mercearia' },
      { name: 'Brócolis', emoji: '🥦', quantity: 100, unit: 'g', category: 'Frutas e verduras' },
    ],
    steps: ['Cozinhe o macarrão em água fervente até ficar al dente.', 'Cozinhe o brócolis no vapor. Doure o frango em cubos até atingir 74 °C no centro.', 'Junte os ingredientes com um fio de azeite, tempere e sirva.'],
  },
  {
    id: 'salada', name: 'Salada com batata e atum', tag: 'Refeição leve', color: '#DDEDC7',
    minutes: 15, cost: 10.5,
    kcal: 245, protein: 25, carbs: 36, fat: 8,
    restrictions: ['Peixe'], appliances: ['Fogão', 'Micro-ondas'], goals: ['Refeição leve', 'Conforto e sabor'],
    ingredients: [
      { name: 'Atum', emoji: '🐟', quantity: 1, unit: 'lata', category: 'Proteínas' },
      { name: 'Batata', emoji: '🥔', quantity: 2, unit: 'un.', category: 'Frutas e verduras' },
      { name: 'Alface', emoji: '🥬', quantity: 0.25, unit: 'maço', category: 'Frutas e verduras' },
      { name: 'Tomate', emoji: '🍅', quantity: 1, unit: 'un.', category: 'Frutas e verduras' },
    ],
    steps: ['Cozinhe as batatas em água ou no micro-ondas até ficarem macias e deixe esfriar.', 'Lave as folhas e corte os tomates e as batatas.', 'Escorra o atum, misture tudo e tempere com azeite e limão.'],
  },
  {
    id: 'vegetais', name: 'Bowl de arroz e vegetais', tag: 'Vegetariano', color: '#DDEDC7',
    minutes: 20, cost: 7.5,
    kcal: 320, protein: 12, carbs: 52, fat: 8,
    restrictions: [], appliances: ['Fogão'], goals: ['Refeição leve', 'Refeição prática', 'Diferente'],
    ingredients: [
      { name: 'Arroz', emoji: '🍚', quantity: 80, unit: 'g', category: 'Mercearia' },
      { name: 'Brócolis', emoji: '🥦', quantity: 150, unit: 'g', category: 'Frutas e verduras' },
      { name: 'Cenoura', emoji: '🥕', quantity: 1, unit: 'un.', category: 'Frutas e verduras' },
    ],
    steps: ['Cozinhe o arroz.', 'Cozinhe os vegetais no vapor até ficarem macios.', 'Monte o bowl e finalize com azeite e os temperos de sua preferência.'],
  },
];

export const weekdays = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
export const markets = ['Supermercados BH', 'Villefort', 'EPA', 'Verdemar', 'Assaí', 'Supernosso', 'Carrefour', 'Mart Minas', 'Prata'];
export const goalOptions = [
  { name: 'Refeição prática', emoji: '🍲', color: '#C6EDB0' },
  { name: 'Lanche caseiro', emoji: '🍔', color: '#BEF0E0' },
  { name: 'Refeição de família', emoji: '🏡', color: '#FFD4D0' },
  { name: 'Refeição leve', emoji: '🌱', color: '#DAD9FC' },
  { name: 'Conforto e sabor', emoji: '😋', color: '#E6DCD4' },
  { name: 'Diferente', emoji: '🌶️', color: '#FFDCAB' },
  { name: 'Rico em proteína', emoji: '💪', color: '#E6CEF9' },
];
