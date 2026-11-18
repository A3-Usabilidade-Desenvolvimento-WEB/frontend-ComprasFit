import type { ImageSourcePropType } from 'react-native';

type RecipePhoto = {
  source: ImageSourcePropType;
  credit?: { author: string; url: string };
};

const photos: Record<string, RecipePhoto> = {
  'arroz-feijao': { source: require('../../assets/recipes/arroz-feijao.jpg'), credit: { author: "ViajantenoPlanetaTerra", url: 'https://commons.wikimedia.org/wiki/File:Arroz_e_feij%C3%A3o.jpg' } },
  'arroz-feijao-frango': { source: require('../../assets/recipes/arroz-feijao-frango.jpg'), credit: { author: "Tet", url: 'https://commons.wikimedia.org/wiki/File:Prato_com_arroz_e_feij%C3%A3o%2C_frango_grelhado%2C_batata_frita%2C_salada_e_ovo_frito_como_adicionais.jpg' } },
  'omelete': { source: require('../../assets/recipes/omelete.jpg'), credit: { author: "Renee Comet e National Cancer Institute", url: 'https://commons.wikimedia.org/wiki/File:Eggs_omelette.jpg' } },
  'omelete-legumes': { source: require('../../assets/recipes/omelete-legumes.jpg'), credit: { author: "JacquesDemien", url: 'https://commons.wikimedia.org/wiki/File:An_omelette.jpg' } },
  'lentilha': { source: require('../../assets/recipes/lentilha.jpg'), credit: { author: "Zantastik", url: 'https://commons.wikimedia.org/wiki/File:Rago%C3%BBt_aux_lentilles.jpg' } },
  'sopa-lentilha': { source: require('../../assets/recipes/sopa-lentilha.jpg'), credit: { author: "Emna Mizouni", url: 'https://commons.wikimedia.org/wiki/File:Lentil_soup_from_Sicily.jpg' } },
  'aveia-banana': { source: require('../../assets/recipes/aveia-banana.jpg'), credit: { author: "Ella Olsson", url: 'https://commons.wikimedia.org/wiki/File:Banana_Oatmeal_Breakfast_Bowl_(44302857265).jpg' } },
  'batata-rustica': { source: require('../../assets/recipes/batata-rustica.jpg'), credit: { author: "Kurtkaiser", url: 'https://commons.wikimedia.org/wiki/File:Sweet_Potato_Fries_3.jpg' } },
  'ovos-tomate': { source: require('../../assets/recipes/ovos-tomate.jpg'), credit: { author: "Junbinhuang", url: 'https://commons.wikimedia.org/wiki/File:Shakshuka_Dish.jpg' } },
  'panqueca-banana': { source: require('../../assets/recipes/panqueca-banana.jpg'), credit: { author: "FitTasteTic", url: 'https://commons.wikimedia.org/wiki/File:Healthy_Banana_Pancakes.jpg' } },
  'bolo-banana': { source: require('../../assets/recipes/bolo-banana.jpg'), credit: { author: "Shisma", url: 'https://commons.wikimedia.org/wiki/File:Banana_bread_cut_into_slices.jpg' } },
  'aveia': { source: require('../../assets/recipes/aveia.jpg'), credit: { author: "Tiia Monto", url: 'https://commons.wikimedia.org/wiki/File:Porridge_2.jpg' } },
  'batata-brocolis': { source: require('../../assets/recipes/batata-brocolis.jpg'), credit: { author: "Karen and Brad Emerson", url: 'https://commons.wikimedia.org/wiki/File:Sesame-roasted_sweet_potato_wedges_with_Brocolli_(3257806891).jpg' } },
  'macarrao-tomate': { source: require('../../assets/recipes/macarrao-tomate.jpg'), credit: { author: "Benreis", url: 'https://commons.wikimedia.org/wiki/File:Spaghetti_al_Pomodoro.JPG' } },
  'macarrao-brocolis': { source: require('../../assets/recipes/macarrao-brocolis.jpg'), credit: { author: "Yknott", url: 'https://commons.wikimedia.org/wiki/File:Pasta%2Bbroccoli.jpg' } },
  'frango-grelhado': { source: require('../../assets/recipes/frango-grelhado.jpg'), credit: { author: "FarhanTahir90", url: 'https://commons.wikimedia.org/wiki/File:Chiken_Steaks_in_Pakistan.jpg' } },
};

export const recipePhotos: Partial<Record<string, RecipePhoto>> = {
  'arroz-com-feijao': photos['arroz-feijao'],
  'arroz-feijao-frango': photos['arroz-feijao-frango'],
  'frango-brocolis-arroz': { source: require('../../assets/arroz.jpg') },
  'frango-grelhado': photos['frango-grelhado'],
  'omelete-simples': photos['omelete'],
  'omelete-brocolis': photos['omelete-legumes'],
  'omelete-arroz-legumes': photos['omelete-legumes'],
  'ovos-tomate': photos['ovos-tomate'],
  'macarrao-molho-tomate': photos['macarrao-tomate'],
  'macarrao-brocolis': photos['macarrao-brocolis'],
  'macarrao-lentilha': photos['macarrao-tomate'],
  'lentilha-tomate': photos['lentilha'],
  'lentilha-arroz-cenoura': photos['lentilha'],
  'lentilha-batata-doce': photos['sopa-lentilha'],
  'mingau-aveia-banana': photos['aveia-banana'],
  'mingau-microondas': photos['aveia-banana'],
  'mingau-de-aveia': photos['aveia'],
  'batata-doce-airfryer': photos['batata-rustica'],
  'batata-doce-forno': photos['batata-brocolis'],
  'brocolis-airfryer': photos['batata-brocolis'],
  'panqueca-banana-aveia': photos['panqueca-banana'],
  'bolo-banana-aveia': photos['bolo-banana'],
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
