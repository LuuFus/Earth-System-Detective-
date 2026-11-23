// Events on the globe and in the news list: notable anomalies with when and where they happened,
// what happened, the main causes, the consequences and what can be done. Every statement follows
// the linked sources; nothing is inferred beyond them.
// Events tied to a layer show at any zoom while that layer is on, the rest when zoomed in.

import { photos, type Photo } from './photos';
import type { Text, VariableId } from './variables';

export type HintKind = 'fire' | 'water' | 'drought' | 'ice' | 'volcano' | 'air' | 'war' | 'heat' | 'forest' | 'light' | 'ozone' | 'flood';

/** A date as precise as it is known: YYYY-MM-DD, YYYY-MM or YYYY; `to` for a span. */
export type When = { from: string; to?: string };

export type Hint = {
  id: string;
  lat: number;
  lon: number;
  kind: HintKind;
  title: Text;
  /** When it happened, as exactly as the sources say. */
  when: When;
  /** Where exactly. */
  place: Text;
  /** In Ukraine: listed under "Ukraine" in the news. */
  ukraine?: boolean;
  /** What happened. */
  text: Text;
  /** The main causes, most important first. */
  causes: Text[];
  /** What it led to, with numbers where the sources give them. */
  effects: Text[];
  /** What can be done. */
  action?: Text;
  /** The layer that shows it; the event shows at any zoom while that layer is on. */
  layer?: VariableId;
  /** A layer on the globe for the exact day of the event (a monthly layer shows that month). */
  show?: { layer: VariableId; date: string; distance?: number };
  /** A fire story that replays the satellite fire points day by day. */
  storyId?: string;
  /** Opens the before/after shutter of night lights over Ukraine (2021 and 2022). */
  blackout?: boolean;
  photo?: Photo;
  sources: { label: string; url: string }[];
  /** Exact NASA imagery of the event day in NASA Worldview. */
  worldview?: string;
  /** An event in the Events panel that explores it further. */
  caseId?: string;
};

const wv = (layers: string, date: string, extent: string) => `https://worldview.earthdata.nasa.gov/?v=${extent}&l=${layers}&t=${date}`;
const FIRE_LAYERS = 'MODIS_Terra_CorrectedReflectance_TrueColor,VIIRS_SNPP_Thermal_Anomalies_375m_All';
const TRUE_LAYERS = 'MODIS_Terra_CorrectedReflectance_TrueColor';

const FIRMS = { label: 'NASA FIRMS, VIIRS 375 m', url: 'https://firms.modaps.eosdis.nasa.gov/' };
const CEOBS_KAKHOVKA = { label: 'CEOBS: Analysing the environmental consequences of the Kakhovka dam collapse', url: 'https://ceobs.org/analysing-the-environmental-consequences-of-the-kakhovka-dam-collapse/' };
const FORESTS = { label: 'Держлісагентство: наслідки агресії для лісів', url: 'https://forest.gov.ua/en/news/at-the-uns-main-global-forest-forum-in-new-york-the-consequences-of-russian-aggression-for-ukraines-forest-ecosystems-were-discussed' };
const GHG = { label: 'Initiative on GHG Accounting of War', url: 'https://planetarysecurityinitiative.org/news/climate-damage-caused-russias-war-ukraine-1' };

export const hints: Hint[] = [
  // ---------- Ukraine ----------
  {
    id: 'chornobyl-fires',
    lat: 51.35,
    lon: 30.1,
    kind: 'fire',
    layer: 'fires',
    ukraine: true,
    title: { uk: 'Пожежі в Чорнобильській зоні', en: 'Fires in the Chornobyl zone' },
    when: { from: '2020-04-04', to: '2020-04-28' },
    place: { uk: 'Зона відчуження й ліси Полісся, Київська й Житомирська області', en: 'The Exclusion Zone and the Polissia forests, Kyiv and Zhytomyr regions' },
    text: {
      uk: '4 квітня 2020 року в зоні відчуження загорілася суха трава. Вогонь понад два тижні йшов лісами Полісся й підходив на кілька кілометрів до ЧАЕС; гасили його сотні рятувальників з авіацією.',
      en: 'On 4 April 2020 dry grass caught fire in the Exclusion Zone. For more than two weeks the fire moved through the Polissia forests and came within a few kilometres of the Chornobyl plant; hundreds of firefighters fought it with aircraft.',
    },
    causes: [
      { uk: 'Підпал сухої трави людьми: поліція встановила підозрюваного, який підпалив траву «для розваги».', en: 'People setting dry grass alight: police identified a suspect who set grass on fire "for fun".' },
      { uk: 'Суха, майже безсніжна зима й весна та сильний вітер: вогонь швидко біг сухою травою й сосняками.', en: 'A dry, almost snowless winter and spring and a strong wind: the fire ran fast through dry grass and pine woods.' },
      { uk: 'У зоні мало доріг і людей, тож пожежі помічають і досягають пізно.', en: 'The zone has few roads and people, so fires are spotted and reached late.' },
    ],
    effects: [
      { uk: 'Дим кілька днів накривав Київ: 16–17 квітня місто мало одне з найбрудніших повітря серед великих міст світу.', en: 'Smoke covered Kyiv for several days: on 16-17 April the city had some of the dirtiest air of the world’s big cities.' },
      { uk: 'Дим із забруднених ділянок може піднімати радіоактивні частинки (передусім цезій-137) і переносити їх далеко; у Києві, за офіційними вимірюваннями, фон лишався в нормі.', en: 'Smoke from contaminated areas can lift radioactive particles (mostly caesium-137) and carry them far; in Kyiv official measurements kept the background within the norm.' },
      { uk: 'Згоріли тисячі гектарів лісу й покинуті села зони; за 26 днів супутник VIIRS зафіксував 4 079 пікселів вогню.', en: 'Thousands of hectares of forest and abandoned villages of the zone burned; over 26 days VIIRS recorded 4,079 fire pixels.' },
    ],
    action: {
      uk: 'Не палити суху траву, прокладати протипожежні смуги, патрулювати зону навесні й гасити осередки, поки вони малі.',
      en: 'Do not burn dry grass, plough firebreaks, patrol the zone in spring and put out fires while they are small.',
    },
    storyId: 'chornobyl-2020',
    show: { layer: 'fires', date: '2020-04-08', distance: 1.08 },
    photo: photos.chornobyl,
    sources: [{ label: 'NASA Earth Observatory: Fires Burn in Northern Ukraine', url: 'https://science.nasa.gov/earth/earth-observatory/fires-burn-in-northern-ukraine-146561/' }, FIRMS],
    worldview: wv(FIRE_LAYERS, '2020-04-08', '28.5,50.3,31.7,52.3'),
  },
  {
    id: 'field-burning',
    lat: 48.6,
    lon: 32.3,
    kind: 'fire',
    layer: 'fires',
    ukraine: true,
    title: { uk: 'Весняне паління полів: 552 пожежі за день', en: 'Spring field burning: 552 fires in a day' },
    when: { from: '2018-04-09' },
    place: { uk: 'Уся Україна, найбільше — центр, південь і схід', en: 'All of Ukraine, most of all the centre, south and east' },
    text: {
      uk: '9 квітня 2018 року супутниковий прилад VIIRS (Suomi NPP) нарахував у межах України 552 окремі осередки вогню — значно більше, ніж у сусідніх країнах. Здебільшого це були поля, які палили перед сівбою. Кнопка нижче покаже ці точки на глобусі саме за той день, а «історія пожеж» — як їх ставало більше день за днем у квітні 2018 року.',
      en: 'On 9 April 2018 the VIIRS instrument (Suomi NPP) counted 552 separate fire hotspots inside Ukraine — far more than in neighbouring countries. Most were fields burned before sowing. The button below shows these very points on the globe for that day, and the fire story how they multiplied day by day in April 2018.',
    },
    causes: [
      { uk: 'Найдешевший спосіб очистити поле: стерню, солому й торішню траву спалюють, щоб швидко підготувати землю до сівби.', en: 'The cheapest way to clear a field: stubble, straw and last year’s grass are burned to get the land ready for sowing quickly.' },
      { uk: 'Це масова практика: понад 57 % усіх пожеж, які VIIRS бачив в Україні у 2016–2017 роках, пов’язані з розчищенням полів перед сівбою й спаленням решток після жнив.', en: 'It is widespread: over 57% of all fires VIIRS saw in Ukraine in 2016-2017 were linked to clearing fields before sowing and burning crop remains after harvest.' },
      { uk: 'Суха весна й вітер: з поля вогонь легко перекидається на узбіччя, лісосмуги, ліси й торфовища.', en: 'A dry spring and wind: from a field the fire easily jumps to roadsides, shelter belts, forests and peat bogs.' },
    ],
    effects: [
      { uk: 'Дим із дрібним пилом PM2.5 і чадним газом погіршує повітря в містах за сотні кілометрів.', en: 'Smoke with fine PM2.5 particles and carbon monoxide worsens the air in cities hundreds of kilometres away.' },
      { uk: 'Згорає органічна речовина ґрунту, гинуть корисні комахи, черв’яки й гнізда птахів — поле стає біднішим.', en: 'The soil’s organic matter burns, useful insects, worms and bird nests die — the field becomes poorer.' },
      { uk: 'Вогонь з полів перекидається на ліси, села й дачі; щовесни рятувальники гасять тисячі таких пожеж.', en: 'Fire spreads from fields to forests, villages and summer houses; every spring firefighters put out thousands of such fires.' },
    ],
    action: {
      uk: 'Заорювати чи подрібнювати рештки, сіяти без оранки по стерні. Незаконне випалювання сухої рослинності карається штрафом (ст. 77-1 КУпАП); про пожежу дзвоніть 101.',
      en: 'Plough in or shred the remains, or sow straight into the stubble. Illegal burning of dry vegetation is fined (Code of Administrative Offences, art. 77-1); report a fire on 101.',
    },
    storyId: 'fields-2018',
    show: { layer: 'fires', date: '2018-04-09', distance: 1.55 },
    photo: photos.noBurn,
    sources: [
      { label: 'NASA: Fires in Ukraine Most Likely Agricultural in Nature', url: 'https://www.nasa.gov/image-article/fires-ukraine-most-likely-agricultural-nature/' },
      { label: 'Hall et al. 2021, Environmental Research Letters 16 064019', url: 'https://doi.org/10.1088/1748-9326/abfee1' },
      { label: 'КУпАП, ст. 77-1', url: 'https://zakon.rada.gov.ua/laws/show/80731-10' },
      FIRMS,
    ],
    worldview: wv(FIRE_LAYERS, '2018-04-09', '22,44,41,53'),
  },
  {
    id: 'luhansk-2020',
    lat: 48.95,
    lon: 39.0,
    kind: 'fire',
    layer: 'fires',
    ukraine: true,
    title: { uk: 'Лісові пожежі на Луганщині', en: 'Forest fires in the Luhansk region' },
    when: { from: '2020-09-30', to: '2020-10-08' },
    place: { uk: 'Станично-Луганський, Новоайдарський і Сєвєродонецький райони вздовж Сіверського Дінця', en: 'Stanytsia Luhanska, Novoaidar and Sievierodonetsk districts along the Siverskyi Donets' },
    text: {
      uk: '30 вересня 2020 року за посухи й сильного вітру на Луганщині одночасно спалахнули ліси й поля вздовж Сіверського Дінця. Останні осередки загасили лише 8 жовтня.',
      en: 'On 30 September 2020, in drought and strong wind, forests and fields along the Siverskyi Donets in the Luhansk region caught fire at once. The last fires were put out only on 8 October.',
    },
    causes: [
      { uk: 'Тривала посуха: ліси й трава на кінець літа повністю висохли.', en: 'A long drought: the forests and grass had dried out completely by the end of summer.' },
      { uk: 'Сильний вітер одночасно розносив вогонь з багатьох осередків.', en: 'A strong wind spread the fire from many places at once.' },
      { uk: 'Біля лінії розмежування багато мін і нерозірваних снарядів: пожежникам туди важко дістатися. Як саме виник вогонь, встановлювало слідство.', en: 'Near the contact line there are many mines and unexploded shells, so firefighters could hardly get there. How the fire started was a matter for the investigation.' },
    ],
    effects: [
      { uk: 'Загинули щонайменше 11 людей, ще 17 потрапили до лікарень з опіками й отруєнням чадним газом (дані на 1 жовтня 2020).', en: 'At least 11 people died and 17 more were taken to hospital with burns and carbon monoxide poisoning (as of 1 October 2020).' },
      { uk: 'До зони пожеж потрапили 32 населені пункти; згоріли житлові будинки й господарські споруди.', en: '32 settlements were in the fire zone; houses and farm buildings burned.' },
      { uk: 'Лише одна з пожеж, біля Боброве, Воронове й Боровського, пройшла близько 6 тис. га лісу.', en: 'Just one of the fires, near Bobrove, Voronove and Borovske, swept about 6,000 ha of forest.' },
    ],
    action: {
      uk: 'Протипожежні розриви в лісах, розмінування, раннє виявлення пожеж із супутників і дронів.',
      en: 'Firebreaks in the forests, demining, and early fire detection from satellites and drones.',
    },
    storyId: 'luhansk-2020',
    show: { layer: 'fires', date: '2020-10-01', distance: 1.08 },
    sources: [
      { label: 'Кабмін: пожежі в Луганській області ліквідовані', url: 'https://www.kmu.gov.ua/news/pozhezhi-v-prirodnih-ekosistemah-na-teritoriyi-luganskoyi-oblasti-yaki-vinikli-30-veresnya-ta-1-zhovtnya-likvidovani' },
      { label: 'АрміяInform: усі пожежі на Луганщині ліквідовані', url: 'https://armyinform.com.ua/2020/10/08/usi-pozhezhi-v-ekosystemah-luganskoyi-oblasti-likvidovani/' },
      FIRMS,
    ],
    worldview: wv(FIRE_LAYERS, '2020-10-01', '37.5,48.2,40.6,50'),
  },
  {
    id: 'front-fires-2022',
    lat: 47.6,
    lon: 36.2,
    kind: 'war',
    layer: 'fires',
    ukraine: true,
    title: { uk: 'Пожежі вздовж фронту', en: 'Fires along the front' },
    when: { from: '2022-02-24', to: '2022-11-30' },
    place: { uk: 'Південь і схід України: Херсонщина, Запоріжжя, Донбас, Харківщина', en: 'The south and east of Ukraine: Kherson, Zaporizhzhia, Donbas, Kharkiv regions' },
    text: {
      uk: 'Від початку повномасштабного вторгнення супутники щодня бачать смугу вогню, що тягнеться вздовж лінії фронту: горять поля, ліси й села. За 280 днів 2022 року VIIRS зафіксував на півдні й сході 25 114 осередків вогню.',
      en: 'Since the full-scale invasion began, satellites see a band of fire every day along the front line: fields, forests and villages burn. In 280 days of 2022 VIIRS recorded 25,114 fire detections in the south and east.',
    },
    causes: [
      { uk: 'Обстріли, ракети й дрони підпалюють суху траву, стерню й ліси.', en: 'Shelling, missiles and drones set dry grass, stubble and forests alight.' },
      { uk: 'Біля фронту пожежі ніхто не гасить: там стріляють, а землю заміновано.', en: 'Near the front nobody can fight the fires: there is shooting and the ground is mined.' },
      { uk: 'Покинуті поля заростають бур’яном, який улітку стає паливом.', en: 'Abandoned fields fill with weeds that become fuel in summer.' },
    ],
    effects: [
      { uk: 'Майже третина лісів України зазнала пошкоджень; на підконтрольній території війна спричинила лісові пожежі на ≈ 40 000 га.', en: 'Nearly a third of Ukraine’s forests have been damaged; on Ukrainian-controlled land the war caused forest fires over about 40,000 ha.' },
      { uk: 'Ландшафтні пожежі дали 49,4 млн т CO₂-еквіваленту — 21 % усіх викидів війни за перші три роки.', en: 'Landscape fires released 49.4 million t of CO₂-equivalent — 21% of the war’s emissions in its first three years.' },
      { uk: 'Згарища й міни роками не дають обробляти поля й відновлювати ліси.', en: 'Burned and mined land keeps fields from being farmed and forests from regrowing for years.' },
    ],
    action: {
      uk: 'Розмінування, відновлення лісів, облік шкоди довкіллю для майбутніх репарацій.',
      en: 'Demining, replanting forests, and recording the environmental damage for future reparations.',
    },
    storyId: 'front-2022',
    show: { layer: 'fires', date: '2022-08-20', distance: 1.25 },
    sources: [FIRMS, FORESTS, GHG],
  },
  {
    id: 'kakhovka',
    lat: 47.2,
    lon: 34.2,
    kind: 'war',
    layer: 'soil',
    ukraine: true,
    title: { uk: 'Руйнування Каховської ГЕС', en: 'The destruction of the Kakhovka dam' },
    when: { from: '2023-06-06' },
    place: { uk: 'Нова Каховка, Херсонська область; водосховище між Запоріжжям і Херсоном', en: 'Nova Kakhovka, Kherson region; the reservoir between Zaporizhzhia and Kherson' },
    text: {
      uk: 'Рано-вранці 6 червня 2023 року греблю Каховської ГЕС зруйновано. Вода затопила береги нижче за течією, а водосховище, що тримало 18 км³ води, за кілька тижнів перетворилося на поле мулу; канали, що брали з нього воду, зокрема Північнокримський, пересохли.',
      en: 'Early on 6 June 2023 the Kakhovka dam was destroyed. Water flooded the banks downstream, and the reservoir, which held 18 km³ of water, turned into a field of mud within weeks; the canals that drew water from it, including the North Crimean Canal, ran dry.',
    },
    causes: [
      { uk: 'Греблю, яку з 2022 року контролювали російські війська, зруйновано; Україна розслідує це як воєнний злочин.', en: 'The dam, held by Russian forces since 2022, was destroyed; Ukraine is investigating it as a war crime.' },
      { uk: 'Водосховище існувало лише завдяки греблі: без неї Дніпро повернувся у старе русло.', en: 'The reservoir existed only because of the dam: without it the Dnipro returned to its old bed.' },
    ],
    effects: [
      { uk: '6–9 червня затопило близько 620 км²; загинула 31 людина, понад 40 тисяч людей евакуювали.', en: 'About 620 km² flooded on 6-9 June; 31 people died and more than 40,000 were evacuated.' },
      { uk: 'До 18 червня витекло близько 75 % води; зрошувальні канали півдня, що поливали до 500 000 га полів, лишилися без води.', en: 'By 18 June about 75% of the water had drained; the southern irrigation canals, which watered up to 500,000 ha of fields, lost their water.' },
      { uk: 'Під воду пішли 88 небезпечних об’єктів і понад 90 % Нижньодніпровської дельти; мул і забруднення дійшли до Чорного моря.', en: '88 hazardous sites and over 90% of the Lower Dnipro Delta went under water; silt and pollution reached the Black Sea.' },
    ],
    action: {
      uk: 'Розмінувати береги, відновити водопостачання міст і зрошення; на колишньому дні вже швидко росте молодий ліс.',
      en: 'Clear the mines from the banks and restore water for towns and irrigation; a young forest is already growing fast on the former bed.',
    },
    show: { layer: 'truecolor', date: '2023-06-18', distance: 1.07 },
    photo: photos.kherson,
    sources: [{ label: 'NASA Earth Observatory: Canals in Ukraine are Drying Up', url: 'https://earthobservatory.nasa.gov/images/151622/canals-in-ukraine-are-drying-up' }, CEOBS_KAKHOVKA],
    worldview: wv(TRUE_LAYERS, '2023-06-18', '32,45.8,36,48.2'),
    caseId: 'kakhovka',
  },
  {
    id: 'kyiv-blackout',
    lat: 50.45,
    lon: 30.52,
    kind: 'light',
    layer: 'nightlights',
    ukraine: true,
    title: { uk: 'Блекаут після ударів по енергосистемі', en: 'Blackout after strikes on the power grid' },
    when: { from: '2022-11-23', to: '2022-11-25' },
    place: { uk: 'Уся Україна; на знімку — ніч на 25 листопада 2022', en: 'All of Ukraine; the image is the night of 25 November 2022' },
    text: {
      uk: 'Після масованих ракетних ударів по енергосистемі 23 листопада 2022 року більша частина України залишилася без світла. На нічному знімку VIIRS 25 листопада країна майже темна, а сусідні Молдова, Білорусь і Росія світяться. Кнопка нижче відкриє порівняння: ліворуч Україна 3 жовтня 2021 року, праворуч — 25 листопада 2022-го.',
      en: 'After massive missile strikes on the power grid on 23 November 2022 most of Ukraine lost power. On the VIIRS night image of 25 November the country is almost dark while neighbouring Moldova, Belarus and Russia glow. The button below opens the comparison: Ukraine on 3 October 2021 on the left, 25 November 2022 on the right.',
    },
    causes: [
      { uk: 'Російські ракетні й дронові удари по цивільній енергетиці: електростанціях і підстанціях.', en: 'Russian missile and drone strikes on civilian energy: power plants and substations.' },
      { uk: 'Підстанції з’єднують енергосистему в одне ціле; коли їх уражено, захисна автоматика вимикає цілі регіони, щоб зберегти мережу.', en: 'Substations tie the grid together; when they are hit, protection systems switch off whole regions to save the network.' },
    ],
    effects: [
      { uk: 'Мільйони людей залишилися без світла, а в багатьох містах — без води й опалення, бо насоси й котельні працюють від електрики.', en: 'Millions of people were left without power, and in many cities without water and heating, because pumps and boiler houses run on electricity.' },
      { uk: 'На тижні запроваджували графіки відключень; люди грілися й заряджали телефони в «пунктах незламності».', en: 'Scheduled outages lasted for weeks; people kept warm and charged phones at "invincibility points".' },
    ],
    action: {
      uk: 'Ремонт мереж, захист підстанцій, генератори й «пункти незламності», розподілена енергетика: сонячні панелі й невеликі станції.',
      en: 'Repair the grid, protect substations, generators and heated "invincibility points", and spread out power: solar panels and small plants.',
    },
    blackout: true,
    photo: photos.kyivDark,
    sources: [{ label: 'NASA Black Marble', url: 'https://blackmarble.gsfc.nasa.gov/' }],
    worldview: wv('VIIRS_SNPP_DayNightBand', '2022-11-25', '22,44,41,53'),
  },

  // ---------- the world: fires ----------
  {
    id: 'la-2025',
    lat: 34.12,
    lon: -118.35,
    kind: 'fire',
    layer: 'fires',
    title: { uk: 'Пожежі в Лос-Анджелесі', en: 'The Los Angeles fires' },
    when: { from: '2025-01-07', to: '2025-01-31' },
    place: { uk: 'Пасифік-Палісейдс і Альтадіна (поруч Пасадени), округ Лос-Анджелес, Каліфорнія, США', en: 'Pacific Palisades and Altadena (next to Pasadena), Los Angeles County, California, USA' },
    text: {
      uk: '7 січня 2025 року під час ураганного вітру Санта-Ана в Лос-Анджелесі спалахнули дві найбільші пожежі — Палісейдс на заході міста й Ітон в Альтадіні. Вітер гнав вогонь з пагорбів просто в житлові квартали. Повністю пожежі локалізували лише 31 січня. Подивіться точки вогню з супутника день за днем.',
      en: 'On 7 January 2025, during hurricane-force Santa Ana winds, the two largest fires broke out in Los Angeles — Palisades in the west of the city and Eaton in Altadena. The wind drove the fire from the hills straight into neighbourhoods. The fires were fully contained only on 31 January. Watch the satellite fire points day by day.',
    },
    causes: [
      { uk: 'Вітер Санта-Ана: сухий і дуже сильний вітер з пустель, що дме з гір до океану; пориви сягали понад 100 км/год, тож літаки не могли гасити вогонь.', en: 'The Santa Ana wind: a dry, very strong wind from the deserts blowing from the mountains to the ocean; gusts topped 100 km/h, so aircraft could not fight the fire.' },
      { uk: 'Багато палива: дві дуже дощові зими (2022–2024) виростили густі трави й чагарники, а потім спекотне літо й майже повна відсутність дощу з травня 2024 року їх висушили.', en: 'Plenty of fuel: two very wet winters (2022-2024) grew dense grass and brush, then a hot summer and almost no rain from May 2024 dried it out.' },
      { uk: 'Іскра: пожежу Палісейдс, за версією федеральних прокурорів, спричинило тління від підпалу 1 січня (пожежа Lachman), справа обвинуваченого в суді; причину пожежі Ітон розслідують, компанія Southern California Edison визнала можливий зв’язок зі своїм обладнанням ЛЕП.', en: 'The spark: federal prosecutors say the Palisades fire grew from smouldering remains of an arson on 1 January (the Lachman fire), and the case against the accused is in court; the Eaton fire’s cause is under investigation, and Southern California Edison acknowledged a possible link to its power-line equipment.' },
    ],
    effects: [
      { uk: 'Згоріло близько 15 000 га: Палісейдс — 23 448 акрів (≈ 9 500 га), Ітон — 14 021 акр (≈ 5 700 га).', en: 'About 15,000 ha burned: Palisades 23,448 acres (≈ 9,500 ha), Eaton 14,021 acres (≈ 5,700 ha).' },
      { uk: 'Знищено понад 16 000 будинків і споруд (≈ 6 800 у Палісейдс і ≈ 9 400 в Ітон) — одна з найруйнівніших пожеж в історії США.', en: 'Over 16,000 homes and buildings were destroyed (≈ 6,800 in Palisades and ≈ 9,400 in Eaton) — one of the most destructive fires in US history.' },
      { uk: 'Загинула 31 людина (12 — у Палісейдс, 19 — в Ітон); евакуювали понад 200 тисяч людей, дим тижнями погіршував повітря в усьому регіоні.', en: '31 people died (12 in Palisades, 19 in Eaton); more than 200,000 people were evacuated, and smoke fouled the air across the region for weeks.' },
    ],
    action: {
      uk: 'Прибирати суху рослинність біля будинків, будувати з негорючих матеріалів, вимикати ЛЕП під час сильного вітру, вчасно попереджати й евакуювати людей.',
      en: 'Clear dry vegetation around homes, build with non-flammable materials, switch off power lines in strong wind, and warn and evacuate people in time.',
    },
    storyId: 'la-2025',
    show: { layer: 'fires', date: '2025-01-08', distance: 1.03 },
    sources: [
      { label: 'NASA Earth Observatory: Fires Tear Through Los Angeles', url: 'https://earthobservatory.nasa.gov/images/153793/fires-tear-through-los-angeles' },
      { label: 'NASA Earth Observatory: Fuel for California Fires', url: 'https://earthobservatory.nasa.gov/images/153896/fuel-for-california-fires' },
      { label: 'LA County: Eaton & Palisades Fires anniversary fact sheet', url: 'https://file.lacounty.gov/SDSInter/lac/1199046_Eaton_Palisades_Fires_Anniversary_Fact_Sheet.pdf' },
      { label: 'U.S. Attorney’s Office: United States v. Jonathan Rinderknecht', url: 'https://www.justice.gov/usao-cdca/united-states-v-jonathan-rinderknecht' },
      FIRMS,
    ],
    worldview: wv(FIRE_LAYERS, '2025-01-08', '-119.2,33.7,-117.6,34.6'),
  },
  {
    id: 'maui-2023',
    lat: 20.88,
    lon: -156.68,
    kind: 'fire',
    layer: 'fires',
    title: { uk: 'Пожежа в Лахайні, Мауї', en: 'The Lahaina fire, Maui' },
    when: { from: '2023-08-08' },
    place: { uk: 'Місто Лахайна, острів Мауї, Гаваї, США', en: 'The town of Lahaina, Maui, Hawaii, USA' },
    text: {
      uk: '8 серпня 2023 року вогонь за кілька годин знищив історичне місто Лахайна. Супутник Landsat 8 о 22:25 того дня побачив, що горить майже все місто. Це найсмертоносніша лісова пожежа в США більш ніж за сто років.',
      en: 'On 8 August 2023 fire destroyed the historic town of Lahaina within hours. Landsat 8 at 10:25 p.m. that day saw almost the whole town burning. It is the deadliest US wildfire in more than a century.',
    },
    causes: [
      { uk: 'Дуже сильний вітер: між антициклоном на півночі й ураганом «Дора» далеко на півдні виник потік, що роздмухував вогонь.', en: 'A very strong wind: between a high-pressure system to the north and Hurricane Dora far to the south, a flow arose that fanned the fire.' },
      { uk: 'Суха трава: покинуті плантації заросли завезеними травами, які посуха перетворила на паливо.', en: 'Dry grass: abandoned plantations were overgrown with introduced grasses that the drought turned into fuel.' },
      { uk: 'Іскра: за розслідуванням пожежників і ATF, вогонь почався від обірваних вітром ліній електропередач, а вдень спалахнув знову з недогашених решток.', en: 'The spark: according to the fire department and ATF investigation, the fire started from power lines broken by the wind and flared up again in the afternoon from smouldering remains.' },
    ],
    effects: [
      { uk: 'Загинули 102 людини; згоріло близько 2 200 будівель, здебільшого житлових.', en: '102 people died; about 2,200 buildings burned, most of them homes.' },
      { uk: 'Тисячі людей втратили домівки; відбудова Лахайни триває роками.', en: 'Thousands of people lost their homes; rebuilding Lahaina is taking years.' },
    ],
    action: {
      uk: 'Скошувати й прибирати суху траву біля міст, вимикати ЛЕП під час штормового вітру, сирени й чіткі маршрути евакуації.',
      en: 'Mow and clear dry grass around towns, switch off power lines in gale-force wind, sirens and clear evacuation routes.',
    },
    show: { layer: 'truecolor', date: '2023-08-09', distance: 1.04 },
    sources: [{ label: 'NASA Earth Observatory: Devastation in Maui', url: 'https://science.nasa.gov/earth/earth-observatory/devastation-in-maui-151688/' }],
    worldview: wv(FIRE_LAYERS, '2023-08-08', '-157,20.5,-155.9,21.2'),
  },
  {
    id: 'canada-2023',
    lat: 52.5,
    lon: -75,
    kind: 'fire',
    layer: 'co',
    title: { uk: 'Рекордні пожежі в Канаді', en: 'Canada’s record fires' },
    when: { from: '2023-05', to: '2023-10' },
    place: { uk: 'Квебек, Альберта, Британська Колумбія й інші провінції Канади', en: 'Quebec, Alberta, British Columbia and other provinces of Canada' },
    text: {
      uk: 'За сезон 2023 року в Канаді згоріло близько 18,4 млн гектарів, більш ніж у 7 разів більше, ніж у середньому за рік. На початку червня дим дійшов до Нью-Йорка, і небо там стало помаранчевим.',
      en: 'In the 2023 season about 18.4 million hectares burned in Canada, more than 7 times the yearly average. In early June the smoke reached New York and turned its sky orange.',
    },
    causes: [
      { uk: 'Рання спека й посуха висушили ліси ще навесні.', en: 'Early heat and drought dried the forests already in spring.' },
      { uk: 'Блискавки за кілька днів запалили сотні пожеж у віддалених районах Квебеку; частину пожеж запалили люди.', en: 'Lightning lit hundreds of fires in remote parts of Quebec within days; people lit others.' },
      { uk: 'Пожеж було стільки, що гасили лише ті, що загрожували людям, — решта горіли місяцями.', en: 'There were so many fires that only those threatening people were fought — the rest burned for months.' },
    ],
    effects: [
      { uk: 'Близько 18,4 млн га згарищ — найбільший сезон пожеж в історії Канади; евакуювали понад 200 тисяч людей.', en: 'About 18.4 million ha burned — the largest fire season in Canada’s history; more than 200,000 people were evacuated.' },
      { uk: 'Дим погіршив повітря в США й дійшов до Європи; пожежі викинули рекордну кількість вуглецю.', en: 'The smoke fouled the air in the USA and reached Europe; the fires released a record amount of carbon.' },
    ],
    action: {
      uk: 'Прогноз пожежної небезпеки, контрольовані випалювання, евакуації; у димні дні — сидіти вдома й носити респіратор.',
      en: 'Fire-danger forecasts, prescribed burns, evacuations; on smoky days stay indoors and wear a respirator.',
    },
    storyId: 'quebec-2023',
    show: { layer: 'fires', date: '2023-06-06', distance: 1.3 },
    photo: photos.smokeNy,
    sources: [{ label: 'NASA Earth Observatory: Tracking Canada’s Extreme 2023 Fire Season', url: 'https://science.nasa.gov/earth/earth-observatory/tracking-canadas-extreme-2023-fire-season-151985/' }, FIRMS],
    worldview: wv(FIRE_LAYERS, '2023-06-06', '-82,45,-66,56'),
  },
  {
    id: 'evia-2021',
    lat: 38.85,
    lon: 23.35,
    kind: 'fire',
    layer: 'fires',
    title: { uk: 'Пожежі на Евбеї й біля Афін', en: 'Fires on Evia and near Athens' },
    when: { from: '2021-08-03', to: '2021-08-20' },
    place: { uk: 'Північ острова Евбея й передмістя Афін (Аттика), Греція', en: 'Northern Evia and the suburbs of Athens (Attica), Greece' },
    text: {
      uk: 'На початку серпня 2021 року, під час найсильнішої за десятиліття спеки, пожежі знищили соснові ліси півночі Евбеї й підступили до передмість Афін. Людей з узбережжя Евбеї вивозили поромами.',
      en: 'In early August 2021, during the worst heatwave in decades, fires destroyed the pine forests of northern Evia and reached the suburbs of Athens. People were taken off Evia’s coast by ferry.',
    },
    causes: [
      { uk: 'Тижнева спека понад 40 °C і посуха висушили ліси.', en: 'A week of heat over 40 °C and drought dried the forests.' },
      { uk: 'Сильний вітер і смолисті соснові ліси, що горять дуже швидко.', en: 'Strong wind and resinous pine forests that burn very fast.' },
      { uk: 'Одночасно горіли сотні пожеж по всій Греції, тож рятувальників і літаків не вистачало.', en: 'Hundreds of fires burned at once across Greece, so there were not enough firefighters and aircraft.' },
    ],
    effects: [
      { uk: 'На Евбеї згоріли десятки тисяч гектарів лісів, оливкових гаїв і пасік — основа життя півночі острова.', en: 'Tens of thousands of hectares of forests, olive groves and apiaries burned on Evia — the livelihood of the island’s north.' },
      { uk: 'Тисячі людей евакуювали, зокрема морем; згоріли будинки в багатьох селах.', en: 'Thousands of people were evacuated, some by sea; houses burned in many villages.' },
    ],
    action: {
      uk: 'Протипожежні смуги, догляд за лісом, більше літаків і раннє попередження під час спеки.',
      en: 'Firebreaks, forest management, more aircraft and early warnings during heatwaves.',
    },
    storyId: 'evia-2021',
    show: { layer: 'fires', date: '2021-08-06', distance: 1.06 },
    sources: [FIRMS],
    worldview: wv(FIRE_LAYERS, '2021-08-06', '22.5,37.6,24.6,39.3'),
  },
  {
    id: 'amazon-2019',
    lat: -9,
    lon: -56,
    kind: 'forest',
    layer: 'fires',
    title: { uk: 'Пожежі в Амазонії', en: 'Amazon fires' },
    when: { from: '2019-08' },
    place: { uk: 'Бразильська Амазонія: штати Пара, Мату-Гросу, Амазонас, Рондонія', en: 'The Brazilian Amazon: Pará, Mato Grosso, Amazonas and Rondônia states' },
    text: {
      uk: 'У серпні 2019 року супутники бачили в бразильській Амазонії більше пожеж, ніж на цей час року в будь-який рік з 2010-го. За часом і місцем вони більше схожі на розчищення землі, ніж на природні пожежі від посухи.',
      en: 'By August 2019 satellites had seen more fires in the Brazilian Amazon than by that point of any year since 2010. Their timing and location look more like land clearing than drought-driven wildfires.',
    },
    causes: [
      { uk: 'Вирубування й випалювання лісу під пасовища й поля: спершу дерева рубають, а коли вони висохнуть — підпалюють.', en: 'Cutting and burning forest for pasture and fields: trees are felled first and set alight once dry.' },
      { uk: 'Вологий тропічний ліс сам горить рідко — вогонь там здебільшого запалюють люди.', en: 'Wet rainforest rarely burns on its own — most fires there are lit by people.' },
    ],
    effects: [
      { uk: 'Ліс, що поглинав вуглець, перетворюється на джерело CO₂; гинуть рослини й тварини, яких немає більше ніде.', en: 'A forest that absorbed carbon becomes a source of CO₂; plants and animals found nowhere else die.' },
      { uk: 'Дим накривав міста за тисячі кілометрів — 19 серпня 2019 року вдень потемніло в Сан-Паулу.', en: 'Smoke covered cities thousands of kilometres away — on 19 August 2019 the daytime sky darkened in São Paulo.' },
    ],
    action: {
      uk: 'Супутниковий контроль вирубок, захист заповідників і земель корінних народів, відповідальність за незаконну вирубку.',
      en: 'Satellite monitoring of clearing, protecting reserves and Indigenous lands, and enforcing the law on illegal clearing.',
    },
    show: { layer: 'fires', date: '2019-08-15', distance: 1.6 },
    photo: photos.forest,
    sources: [{ label: 'NASA Earth Observatory: Uptick in Amazon Fire Activity in 2019', url: 'https://earthobservatory.nasa.gov/images/145498/uptick-in-amazon-fire-activity-in-2019' }],
    worldview: wv(FIRE_LAYERS, '2019-08-15', '-66,-15,-46,-3'),
  },

  // ---------- the world: water ----------
  {
    id: 'valencia-2024',
    lat: 39.4,
    lon: -0.55,
    kind: 'flood',
    layer: 'imerg',
    title: { uk: 'Повінь у Валенсії', en: 'The Valencia flood' },
    when: { from: '2024-10-29' },
    place: { uk: 'Провінція Валенсія (Чіва, Пайпорта, Утіель), Іспанія', en: 'Valencia province (Chiva, Paiporta, Utiel), Spain' },
    text: {
      uk: '29 жовтня 2024 року на провінцію Валенсія за кілька годин вилилося більше дощу, ніж зазвичай випадає за рік. У Чіві за 8 годин випало майже 500 мм. Раптові потоки по сухих руслах затопили передмістя Валенсії.',
      en: 'On 29 October 2024 more rain fell on Valencia province within hours than usually falls in a year. Chiva had nearly 500 mm in 8 hours. Flash floods down dry riverbeds swamped the suburbs of Valencia.',
    },
    causes: [
      { uk: '«DANA» — відірваний циклон: холодне повітря на висоті застрягло над теплим вологим Середземним морем і годинами лило дощ на одне місце.', en: 'A "DANA" cut-off low: cold air aloft got stuck over the warm, moist Mediterranean and poured rain on one place for hours.' },
      { uk: 'Дуже тепле після літа море дало більше вологи для злив.', en: 'A sea still very warm after summer gave more moisture for the downpours.' },
      { uk: 'Забудова в руслах сухих балок (рамбл) і запізнілі попередження для людей.', en: 'Building in dry ravine beds (ramblas) and late warnings to the public.' },
    ],
    effects: [
      { uk: 'Загинули понад 220 людей — одна з найсмертоносніших повеней в Європі за десятиліття.', en: 'More than 220 people died — one of Europe’s deadliest floods in decades.' },
      { uk: 'Потік зносив десятки тисяч автомобілів, затопив будинки, дороги й залізницю.', en: 'The water swept away tens of thousands of cars and flooded homes, roads and railways.' },
    ],
    action: {
      uk: 'Не будувати в руслах і заплавах, вчасно розсилати попередження на телефони, розширювати водовідвідні канали.',
      en: 'Do not build in riverbeds and floodplains, send warnings to phones in time, widen drainage channels.',
    },
    show: { layer: 'imerg', date: '2024-10-29', distance: 1.25 },
    sources: [
      { label: 'NASA Earth Observatory: Valencia Floods', url: 'https://science.nasa.gov/earth/earth-observatory/valencia-floods-153533' },
      { label: 'NASA Earth Observatory: A Week of Rain Across Spain', url: 'https://science.nasa.gov/earth/earth-observatory/a-week-of-rain-across-spain-153546' },
    ],
    worldview: wv('IMERG_Precipitation_Rate', '2024-10-29', '-3,38,2,41'),
  },
  {
    id: 'derna-2023',
    lat: 32.76,
    lon: 22.64,
    kind: 'flood',
    layer: 'imerg',
    title: { uk: 'Повінь у Дерні після прориву дамб', en: 'The Derna flood after the dams burst' },
    when: { from: '2023-09-10', to: '2023-09-11' },
    place: { uk: 'Місто Дерна у долині ваді Дерна, Лівія', en: 'The city of Derna in the Wadi Derna valley, Libya' },
    text: {
      uk: '10 вересня 2023 року середземноморський шторм «Даніель» обрушив на схід Лівії зливи. Уночі на 11 вересня дві дамби вище Дерни прорвало, і вода з грязюкою по вузькій долині змила цілі квартали міста в море.',
      en: 'On 10 September 2023 the Mediterranean storm Daniel poured heavy rain on eastern Libya. In the night of 11 September two dams above Derna burst, and water and mud rushed down the narrow valley and washed whole districts of the city into the sea.',
    },
    causes: [
      { uk: 'Шторм «Даніель» — «медікейн», середземноморський циклон, що перед тим затопив Грецію, Туреччину й Болгарію.', en: 'Storm Daniel — a "medicane", a Mediterranean cyclone that had already flooded Greece, Turkey and Bulgaria.' },
      { uk: 'Прорив двох старих дамб, які понад 20 років не обслуговували.', en: 'The failure of two old dams that had not been maintained for more than 20 years.' },
      { uk: 'Місто стоїть у гирлі вузької долини, сухої більшу частину року, тож вода пішла одним потоком.', en: 'The city sits at the mouth of a narrow valley that is dry most of the year, so the water came as one torrent.' },
    ],
    effects: [
      { uk: 'Загинули тисячі людей: оцінки різняться — від понад 4 тисяч підтверджених загиблих до понад 10 тисяч разом зі зниклими.', en: 'Thousands of people died: estimates differ — from over 4,000 confirmed deaths to over 10,000 including the missing.' },
      { uk: 'Знищено цілі квартали в центрі міста; десятки тисяч людей залишилися без домівок.', en: 'Whole districts in the city centre were destroyed; tens of thousands of people lost their homes.' },
    ],
    action: {
      uk: 'Обслуговувати й перевіряти дамби, раннє попередження й евакуація, не забудовувати русла ваді.',
      en: 'Maintain and inspect dams, early warnings and evacuation, no building in wadi beds.',
    },
    show: { layer: 'imerg', date: '2023-09-10', distance: 1.3 },
    sources: [
      { label: 'NASA Earth Observatory: Torrential Rain Wreaks Havoc in Libya', url: 'https://earthobservatory.nasa.gov/images/151826/torrential-rain-wreaks-havoc-in-libya' },
      { label: 'NASA Earth Observatory: Storm Aftermath in Derna, Libya', url: 'https://earthobservatory.nasa.gov/images/151851/storm-aftermath-in-derna-libya' },
    ],
    worldview: wv(TRUE_LAYERS, '2023-09-12', '20,31,25,33.5'),
  },
  {
    id: 'pakistan-2022',
    lat: 26.5,
    lon: 68.3,
    kind: 'flood',
    layer: 'imerg',
    title: { uk: 'Повені в Пакистані', en: 'Pakistan floods' },
    when: { from: '2022-06', to: '2022-08' },
    place: { uk: 'Провінції Сінд і Белуджистан, долина Інду, Пакистан', en: 'Sindh and Balochistan provinces, the Indus valley, Pakistan' },
    text: {
      uk: 'Мусонні зливи з червня по серпень 2022 року затопили величезні площі провінцій Сінд і Белуджистан; наприкінці серпня розлилося «озеро» на десятки кілометрів завширшки.',
      en: 'Monsoon downpours from June to August 2022 flooded huge areas of Sindh and Balochistan; by late August a "lake" tens of kilometres wide had spread out.',
    },
    causes: [
      { uk: 'Надзвичайно сильний мусон: дощів випало в рази більше за норму.', en: 'An extremely strong monsoon: several times the normal rain fell.' },
      { uk: 'Дослідники World Weather Attribution дійшли висновку, що зміна клімату, ймовірно, посилила найсильніші зливи.', en: 'World Weather Attribution researchers concluded that climate change likely made the heaviest rain worse.' },
      { uk: 'Рівнинна долина Інду дуже повільно відводить воду.', en: 'The flat Indus valley drains water very slowly.' },
    ],
    effects: [
      { uk: 'Загинули понад 1 700 людей; постраждали понад 30 мільйонів.', en: 'More than 1,700 people died; over 30 million were affected.' },
      { uk: 'Знищено врожаї й худобу, зруйновано дороги й мости; вода місяцями стояла на полях.', en: 'Crops and livestock were lost, roads and bridges destroyed; water stood on the fields for months.' },
    ],
    action: { uk: 'Раннє попередження, дамби й водовідведення, не забудовувати заплави.', en: 'Early warnings, levees and drainage, no building on floodplains.' },
    show: { layer: 'imerg', date: '2022-08-25', distance: 1.4 },
    photo: photos.pakistan,
    sources: [{ label: 'NASA Earth Observatory: Devastating Floods in Pakistan', url: 'https://earthobservatory.nasa.gov/images/150279/devastating-floods-in-pakistan' }],
  },
  {
    id: 'europe-drought-2022',
    lat: 45.05,
    lon: 10.2,
    kind: 'drought',
    layer: 'soil',
    title: { uk: 'Посуха в Європі', en: 'Europe’s drought' },
    when: { from: '2022-06', to: '2022-08' },
    place: { uk: 'Більша частина Європи; найсильніше — Італія (річка По), Франція, Іспанія', en: 'Most of Europe; worst in Italy (the Po), France and Spain' },
    text: {
      uk: 'Улітку 2022 року ґрунти пересохли на більшій частині Європи; найдовша річка Італії По місцями обміліла до піщаних кос. Об’єднаний дослідницький центр ЄС назвав цю посуху, ймовірно, найгіршою щонайменше за 500 років.',
      en: 'In summer 2022 soils dried out across most of Europe; Italy’s longest river, the Po, shrank to sandbars in places. The EU Joint Research Centre called it likely the worst drought in at least 500 years.',
    },
    causes: [
      { uk: 'Мало снігу й дощів узимку й навесні.', en: 'Little snow and rain in winter and spring.' },
      { uk: 'Кілька хвиль спеки влітку, що висушили ґрунт і річки.', en: 'Several summer heatwaves that dried out the soil and rivers.' },
      { uk: 'Посухи в Європі частішають з потеплінням клімату.', en: 'Droughts in Europe grow more frequent as the climate warms.' },
    ],
    effects: [
      { uk: 'Впали врожаї кукурудзи, соняшнику й сої; на річках зупинялося судноплавство.', en: 'Maize, sunflower and soybean harvests fell; shipping stopped on rivers.' },
      { uk: 'Мілкі й теплі річки не могли охолоджувати електростанції; бракувало води для ГЕС.', en: 'Shallow, warm rivers could not cool power plants; hydropower ran short of water.' },
    ],
    action: { uk: 'Збирати й зберігати воду, ощадне зрошення, посухостійкі культури.', en: 'Capture and store water, efficient irrigation, drought-tolerant crops.' },
    show: { layer: 'soil', date: '2022-08-01', distance: 1.9 },
    sources: [{ label: 'Copernicus European Drought Observatory (EU JRC)', url: 'https://drought.emergency.copernicus.eu/' }],
  },
  {
    id: 'aral',
    lat: 45.2,
    lon: 59.6,
    kind: 'drought',
    layer: 'truecolor',
    title: { uk: 'Аральське море', en: 'The Aral Sea' },
    when: { from: '1960', to: '2014' },
    place: { uk: 'Кордон Казахстану й Узбекистану, Центральна Азія', en: 'The border of Kazakhstan and Uzbekistan, Central Asia' },
    text: {
      uk: 'Колись четверте за площею озеро світу. У 1960-х воду його річок почали розбирати на зрошування, і море розпалося на кілька частин; у 2014 році східна частина Південного Аралу зникла повністю.',
      en: 'Once the fourth largest lake in the world. In the 1960s its rivers were diverted for irrigation and the sea broke into parts; in 2014 the eastern lobe of the South Aral Sea disappeared completely.',
    },
    causes: [
      { uk: 'Радянська програма зрошення бавовни й рису в пустелі забрала воду річок Амудар’я і Сирдар’я.', en: 'The Soviet programme to irrigate cotton and rice in the desert took the water of the Amu Darya and Syr Darya.' },
      { uk: 'Аралу не стало чим живитися: річки майже перестали доносити до нього воду, а випаровування лишилося.', en: 'The sea lost its supply: the rivers almost stopped reaching it while evaporation went on.' },
    ],
    effects: [
      { uk: 'На місці моря — пустеля Аралкум; вітер розносить з неї сіль і рештки добрив.', en: 'Where the sea was there is now the Aralkum desert; wind carries salt and fertiliser residues from it.' },
      { uk: 'Зникло рибальство, місцевий клімат став сухішим і різкішим, люди хворіють частіше.', en: 'Fishing disappeared, the local climate became drier and harsher, and people fall ill more often.' },
    ],
    action: {
      uk: 'Кокаральська дамба (2005) відділила Північний Арал, і його рівень помітно піднявся; ощадне зрошення повертає річкам воду.',
      en: 'The Kok-Aral dam (2005) separated the North Aral, and its level rose noticeably; efficient irrigation gives water back to the rivers.',
    },
    photo: photos.aral,
    sources: [{ label: 'NASA Earth Observatory: World of Change, Aral Sea', url: 'https://science.nasa.gov/earth/earth-observatory/world-of-change/aral-sea' }],
    caseId: 'aral',
  },
  {
    id: 'lake-chad',
    lat: 13.2,
    lon: 14.3,
    kind: 'drought',
    layer: 'soil',
    title: { uk: 'Озеро Чад', en: 'Lake Chad' },
    when: { from: '1963', to: '1987' },
    place: { uk: 'На межі Чаду, Нігеру, Нігерії й Камеруну', en: 'Where Chad, Niger, Nigeria and Cameroon meet' },
    text: {
      uk: 'У 1960-х озеро Чад займало щонайменше 22 000 км². До 1980-х, після років посухи, його площа скоротилася приблизно до 300 км².',
      en: 'In the 1960s Lake Chad covered at least 22,000 km². By the 1980s, after years of drought, its area fell to about 300 km².',
    },
    causes: [
      { uk: 'Посухи в Сахелі 1970–80-х років.', en: 'The Sahel droughts of the 1970s and 1980s.' },
      { uk: 'Забір води з річок, що живлять озеро, на зрошування.', en: 'Water taken from the rivers that feed the lake for irrigation.' },
      { uk: 'Озеро дуже мілке, тож кожен посушливий рік сильно зменшує його площу.', en: 'The lake is very shallow, so every dry year shrinks it a lot.' },
    ],
    effects: [
      { uk: 'Мільйони людей, що жили з риби, худоби й полів біля озера, втратили заробіток.', en: 'Millions of people who lived from fish, cattle and fields around the lake lost their livelihood.' },
      { uk: 'Боротьба за воду й землю загострила конфлікти в регіоні.', en: 'The struggle for water and land sharpened conflicts in the region.' },
    ],
    action: { uk: 'Спільне керування водою чотирьох країн басейну й ощадне зрошення.', en: 'Joint water management by the four basin countries and efficient irrigation.' },
    photo: photos.chad,
    sources: [{ label: 'NASA Earth Observatory: The Rise and Fall of Africa’s Great Lake', url: 'https://science.nasa.gov/earth/earth-observatory/lake-chad/' }],
  },
  {
    id: 'sahel',
    lat: 14.5,
    lon: 0,
    kind: 'drought',
    layer: 'ndvi',
    title: { uk: 'Сахель: посухи і повернення дощів', en: 'The Sahel: droughts and the return of rain' },
    when: { from: '1970', to: '1990' },
    place: { uk: 'Смуга на південь від Сахари: від Сенегалу до Судану', en: 'The belt south of the Sahara: from Senegal to Sudan' },
    text: {
      uk: 'З 1970 по 1990 рік у Сахелі тривали надзвичайно посушливі роки. З 1990-х дощі частково повернулися і рослинності стало більше, але рік від року опади дуже різні.',
      en: 'From 1970 to 1990 the Sahel had exceptionally dry years. From the 1990s the rains partly came back and vegetation returned, but rainfall varies a lot from year to year.',
    },
    causes: [
      { uk: 'Дощі тут приносить західноафриканський мусон, який сильно змінюється з року в рік.', en: 'Rain here comes with the West African monsoon, which varies a lot from year to year.' },
      { uk: 'Надмірний випас і вирубки оголюють ґрунт і погіршують наслідки посух.', en: 'Overgrazing and clearing lay the soil bare and make droughts worse.' },
    ],
    effects: [
      { uk: 'Голод 1970-х і 1980-х, загибель худоби, переселення мільйонів людей.', en: 'The famines of the 1970s and 1980s, dead livestock and millions of people on the move.' },
      { uk: 'Оголений ґрунт вивітрюється, і місцями наступає пустеля.', en: 'Bare soil blows away, and in places the desert advances.' },
    ],
    action: {
      uk: 'Фермери в Нігері відновлюють дерева на полях з пнів і коренів; проєкт «Велика зелена стіна» висаджує ліси поперек Африки.',
      en: 'Farmers in Niger regrow trees on their fields from stumps and roots; the Great Green Wall plants forest across Africa.',
    },
    photo: photos.sahel,
    sources: [{ label: 'NASA Earth Observatory: Defining Desertification', url: 'https://science.nasa.gov/earth/earth-observatory/defining-desertification/' }],
    caseId: 'sahel',
  },

  // ---------- the world: air, ice, heat, volcanoes ----------
  {
    id: 'hunga-tonga-2022',
    lat: -20.55,
    lon: -175.39,
    kind: 'volcano',
    layer: 'truecolor',
    title: { uk: 'Виверження вулкана Хунга-Тонга', en: 'The Hunga Tonga eruption' },
    when: { from: '2022-01-15' },
    place: { uk: 'Підводний вулкан Хунга-Тонга–Хунга-Хаапай, Тонга, Тихий океан', en: 'The undersea volcano Hunga Tonga-Hunga Ha’apai, Tonga, Pacific Ocean' },
    text: {
      uk: '15 січня 2022 року підводний вулкан біля Тонги вибухнув — це один із найпотужніших вибухів, які будь-коли записали сучасні прилади. Хмара піднялася на висоту до 57 км — до мезосфери; ударна хвиля кілька разів обійшла Землю.',
      en: 'On 15 January 2022 an undersea volcano near Tonga exploded — one of the most powerful blasts modern instruments have ever recorded. The plume rose up to 57 km — into the mesosphere; the shock wave circled the Earth several times.',
    },
    causes: [
      { uk: 'Магма зустрілася з морською водою: вода миттєво перетворилася на пару, і це підсилило вибух.', en: 'Magma met seawater: the water flashed to steam, which made the blast far stronger.' },
      { uk: 'Природне виверження вулкана на межі тектонічних плит.', en: 'A natural eruption of a volcano on a tectonic plate boundary.' },
    ],
    effects: [
      { uk: 'Вулкан закинув у стратосферу близько 146 млн тонн водяної пари — приблизно 10 % усієї води, що там є; вона триматиметься роками.', en: 'The volcano put about 146 million tonnes of water vapour into the stratosphere — roughly 10% of all the water there; it will stay for years.' },
      { uk: 'Цунамі накрило Тонгу й дійшло до узбереж усього Тихого океану; попіл засипав острови, обірвався підводний інтернет-кабель.', en: 'A tsunami hit Tonga and reached coasts around the Pacific; ash covered the islands and the undersea internet cable was cut.' },
      { uk: 'На відміну від Пінатубо, ця пара може трохи нагрівати, а не охолоджувати поверхню Землі.', en: 'Unlike Pinatubo, this vapour may slightly warm the Earth’s surface rather than cool it.' },
    ],
    action: { uk: 'Мережі датчиків цунамі, попередження для прибережних країн, супутникове стеження за вулканами.', en: 'Tsunami sensor networks, warnings for coastal countries, satellite watch of volcanoes.' },
    show: { layer: 'truecolor', date: '2022-01-15', distance: 1.6 },
    sources: [{ label: 'NASA JPL: Tonga Eruption Blasted Unprecedented Amount of Water Into Stratosphere', url: 'https://www.jpl.nasa.gov/news/tonga-eruption-blasted-unprecedented-amount-of-water-into-stratosphere' }],
    worldview: wv(TRUE_LAYERS, '2022-01-15', '-182,-26,-169,-15'),
  },
  {
    id: 'pinatubo',
    lat: 15.14,
    lon: 120.35,
    kind: 'volcano',
    layer: 'gistemp',
    title: { uk: 'Вулкан Пінатубо', en: 'Mount Pinatubo' },
    when: { from: '1991-06-15' },
    place: { uk: 'Острів Лусон, Філіппіни', en: 'Luzon island, the Philippines' },
    text: {
      uk: '15 червня 1991 року Пінатубо викинув у стратосферу близько 15 млн тонн сірчистого газу. Пелена крапельок сірчаної кислоти розійшлася довкола планети й охолодила її приблизно на 0,6 °C протягом наступних 15 місяців.',
      en: 'On 15 June 1991 Pinatubo put about 15 million tonnes of sulphur dioxide into the stratosphere. A haze of sulphuric acid droplets spread around the planet and cooled it by about 0.6 °C over the next 15 months.',
    },
    causes: [
      { uk: 'Природне виверження вулкана, що спав близько 500 років.', en: 'A natural eruption of a volcano that had slept for about 500 years.' },
      { uk: 'Крапельки в стратосфері відбивають частину сонячного світла назад у космос — тому планета охолола.', en: 'Droplets in the stratosphere reflect part of the sunlight back to space — that is why the planet cooled.' },
    ],
    effects: [
      { uk: 'Глобальна температура впала приблизно на 0,6 °C на 15 місяців — це видно на графіку GISTEMP у 1992 році.', en: 'Global temperature fell by about 0.6 °C for 15 months — visible on the GISTEMP chart in 1992.' },
      { uk: 'Попіл і грязьові потоки (лахари) зруйнували села й поля довкола вулкана.', en: 'Ash and mudflows (lahars) destroyed villages and fields around the volcano.' },
    ],
    action: {
      uk: 'Стеження за вулканами: прогноз виверження й евакуація врятували тисячі життів.',
      en: 'Watching volcanoes: the eruption forecast and evacuation saved thousands of lives.',
    },
    photo: photos.pinatubo,
    sources: [{ label: 'NASA Earth Observatory: Global Effects of Mount Pinatubo', url: 'https://science.nasa.gov/earth/earth-observatory/global-effects-of-mount-pinatubo-1510/' }],
  },
  {
    id: 'lockdown-no2',
    lat: 45.46,
    lon: 9.19,
    kind: 'air',
    layer: 'no2',
    title: { uk: 'Карантин: менше NO₂ над Італією', en: 'Lockdown: less NO₂ over Italy' },
    when: { from: '2020-03' },
    place: { uk: 'Північна Італія: Мілан і долина По', en: 'Northern Italy: Milan and the Po valley' },
    text: {
      uk: 'У березні 2020 року, під час карантину через COVID-19, супутник Sentinel-5P показав помітне падіння діоксиду азоту над Північною Італією.',
      en: 'In March 2020, during the COVID-19 lockdown, the Sentinel-5P satellite showed a clear drop in nitrogen dioxide over northern Italy.',
    },
    causes: [
      { uk: 'Карантин майже зупинив транспорт і частину заводів.', en: 'The lockdown almost stopped traffic and some industry.' },
      { uk: 'NO₂ живе в повітрі лише кілька годин, тож його кількість швидко відповідає на зменшення руху й виробництва.', en: 'NO₂ lasts only hours in the air, so it quickly follows less traffic and industry.' },
    ],
    effects: [
      { uk: 'Концентрації NO₂ над містами Італії впали приблизно на 40–50 % проти того самого часу 2019 року.', en: 'NO₂ over Italian cities fell by roughly 40-50% compared with the same time in 2019.' },
      { uk: 'Ефект був тимчасовим: щойно рух відновився, NO₂ повернувся.', en: 'The effect was temporary: once traffic returned, so did the NO₂.' },
    ],
    action: {
      uk: 'Показує, що чистіше міське повітря досяжне: громадський і електротранспорт, чистіша енергетика.',
      en: 'It shows cleaner city air is within reach: public and electric transport, cleaner energy.',
    },
    show: { layer: 'no2', date: '2020-03-20', distance: 1.4 },
    photo: photos.lockdown,
    sources: [{ label: 'ESA: Coronavirus lockdown leading to drop in pollution across Europe', url: 'https://www.esa.int/Applications/Observing_the_Earth/Copernicus/Sentinel-5P/Coronavirus_lockdown_leading_to_drop_in_pollution_across_Europe' }],
  },
  {
    id: 'florida-2023',
    lat: 24.8,
    lon: -80.9,
    kind: 'heat',
    layer: 'sst',
    title: { uk: 'Морська спека біля Флориди', en: 'Marine heatwave off Florida' },
    when: { from: '2023-07', to: '2023-08' },
    place: { uk: 'Флорида-Кіс, Мексиканська затока, США', en: 'The Florida Keys, Gulf of Mexico, USA' },
    text: {
      uk: 'Улітку 2023 року вода біля Флорида-Кіс тижнями була рекордно теплою, і NOAA оголошувала найвищі рівні тривоги щодо знебарвлення коралів.',
      en: 'In summer 2023 the water off the Florida Keys was record warm for weeks, and NOAA issued its highest coral bleaching alert levels.',
    },
    causes: [
      { uk: 'Морська спека на тлі потепління океану.', en: 'A marine heatwave on top of a warming ocean.' },
      { uk: 'Слабкий вітер і мілководдя: вода нагрівалася й не перемішувалася.', en: 'Light wind and shallow water: the water heated up and did not mix.' },
    ],
    effects: [
      { uk: 'Від перегріву корали виганяють водорості, що живуть у них і годують їх, і біліють; довгий перегрів їх убиває.', en: 'Overheated corals expel the algae that live in them and feed them, and turn white; long heat kills them.' },
      { uk: 'Масове знебарвлення рифів, від яких залежать риба, туризм і захист узбережжя від хвиль.', en: 'Mass bleaching of reefs that fish, tourism and coastal protection from waves depend on.' },
    ],
    action: {
      uk: 'Вчені рятували корали, переносячи їх у розплідники на суші; у довшій перспективі — скорочення викидів.',
      en: 'Scientists rescued corals by moving them to nurseries on land; in the long run, cutting emissions.',
    },
    show: { layer: 'sst', date: '2023-07-25', distance: 1.4 },
    photo: photos.coral,
    sources: [{ label: 'NOAA Coral Reef Watch', url: 'https://coralreefwatch.noaa.gov/' }],
  },
  {
    id: 'arctic-ice',
    lat: 82,
    lon: 10,
    kind: 'ice',
    layer: 'seaice',
    title: { uk: 'Морський лід Арктики', en: 'Arctic sea ice' },
    when: { from: '2026-09-12' },
    place: { uk: 'Північний Льодовитий океан', en: 'The Arctic Ocean' },
    text: {
      uk: '12 вересня 2026 року площа морського льоду в Арктиці була близько 4,6 млн км², на рівні десятого найменшого значення за всі роки супутникових спостережень. Товстого багаторічного льоду стає дедалі менше.',
      en: 'On 12 September 2026 Arctic sea ice covered about 4.6 million km², tied for the tenth lowest in the satellite record. Thick multiyear ice keeps declining.',
    },
    causes: [
      { uk: 'Потепління клімату від парникових газів; Арктика гріється в кілька разів швидше за планету в цілому.', en: 'Climate warming from greenhouse gases; the Arctic is warming several times faster than the planet as a whole.' },
      { uk: 'Темна вода поглинає більше сонця, ніж білий лід, тож що менше льоду, то швидше нагрівається океан.', en: 'Dark water absorbs more sunlight than white ice, so less ice makes the ocean warm faster.' },
    ],
    effects: [
      { uk: 'Тварини, що живуть на льоду (білі ведмеді, тюлені), втрачають місце для полювання й розмноження.', en: 'Animals that live on the ice (polar bears, seals) lose their hunting and breeding grounds.' },
      { uk: 'Тепліша Арктика змінює погоду й у помірних широтах та прискорює танення Гренландії.', en: 'A warmer Arctic changes weather at middle latitudes too and speeds up Greenland’s melting.' },
    ],
    action: { uk: 'Скорочувати викиди парникових газів.', en: 'Cut greenhouse gas emissions.' },
    photo: photos.meltPond,
    sources: [{ label: 'NASA Earth Observatory: Arctic Sea Ice Shrinks to Its 2026 Minimum', url: 'https://science.nasa.gov/earth/earth-observatory/arctic-sea-ice-shrinks-to-its-2026-minimum/' }],
    caseId: 'arctic',
  },
  {
    id: 'columbia-glacier',
    lat: 61.15,
    lon: -147.08,
    kind: 'ice',
    layer: 'snow',
    title: { uk: 'Льодовик Колумбія, Аляска', en: 'Columbia Glacier, Alaska' },
    when: { from: '1980', to: '2011' },
    place: { uk: 'Затока Принца Вільяма, Аляска, США', en: 'Prince William Sound, Alaska, USA' },
    text: {
      uk: 'Близько 1980 року льодовик втратив опору на мореному валу й почав швидко відступати; до 2011 року він розпався на два окремі льодовики.',
      en: 'Around 1980 the glacier lost its footing on a moraine and began a fast retreat; by 2011 it had split into two separate glaciers.',
    },
    causes: [
      { uk: 'Льодовик закінчується в морі: щойно край зійшов із мілини, вода почала відколювати айсберги набагато швидше.', en: 'The glacier ends in the sea: once its front left the shoal, the water calved icebergs off much faster.' },
      { uk: 'Потепління клімату підштовхнуло цей відступ.', en: 'A warming climate pushed the retreat along.' },
    ],
    effects: [
      { uk: 'Льодовик відступив приблизно на 20 км і втратив близько половини товщини.', en: 'The glacier retreated about 20 km and lost about half its thickness.' },
      { uk: 'Талий лід додає воду до океану й піднімає його рівень.', en: 'The melted ice adds water to the ocean and raises its level.' },
    ],
    action: { uk: 'Стежити за льодовиками з космосу й скорочувати викиди парникових газів.', en: 'Watch glaciers from space and cut greenhouse gas emissions.' },
    photo: photos.columbia,
    sources: [{ label: 'NASA Earth Observatory: World of Change, Columbia Glacier', url: 'https://science.nasa.gov/earth/earth-observatory/world-of-change/columbia-glacier/' }],
  },
  {
    id: 'ozone-hole',
    lat: -75.6,
    lon: -26.2,
    kind: 'ozone',
    layer: 'ozone',
    title: { uk: 'Озонова діра над Антарктидою', en: 'The Antarctic ozone hole' },
    when: { from: '1985' },
    place: { uk: 'Стратосфера над Антарктидою; відкрита зі станції Галлі', en: 'The stratosphere over Antarctica; discovered from Halley station' },
    text: {
      uk: 'Щовесни (у вересні–жовтні) озоновий шар над Антарктидою різко тоншає. Цю діру 1985 року описали британські вчені за вимірюваннями зі станції Галлі.',
      en: 'Every spring (September and October) the ozone layer over Antarctica thins sharply. British scientists described the hole in 1985 from measurements at Halley station.',
    },
    causes: [
      { uk: 'Фреони й інші речовини з хлором і бромом, які колись широко використовували в холодильниках і аерозолях.', en: 'CFCs and other chlorine and bromine compounds once widely used in fridges and sprays.' },
      { uk: 'У холодній полярній стратосфері на крижаних хмарах хлор і бром дуже швидко руйнують озон, щойно навесні з’являється Сонце.', en: 'In the cold polar stratosphere, on icy clouds, chlorine and bromine destroy ozone very fast as soon as the Sun returns in spring.' },
    ],
    effects: [
      { uk: 'Більше ультрафіолету доходить до поверхні: це шкодить шкірі, очам, рослинам і планктону.', en: 'More ultraviolet reaches the surface: it harms skin, eyes, plants and plankton.' },
      { uk: 'Діра щороку займає до 20–28 млн км² — більше за Антарктиду.', en: 'Each year the hole covers up to 20-28 million km² — more than Antarctica.' },
    ],
    action: {
      uk: 'Монреальський протокол 1987 року заборонив ці речовини; діра повільно затягується, повне відновлення над Антарктидою очікують близько 2066 року.',
      en: 'The 1987 Montreal Protocol banned these substances; the hole is slowly closing, with full recovery over Antarctica expected around 2066.',
    },
    show: { layer: 'ozone', date: '2025-10-01', distance: 2.6 },
    photo: photos.halley,
    sources: [{ label: 'NASA Ozone Watch', url: 'https://ozonewatch.gsfc.nasa.gov/' }],
    caseId: 'ozone',
  },
];

export const hintById = Object.fromEntries(hints.map((h) => [h.id, h])) as Record<string, Hint>;

/** Newest first, by the start of the event. */
export const hintsByDate = [...hints].sort((a, b) => (a.when.from < b.when.from ? 1 : a.when.from > b.when.from ? -1 : 0));

/** Colour and icon for each kind of event. */
export const HINT_KINDS: Record<HintKind, { color: string; icon: string }> = {
  fire: { color: '#ff7a1a', icon: 'fire' },
  forest: { color: '#3fae5a', icon: 'leaf' },
  water: { color: '#3d8bfd', icon: 'drop' },
  flood: { color: '#3d8bfd', icon: 'drop' },
  drought: { color: '#d9a13b', icon: 'sun' },
  ice: { color: '#7cc4f2', icon: 'snow' },
  volcano: { color: '#e5483b', icon: 'mountain' },
  air: { color: '#a78bfa', icon: 'air' },
  war: { color: '#ffd23f', icon: 'ukraine' },
  heat: { color: '#ff5a5f', icon: 'temp' },
  light: { color: '#ffc94d', icon: 'bulb' },
  ozone: { color: '#5ec7c1', icon: 'sun' },
};

/** The news topics: each event belongs to one or more. */
export type NewsTopic = 'all' | 'ukraine' | 'fire' | 'water' | 'air' | 'ice';
export function inTopic(h: Hint, topic: NewsTopic): boolean {
  switch (topic) {
    case 'all':
      return true;
    case 'ukraine':
      return !!h.ukraine;
    case 'fire':
      return h.kind === 'fire' || h.kind === 'forest' || h.layer === 'fires';
    case 'water':
      return h.kind === 'flood' || h.kind === 'water' || h.kind === 'drought';
    case 'air':
      return h.kind === 'air' || h.kind === 'ozone' || h.kind === 'volcano' || h.kind === 'light';
    case 'ice':
      return h.kind === 'ice' || h.kind === 'heat';
  }
}

const MONTHS: Record<'uk' | 'en', { of: string[]; name: string[] }> = {
  uk: {
    of: ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'],
    name: ['січень', 'лютий', 'березень', 'квітень', 'травень', 'червень', 'липень', 'серпень', 'вересень', 'жовтень', 'листопад', 'грудень'],
  },
  en: {
    of: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    name: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  },
};

/**
 * The event's date in words, as precise as it is known: "7–31 січня 2025", "29 липня – 20 серпня
 * 2021", "червень–серпень 2022", "1960–2014".
 */
export function whenText(when: When, lang: 'uk' | 'en'): string {
  const m = MONTHS[lang];
  const parse = (s: string) => ({ y: s.slice(0, 4), mo: s.length >= 7 ? Number(s.slice(5, 7)) - 1 : -1, d: s.length >= 10 ? Number(s.slice(8, 10)) : 0 });
  const a = parse(when.from);
  const b = when.to ? parse(when.to) : null;
  const dash = '–';
  if (a.mo < 0) return b ? `${a.y}${dash}${b.y}` : a.y;
  if (!a.d) {
    if (!b) return `${m.name[a.mo]} ${a.y}`;
    return a.y === b.y ? `${m.name[a.mo]}${dash}${m.name[b.mo]} ${a.y}` : `${m.name[a.mo]} ${a.y} ${dash} ${m.name[b.mo]} ${b.y}`;
  }
  const day = (p: { y: string; mo: number; d: number }, year = true) => `${p.d} ${m.of[p.mo]}${year ? ` ${p.y}` : ''}`;
  if (!b) return day(a);
  if (a.y === b.y && a.mo === b.mo) return `${a.d}${dash}${b.d} ${m.of[a.mo]} ${a.y}`;
  if (a.y === b.y) return `${day(a, false)} ${dash} ${day(b)}`;
  return `${day(a)} ${dash} ${day(b)}`;
}
