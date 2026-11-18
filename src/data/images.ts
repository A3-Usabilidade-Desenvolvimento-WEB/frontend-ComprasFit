import type { ImageSourcePropType } from 'react-native';

type RecipePhoto = {
  source: ImageSourcePropType;
  credit: { author: string; url: string } | null;
};

export const recipePhotos: Partial<Record<string, RecipePhoto>> = {
  'arroz-carreteiro': {
    source: require('../../assets/recipes/arroz-carreteiro.jpg'),
    credit: null,
  },
  'arroz-com-feijao': {
    source: require('../../assets/recipes/arroz-com-feijao.jpg'),
    credit: null,
  },
  'arroz-cremoso-brocolis': {
    source: require('../../assets/recipes/arroz-cremoso-brocolis.jpg'),
    credit: null,
  },
  'arroz-feijao-frango': {
    source: require('../../assets/recipes/arroz-feijao-frango.jpg'),
    credit: null,
  },
  'batata-doce-airfryer': {
    source: require('../../assets/recipes/batata-doce-airfryer.jpg'),
    credit: { author: 'Kurtkaiser', url: 'https://commons.wikimedia.org/wiki/File:Sweet_Potato_Fries_3.jpg' },
  },
  'batata-doce-forno': {
    source: require('../../assets/recipes/batata-doce-forno.jpg'),
    credit: null,
  },
  'batata-doce-microondas': {
    source: require('../../assets/recipes/batata-doce-microondas.jpg'),
    credit: null,
  },
  'bolo-banana-aveia': {
    source: require('../../assets/recipes/bolo-banana-aveia.jpg'),
    credit: null,
  },
  'brocolis-airfryer': {
    source: require('../../assets/recipes/brocolis-airfryer.jpg'),
    credit: null,
  },
  'carne-moida-batata-doce': {
    source: require('../../assets/recipes/carne-moida-batata-doce.jpg'),
    credit: null,
  },
  'feijao-cenoura': {
    source: require('../../assets/recipes/feijao-cenoura.jpg'),
    credit: null,
  },
  'frango-brocolis-arroz': {
    source: require('../../assets/recipes/frango-brocolis-arroz.jpg'),
    credit: null,
  },
  'frango-grelhado': {
    source: require('../../assets/recipes/frango-grelhado.jpg'),
    credit: null,
  },
  'lentilha-arroz-cenoura': {
    source: require('../../assets/recipes/lentilha-arroz-cenoura.jpg'),
    credit: null,
  },
  'lentilha-batata-doce': {
    source: require('../../assets/recipes/lentilha-batata-doce.jpg'),
    credit: null,
  },
  'lentilha-tomate': {
    source: require('../../assets/recipes/lentilha-tomate.jpg'),
    credit: null,
  },
  'macarrao-brocolis': {
    source: require('../../assets/recipes/macarrao-brocolis.jpg'),
    credit: { author: 'Yknott', url: 'https://commons.wikimedia.org/wiki/File:Pasta%2Bbroccoli.jpg' },
  },
  'macarrao-lentilha': {
    source: require('../../assets/recipes/macarrao-lentilha.jpg'),
    credit: null,
  },
  'macarrao-molho-tomate': {
    source: require('../../assets/recipes/macarrao-molho-tomate.jpg'),
    credit: { author: 'Roberto De Martino', url: 'https://commons.wikimedia.org/wiki/File:Spaghettata.JPG' },
  },
  'mingau-aveia-banana': {
    source: require('../../assets/recipes/mingau-aveia-banana.jpg'),
    credit: null,
  },
  'mingau-de-aveia': {
    source: require('../../assets/recipes/mingau-de-aveia.jpg'),
    credit: { author: 'Bodhi Peace', url: 'https://commons.wikimedia.org/wiki/File:Cooked_oatmeal_in_bowl.jpg' },
  },
  'mingau-microondas': {
    source: require('../../assets/recipes/mingau-microondas.jpg'),
    credit: null,
  },
  'omelete-arroz-legumes': {
    source: require('../../assets/recipes/omelete-arroz-legumes.jpg'),
    credit: null,
  },
  'omelete-brocolis': {
    source: require('../../assets/recipes/omelete-brocolis.jpg'),
    credit: null,
  },
  'omelete-simples': {
    source: require('../../assets/recipes/omelete-simples.jpg'),
    credit: { author: 'Renee Comet e National Cancer Institute', url: 'https://commons.wikimedia.org/wiki/File:Eggs_omelette.jpg' },
  },
  'ovos-tomate': {
    source: require('../../assets/recipes/ovos-tomate.jpg'),
    credit: { author: 'Junbinhuang', url: 'https://commons.wikimedia.org/wiki/File:Shakshuka_Dish.jpg' },
  },
  'panqueca-banana-aveia': {
    source: require('../../assets/recipes/panqueca-banana-aveia.jpg'),
    credit: { author: 'PallaviKhale', url: 'https://commons.wikimedia.org/wiki/File:Banana_Pancakes_Pk021.jpg' },
  },
};

export const marketImages: Record<string, ImageSourcePropType> = {
  'Supermercados BH': require('../../assets/market-0.png'),
  Villefort: require('../../assets/market-1.png'),
  Verdemar: require('../../assets/market-3.png'),
  Assaí: require('../../assets/market-4.png'),
  Supernosso: require('../../assets/market-5.png'),
  Carrefour: require('../../assets/market-6.png'),
  'Mart Minas': require('../../assets/market-7.png'),
  Prata: require('../../assets/market-8.png'),
};
