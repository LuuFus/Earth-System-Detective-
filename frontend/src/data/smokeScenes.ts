// The smoke scenes of the fire stories: a few days when the smoke mattered most, close up, with
// the real wind of those hours and the air in the towns around. What happened, why, what it led
// to and what to do come with each one.

import type { SmokeBox } from '../components/globe/smoke';
import type { Text } from './variables';

export type SmokeKind = 'wild' | 'field' | 'war';

export type SmokeScene = {
  storyId: string;
  kind: SmokeKind;
  /** First hour (UTC, YYYY-MM-DDTHH) and length of the scene. */
  start: string;
  hours: number;
  /** Where the wind is read and the towns are picked: wider than the fires, to see where smoke went. */
  box: SmokeBox;
  camera: { lat: number; lon: number; distance: number };
  /** Towns to show (English names in the city list); otherwise the biggest in the box. */
  towns?: string[];
  /** What the smoke did, in a sentence. */
  smoke: Text;
  /** Causes and consequences, when no news item of the story has them. */
  why?: Text;
  effects?: Text;
};

export const SMOKE_SCENES: SmokeScene[] = [
  {
    storyId: 'chornobyl-2020',
    kind: 'wild',
    start: '2020-04-15T12',
    hours: 72,
    box: { s: 49.6, n: 51.9, w: 28.5, e: 32.4 },
    camera: { lat: 50.75, lon: 30.3, distance: 1.075 },
    towns: ['Kyiv', 'Chornobyl', 'Zhytomyr', 'Chernihiv', 'Korosten', 'Bila Tserkva', 'Brovary', 'Nizhyn'],
    smoke: {
      uk: 'У середині квітня дим від пожеж у зоні відчуження дійшов до Києва: 16–17 квітня місто мало одне з найбрудніших повітрь серед великих міст світу.',
      en: 'In mid-April the smoke of the Exclusion Zone fires reached Kyiv: on 16–17 April the city had some of the dirtiest air among the big cities of the world.',
    },
  },
  {
    storyId: 'la-2025',
    kind: 'wild',
    start: '2025-01-07T18',
    hours: 72,
    box: { s: 33.3, n: 34.7, w: -119.3, e: -117.2 },
    camera: { lat: 34.05, lon: -118.35, distance: 1.045 },
    smoke: {
      uk: 'Сильний вітер Санта-Ана дув із суходолу до океану й відносив дим над океан; де вітер слабшав, дим і попіл від згорілих будинків осідали на райони міста.',
      en: 'The strong Santa Ana wind blew from the land to the ocean and carried the smoke out to sea; where it eased, smoke and ash from the burned houses settled over the city.',
    },
  },
  {
    storyId: 'evia-2021',
    kind: 'wild',
    start: '2021-08-05T00',
    hours: 96,
    box: { s: 37.5, n: 39.4, w: 22.6, e: 24.9 },
    camera: { lat: 38.4, lon: 23.6, distance: 1.06 },
    smoke: {
      uk: 'Дим від пожеж на Евбеї та в Аттиці кілька днів висів над Афінами; небо над містом ставало помаранчевим, на вулиці падав попіл.',
      en: 'Smoke from the fires on Evia and in Attica hung over Athens for days; the sky over the city turned orange and ash fell in the streets.',
    },
  },
  {
    storyId: 'turkey-2021',
    kind: 'wild',
    start: '2021-07-28T06',
    hours: 72,
    box: { s: 36.2, n: 37.9, w: 30.2, e: 33.2 },
    camera: { lat: 36.85, lon: 31.6, distance: 1.06 },
    smoke: {
      uk: 'Дим розносило над узбережжям і морем; його було видно із супутників на сотні кілометрів.',
      en: 'The smoke spread over the coast and the sea; satellites saw it for hundreds of kilometres.',
    },
    why: {
      uk: 'Наприкінці липня 2021 року на півдні Туреччини стояла сильна спека із сухим вітром. Біля Манавгата й в інших районах Анталії спалахнули соснові ліси, і вітер швидко поніс вогонь.',
      en: 'At the end of July 2021 the south of Turkey had a strong heatwave with a dry wind. Pine forests caught fire near Manavgat and elsewhere in Antalya province, and the wind spread the fire fast.',
    },
    effects: {
      uk: 'Вогонь дійшов до сіл і курортів, людей евакуйовували, зокрема морем. Згоріли великі площі соснових лісів, які відростатимуть десятиліттями.',
      en: 'The fire reached villages and resorts; people were evacuated, some by sea. Large areas of pine forest burned that will take decades to grow back.',
    },
  },
  {
    storyId: 'quebec-2023',
    kind: 'wild',
    start: '2023-06-05T00',
    hours: 96,
    box: { s: 39.5, n: 52.5, w: -80.5, e: -66 },
    camera: { lat: 45.6, lon: -73.5, distance: 1.32 },
    towns: ['New York City', 'Montreal', 'Quebec City', 'Ottawa', 'Toronto', 'Boston', 'Philadelphia'],
    smoke: {
      uk: '6–8 червня 2023 року вітер приніс дим із пожеж Квебеку на північний схід США: у Нью-Йорку небо стало помаранчевим, а якість повітря 7 червня була однією з найгірших у світі.',
      en: 'On 6–8 June 2023 the wind brought smoke from the Quebec fires to the north-east of the United States: the sky over New York turned orange, and on 7 June its air was among the worst in the world.',
    },
  },
  {
    storyId: 'luhansk-2020',
    kind: 'wild',
    start: '2020-09-30T00',
    hours: 72,
    box: { s: 47.8, n: 50.3, w: 37.4, e: 40.8 },
    camera: { lat: 49.0, lon: 39.1, distance: 1.07 },
    smoke: {
      uk: 'Той самий сильний вітер, що роздмухував вогонь, ніс дим над Луганщиною й Донеччиною.',
      en: 'The same strong wind that fanned the fire carried its smoke over the Luhansk and Donetsk regions.',
    },
  },
  {
    storyId: 'fields-2018',
    kind: 'field',
    start: '2018-04-08T00',
    hours: 72,
    box: { s: 45.5, n: 52.5, w: 23.5, e: 40.5 },
    camera: { lat: 49.2, lon: 31.5, distance: 1.35 },
    towns: ['Kyiv', 'Kharkiv', 'Dnipro', 'Odesa', 'Vinnytsia', 'Poltava', 'Cherkasy', 'Kropyvnytskyi', 'Chernihiv', 'Sumy'],
    smoke: {
      uk: 'Навесні сотні полів палять майже одночасно: дим від них накриває цілі області, а в безвітря стоїть над селами й містами.',
      en: 'In spring hundreds of fields are burned at almost the same time: their smoke covers whole regions and, without wind, hangs over villages and towns.',
    },
  },
  {
    storyId: 'front-2022',
    kind: 'war',
    start: '2022-08-24T00',
    hours: 72,
    box: { s: 45.9, n: 48.7, w: 31.8, e: 38.6 },
    camera: { lat: 47.3, lon: 35.0, distance: 1.13 },
    towns: ['Zaporizhzhia', 'Kherson', 'Mykolaiv', 'Kryvyi Rih', 'Melitopol', 'Nikopol', 'Berdiansk', 'Dnipro'],
    smoke: {
      uk: 'Наприкінці серпня 2022 року супутники бачили сотні осередків вогню вздовж фронту на півдні. Подивіться, куди вітер ніс дим від них і як змінювалося повітря в містах поруч.',
      en: 'At the end of August 2022 satellites saw hundreds of fires along the front in the south. See where the wind took their smoke and how the air changed in the towns nearby.',
    },
    why: {
      uk: 'Обстріли й бої підпалюють поля, ліси, лісосмуги й будинки. Біля лінії фронту гасити неможливо, тож вогонь горить, доки не дійде до дороги, річки чи зораного поля.',
      en: 'Shelling and fighting set fields, forests, tree belts and houses on fire. Near the front line nobody can put them out, so a fire burns until it reaches a road, a river or a ploughed field.',
    },
    effects: {
      uk: 'Дим від таких пожеж — не лише згорілі рослини: у ньому продукти горіння техніки, будівель, пального й вибухівки. Він погіршує повітря в містах біля фронту; згарища лишаються без рослин, і ґрунт висихає та розвівається вітром.',
      en: 'The smoke of such fires is not only burned plants: it carries what burns in vehicles, buildings, fuel and explosives. It fouls the air in towns near the front; burned land stays bare, and the soil dries out and blows away.',
    },
  },
  {
    storyId: 'vasylkiv-2022',
    kind: 'war',
    start: '2022-02-26T22',
    hours: 60,
    box: { s: 49.7, n: 50.85, w: 29.4, e: 31.5 },
    camera: { lat: 50.25, lon: 30.4, distance: 1.04 },
    towns: ['Kyiv', 'Bila Tserkva', 'Brovary', 'Zhytomyr'],
    smoke: {
      uk: 'Супутник побачив вогонь на нафтобазі вночі 27 лютого, о 01:24 за Києвом, і ще двічі в наступні дві доби. Подивіться, куди вітер ніс чорний дим.',
      en: 'A satellite saw the fire at the depot in the night of 27 February, at 01:24 Kyiv time, and twice more over the next two days. See where the wind took the black smoke.',
    },
    why: {
      uk: 'Російська ракета влучила в резервуари з пальним. Нафтопродукти горять дуже гаряче й з великою кількістю сажі, а гасити заважали бої за аеродром поруч.',
      en: 'A Russian missile hit tanks of fuel. Oil products burn very hot and with a lot of soot, and fighting for the airfield next door kept firefighters away.',
    },
    effects: {
      uk: 'Чорний дим від нафтопродуктів несе сажу, оксиди сірки й азоту та інші токсичні речовини; вони осідають на ґрунт і воду навколо. Пожежі нафтобаз стали одними з перших великих екологічних шкод війни.',
      en: 'Black smoke from oil products carries soot, sulphur and nitrogen oxides and other toxic substances; they settle on the soil and water around. Burning oil depots were among the first large environmental harms of the war.',
    },
  },
  {
    storyId: 'azot-2022',
    kind: 'war',
    start: '2022-06-10T12',
    hours: 72,
    box: { s: 48.4, n: 49.5, w: 37.7, e: 39.5 },
    camera: { lat: 48.95, lon: 38.5, distance: 1.045 },
    towns: ['Lysychansk', 'Kramatorsk', 'Luhansk', 'Horlivka'],
    smoke: {
      uk: 'Супутники бачили вогонь на заводі й навколо нього кілька діб поспіль. Подивіться, куди вітер ніс дим від оливи, що горіла.',
      en: 'Satellites saw fire at the plant and around it for several days running. See where the wind took the smoke of the burning oil.',
    },
    why: {
      uk: 'Бої за Сєвєродонецьк ішли просто на території промзони. Снаряди пробили обладнання з оливою, і вона спалахнула.',
      en: 'The battle for Sievierodonetsk was fought right inside the industrial zone. Shells pierced equipment full of oil, and it caught fire.',
    },
    effects: {
      uk: '«Азот» виробляв азотні добрива. Пожежа на хімічному заводі дає токсичний дим, а пошкоджене обладнання загрожує витоками шкідливих речовин у повітря, ґрунт і воду.',
      en: 'Azot made nitrogen fertilisers. A fire at a chemical plant gives toxic smoke, and damaged equipment threatens leaks of harmful substances into the air, soil and water.',
    },
  },
  {
    storyId: 'odesa-ports-2023',
    kind: 'war',
    start: '2023-07-18T18',
    hours: 48,
    box: { s: 45.9, n: 46.9, w: 30.1, e: 31.4 },
    camera: { lat: 46.4, lon: 30.7, distance: 1.035 },
    towns: ['Odesa', 'Chornomorsk'],
    smoke: {
      uk: 'Супутник зафіксував пожежі в порту вночі 19 липня, близько 02:20 за Києвом. Подивіться, куди вітер ніс дим.',
      en: 'A satellite caught the fires in the port in the night of 19 July, at about 02:20 Kyiv time. See where the wind took the smoke.',
    },
    why: {
      uk: 'Росія вийшла із зернової угоди й почала бити по портовій інфраструктурі та зернових терміналах Одещини.',
      en: 'Russia left the grain deal and began striking the port infrastructure and grain terminals of the Odesa region.',
    },
    effects: {
      uk: 'Горіли зерно, склади й техніка портів: дим ішов над узбережжям і містом. Знищене зерно мало йти на експорт, зокрема до країн, яким загрожує голод.',
      en: 'Grain, warehouses and port machinery burned; the smoke drifted over the coast and the city. The destroyed grain was meant for export, including to countries at risk of hunger.',
    },
  },
  {
    storyId: 'kyiv-2025',
    kind: 'war',
    start: '2025-06-16T21',
    hours: 36,
    box: { s: 50.1, n: 50.8, w: 29.9, e: 31.2 },
    camera: { lat: 50.45, lon: 30.52, distance: 1.03 },
    towns: ['Kyiv', 'Brovary', 'Bila Tserkva'],
    smoke: {
      uk: 'Супутник побачив пожежі в місті близько 03:54 за Києвом, у розпал атаки. Подивіться, куди вітер ніс дим над районами.',
      en: 'A satellite saw fires in the city at about 03:54 Kyiv time, at the height of the attack. See where the wind took the smoke over the districts.',
    },
    why: {
      uk: 'Масовані комбіновані атаки дронами й ракетами: влучання й уламки збитих цілей підпалюють багатоквартирні будинки, склади й автівки.',
      en: 'Mass combined attacks with drones and missiles: hits and the debris of downed targets set blocks of flats, warehouses and cars on fire.',
    },
    effects: {
      uk: 'Дим від згорілих квартир токсичний: у ньому чадний газ, сажа й продукти горіння пластику, меблів і проводки. Вітер розносить його по районах.',
      en: 'Smoke from burned flats is toxic: carbon monoxide, soot and what burning plastic, furniture and wiring give off. The wind spreads it across the districts.',
    },
  },
];

/** The fire stories of the war: shown on the map of Ukraine as strikes with their smoke. */
export const WAR_STORIES = ['front-2022', 'vasylkiv-2022', 'azot-2022', 'odesa-ports-2023', 'kyiv-2025'];

export const smokeSceneFor = (storyId: string) => SMOKE_SCENES.find((s) => s.storyId === storyId) ?? null;
