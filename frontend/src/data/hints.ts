// Events on the globe: notable anomalies with what happened, why, who or what caused it and what
// can be done. Every statement follows the linked sources; nothing is inferred beyond them.
// Events tied to a layer show at any zoom while that layer is on, the rest when zoomed in.

import { photos, type Photo } from './photos';
import type { Text, VariableId } from './variables';

export type HintKind = 'fire' | 'water' | 'drought' | 'ice' | 'volcano' | 'air' | 'war' | 'heat' | 'forest' | 'light' | 'ozone' | 'flood';

export type Hint = {
  id: string;
  lat: number;
  lon: number;
  kind: HintKind;
  title: Text;
  /** What happened. */
  text: Text;
  why?: Text;
  /** Who or what caused it. */
  cause?: Text;
  /** What can be done. */
  action?: Text;
  /** The layer that shows it; the event shows at any zoom while that layer is on. */
  layer?: VariableId;
  photo?: Photo;
  sources: { label: string; url: string }[];
  /** Exact NASA imagery of the event day in NASA Worldview. */
  worldview?: string;
  /** An event in the Events panel that explores it further. */
  caseId?: string;
};

const wv = (layers: string, date: string, extent: string) => `https://worldview.earthdata.nasa.gov/?v=${extent}&l=${layers}&t=${date}`;
const FIRE_LAYERS = 'MODIS_Terra_CorrectedReflectance_TrueColor,VIIRS_SNPP_Thermal_Anomalies_375m_All';

export const hints: Hint[] = [
  {
    id: 'chornobyl-fires',
    lat: 51.35,
    lon: 30.1,
    kind: 'fire',
    layer: 'fires',
    title: { uk: 'Пожежі в Чорнобильській зоні, 2020', en: 'Fires in the Chornobyl zone, 2020' },
    text: {
      uk: 'У квітні 2020 року понад тиждень горіли ліси біля Чорнобильської зони відчуження; їх гасили сотні рятувальників і авіація. Дим із забруднених ділянок може піднімати радіоактивні частинки й переносити їх далеко.',
      en: 'In April 2020 forests near the Chornobyl Exclusion Zone burned for more than a week; hundreds of firefighters and aircraft fought them. Smoke from contaminated areas can lift radioactive particles and carry them far.',
    },
    why: {
      uk: 'Суха весна й сильний вітер швидко розносили вогонь сухою травою й соснами Полісся, а в зоні мало доріг для пожежних машин.',
      en: 'A dry spring and strong wind carried the fire fast through dry grass and the pines of Polissia, and the zone has few roads for fire engines.',
    },
    cause: { uk: 'Пожежі почалися з підпалу сухої трави людьми; поліція встановила підозрюваного.', en: 'The fires began with people setting dry grass alight; police identified a suspect.' },
    action: {
      uk: 'Не палити суху траву, прокладати протипожежні смуги, патрулювати зону навесні й гасити осередки, поки вони малі.',
      en: 'Do not burn dry grass, plough firebreaks, patrol the zone in spring and put out fires while they are small.',
    },
    photo: photos.chornobyl,
    sources: [{ label: 'NASA Earth Observatory: Fires Burn in Northern Ukraine', url: 'https://science.nasa.gov/earth/earth-observatory/fires-burn-in-northern-ukraine-146561/' }],
    worldview: wv(FIRE_LAYERS, '2020-04-08', '28.5,50.3,31.7,52.3'),
  },
  {
    id: 'field-burning',
    lat: 48.6,
    lon: 32.3,
    kind: 'fire',
    layer: 'fires',
    title: { uk: 'Весняне паління полів', en: 'Spring field burning' },
    text: {
      uk: 'Навесні супутники щороку бачать в Україні сотні вогнищ на полях: так спалюють стерню й суху траву перед сівбою. 9 квітня 2018 року прилад VIIRS нарахував в Україні 552 такі точки; у сусідніх країнах їх було значно менше.',
      en: 'Every spring satellites see hundreds of field fires in Ukraine: stubble and dry grass are burned before sowing. On 9 April 2018 VIIRS counted 552 such hotspots in Ukraine, far more than in neighbouring countries.',
    },
    why: { uk: 'Вогонь — найдешевший спосіб швидко очистити поле від решток урожаю.', en: 'Fire is the cheapest way to clear crop remains from a field quickly.' },
    cause: {
      uk: 'Ті, хто випалює поля й узбіччя. В Україні незаконне випалювання сухої рослинності карається штрафом.',
      en: 'Whoever burns fields and roadsides. In Ukraine illegal burning of dry vegetation is fined.',
    },
    action: {
      uk: 'Заорювати чи подрібнювати рештки, сіяти без оранки по стерні; дим від паління погіршує повітря на сотні кілометрів.',
      en: 'Plough in or shred the remains, or sow straight into the stubble; the smoke worsens the air for hundreds of kilometres.',
    },
    photo: photos.noBurn,
    sources: [
      { label: 'NASA: Fires in Ukraine Most Likely Agricultural in Nature', url: 'https://www.nasa.gov/image-feature/goddard/2018/fires-in-ukraine-most-likely-agricultural-in-nature' },
      { label: 'КУпАП, ст. 77-1', url: 'https://zakon.rada.gov.ua/laws/show/80731-10' },
    ],
    worldview: wv(FIRE_LAYERS, '2018-04-09', '22,44,41,53'),
  },
  {
    id: 'kakhovka',
    lat: 47.2,
    lon: 34.2,
    kind: 'war',
    layer: 'soil',
    title: { uk: 'Каховське водосховище після 6 червня 2023', en: 'The Kakhovka Reservoir after 6 June 2023' },
    text: {
      uk: 'Після руйнування греблі водосховище здебільшого спорожніло, і канали, що брали з нього воду, зокрема Північнокримський, пересохли. Вода з затоплених сіл і полів нижче за течією зійшла за кілька тижнів.',
      en: 'After the dam was destroyed the reservoir mostly emptied, and the canals that drew water from it, including the North Crimean Canal, ran dry. Floodwater downstream receded within weeks.',
    },
    why: {
      uk: 'Водосховище існувало лише завдяки греблі; без неї Дніпро повернувся у старе русло, а зрошувальні канали півдня лишилися без води.',
      en: 'The reservoir existed only because of the dam; without it the Dnipro returned to its old bed and the irrigation canals of the south lost their water.',
    },
    cause: {
      uk: 'Греблю Каховської ГЕС, яку з 2022 року контролювали російські війська, зруйновано 6 червня 2023 року; Україна розслідує це як воєнний злочин.',
      en: 'The Kakhovka dam, held by Russian forces since 2022, was destroyed on 6 June 2023; Ukraine is investigating it as a war crime.',
    },
    action: {
      uk: 'Розмінувати береги, відновити водопостачання міст і зрошення; на колишньому дні вже швидко росте молодий ліс.',
      en: 'Clear the mines from the banks and restore water for towns and irrigation; a young forest is already growing fast on the former bed.',
    },
    photo: photos.kherson,
    sources: [{ label: 'NASA Earth Observatory: Canals in Ukraine are Drying Up', url: 'https://earthobservatory.nasa.gov/images/151622/canals-in-ukraine-are-drying-up' }],
    caseId: 'kakhovka',
  },
  {
    id: 'kyiv-blackout',
    lat: 50.45,
    lon: 30.52,
    kind: 'light',
    layer: 'nightlights',
    title: { uk: 'Блекаут, листопад 2022', en: 'Blackout, November 2022' },
    text: {
      uk: 'Після масованих ракетних ударів по енергосистемі 23 листопада 2022 року більша частина України залишилася без світла. На нічному знімку VIIRS 25 листопада країна майже темна, а сусідні Молдова, Білорусь і Росія світяться.',
      en: 'After massive missile strikes on the power grid on 23 November 2022 most of Ukraine lost power. On the VIIRS night image of 25 November the country is almost dark while neighbouring Moldova, Belarus and Russia glow.',
    },
    why: { uk: 'Удари поцілили в електростанції й підстанції, що з’єднують енергосистему.', en: 'The strikes hit power plants and the substations that tie the grid together.' },
    cause: { uk: 'Російські ракетні й дронові удари по цивільній енергетиці.', en: 'Russian missile and drone strikes on civilian energy infrastructure.' },
    action: {
      uk: 'Ремонт мереж, захист підстанцій, генератори й «пункти незламності», розподілена енергетика: сонячні панелі й невеликі станції.',
      en: 'Repair the grid, protect substations, generators and heated "invincibility points", and spread out power: solar panels and small plants.',
    },
    photo: photos.kyivDark,
    sources: [{ label: 'NASA Black Marble', url: 'https://blackmarble.gsfc.nasa.gov/' }],
  },
  {
    id: 'aral',
    lat: 45.2,
    lon: 59.6,
    kind: 'drought',
    layer: 'truecolor',
    title: { uk: 'Аральське море', en: 'The Aral Sea' },
    text: {
      uk: 'Колись четверте за площею озеро світу. У 1960-х воду його річок почали розбирати на зрошування, і море розпалося на кілька частин; у 2014 році східна частина Південного Аралу зникла повністю.',
      en: 'Once the fourth largest lake in the world. In the 1960s its rivers were diverted for irrigation and the sea broke into parts; in 2014 the eastern lobe of the South Aral Sea disappeared completely.',
    },
    why: { uk: 'Аралу не стало чим живитися: Амудар’я й Сирдар’я майже перестали доносити до нього воду.', en: 'The sea lost its supply: the Amu Darya and Syr Darya almost stopped reaching it.' },
    cause: { uk: 'Радянська програма зрошення бавовни й рису в пустелі, що забрала воду річок.', en: 'The Soviet programme to irrigate cotton and rice in the desert, which took the rivers’ water.' },
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
    text: {
      uk: 'У 1960-х озеро Чад займало щонайменше 22 000 км². До 1980-х, після років посухи, його площа скоротилася приблизно до 300 км².',
      en: 'In the 1960s Lake Chad covered at least 22,000 km². By the 1980s, after years of drought, its area fell to about 300 km².',
    },
    why: { uk: 'Озеро дуже мілке, тож кожен посушливий рік сильно зменшує його площу.', en: 'The lake is very shallow, so every dry year shrinks it a lot.' },
    cause: { uk: 'Посухи в Сахелі 1970–80-х і забір води з річок, що його живлять, на зрошування.', en: 'The Sahel droughts of the 1970s and 1980s, and water taken from its rivers for irrigation.' },
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
    text: {
      uk: 'З 1970 по 1990 рік у Сахелі тривали надзвичайно посушливі роки. З 1990-х дощі частково повернулися і рослинності стало більше, але рік від року опади дуже різні.',
      en: 'From 1970 to 1990 the Sahel had exceptionally dry years. From the 1990s the rains partly came back and vegetation returned, but rainfall varies a lot from year to year.',
    },
    why: { uk: 'Дощі тут приносить західноафриканський мусон, який сильно змінюється з року в рік.', en: 'Rain here comes with the West African monsoon, which varies a lot from year to year.' },
    cause: { uk: 'Природні коливання мусону; надмірний випас і вирубки погіршують наслідки посух.', en: 'Natural swings of the monsoon; overgrazing and clearing make droughts worse.' },
    action: {
      uk: 'Фермери в Нігері відновлюють дерева на полях з пнів і коренів; проєкт «Велика зелена стіна» висаджує ліси поперек Африки.',
      en: 'Farmers in Niger regrow trees on their fields from stumps and roots; the Great Green Wall plants forest across Africa.',
    },
    photo: photos.sahel,
    sources: [{ label: 'NASA Earth Observatory: Defining Desertification', url: 'https://science.nasa.gov/earth/earth-observatory/defining-desertification/' }],
    caseId: 'sahel',
  },
  {
    id: 'pinatubo',
    lat: 15.14,
    lon: 120.35,
    kind: 'volcano',
    layer: 'gistemp',
    title: { uk: 'Вулкан Пінатубо, 1991', en: 'Mount Pinatubo, 1991' },
    text: {
      uk: 'У червні 1991 року Пінатубо викинув у стратосферу близько 15 млн тонн сірчистого газу. Пелена крапельок сірчаної кислоти розійшлася довкола планети й охолодила її приблизно на 0,6 °C протягом наступних 15 місяців.',
      en: 'In June 1991 Pinatubo put about 15 million tonnes of sulphur dioxide into the stratosphere. A haze of sulphuric acid droplets spread around the planet and cooled it by about 0.6 °C over the next 15 months.',
    },
    why: { uk: 'Крапельки в стратосфері відбивають частину сонячного світла назад у космос.', en: 'Droplets in the stratosphere reflect part of the sunlight back to space.' },
    cause: { uk: 'Природне виверження вулкана.', en: 'A natural volcanic eruption.' },
    action: {
      uk: 'Стеження за вулканами: прогноз виверження й евакуація врятували тисячі життів.',
      en: 'Watching volcanoes: the eruption forecast and evacuation saved thousands of lives.',
    },
    photo: photos.pinatubo,
    sources: [{ label: 'NASA Earth Observatory: Global Effects of Mount Pinatubo', url: 'https://science.nasa.gov/earth/earth-observatory/global-effects-of-mount-pinatubo-1510/' }],
  },
  {
    id: 'amazon-2019',
    lat: -9,
    lon: -56,
    kind: 'forest',
    layer: 'fires',
    title: { uk: 'Пожежі в Амазонії, 2019', en: 'Amazon fires, 2019' },
    text: {
      uk: 'У серпні 2019 року супутники бачили в бразильській Амазонії більше пожеж, ніж на цей час року в будь-який рік з 2010-го. За часом і місцем вони більше схожі на розчищення землі, ніж на природні пожежі від посухи.',
      en: 'By August 2019 satellites had seen more fires in the Brazilian Amazon than by that point of any year since 2010. Their timing and location look more like land clearing than drought-driven wildfires.',
    },
    why: { uk: 'Вологий тропічний ліс сам горить рідко; вогонь там здебільшого запалюють люди.', en: 'Wet rainforest rarely burns on its own; most fires there are lit by people.' },
    cause: { uk: 'Вирубування й випалювання лісу під пасовища й поля.', en: 'Cutting and burning forest for pasture and fields.' },
    action: {
      uk: 'Супутниковий контроль вирубок, захист заповідників і земель корінних народів, відповідальність за незаконну вирубку.',
      en: 'Satellite monitoring of clearing, protecting reserves and Indigenous lands, and enforcing the law on illegal clearing.',
    },
    photo: photos.forest,
    sources: [{ label: 'NASA Earth Observatory: Uptick in Amazon Fire Activity in 2019', url: 'https://earthobservatory.nasa.gov/images/145498/uptick-in-amazon-fire-activity-in-2019' }],
    worldview: wv(FIRE_LAYERS, '2019-08-15', '-66,-15,-46,-3'),
  },
  {
    id: 'canada-2023',
    lat: 52.5,
    lon: -75,
    kind: 'fire',
    layer: 'co',
    title: { uk: 'Рекордні пожежі в Канаді, 2023', en: 'Canada’s record fires, 2023' },
    text: {
      uk: 'За сезон 2023 року в Канаді згоріло близько 18,4 млн гектарів, більш ніж у 7 разів більше, ніж у середньому за рік. На початку червня дим дійшов до Нью-Йорка, і небо там стало помаранчевим.',
      en: 'In the 2023 season about 18.4 million hectares burned in Canada, more than 7 times the yearly average. In early June the smoke reached New York and turned its sky orange.',
    },
    why: { uk: 'Рання спека й посуха висушили ліси, тож вогонь швидко поширювався й горів місяцями.', en: 'Early heat and drought dried the forests, so fire spread fast and burned for months.' },
    cause: { uk: 'Багато пожеж запалили блискавки у віддалених районах, частину — люди.', en: 'Lightning lit many fires in remote areas, people lit others.' },
    action: {
      uk: 'Прогноз пожежної небезпеки, контрольовані випалювання, евакуації; у димні дні — сидіти вдома й носити респіратор.',
      en: 'Fire-danger forecasts, prescribed burns, evacuations; on smoky days stay indoors and wear a respirator.',
    },
    photo: photos.smokeNy,
    sources: [{ label: 'NASA Earth Observatory: Tracking Canada’s Extreme 2023 Fire Season', url: 'https://science.nasa.gov/earth/earth-observatory/tracking-canadas-extreme-2023-fire-season-151985/' }],
    worldview: wv(FIRE_LAYERS, '2023-06-06', '-82,45,-66,56'),
  },
  {
    id: 'arctic-ice',
    lat: 82,
    lon: 10,
    kind: 'ice',
    layer: 'seaice',
    title: { uk: 'Морський лід Арктики', en: 'Arctic sea ice' },
    text: {
      uk: '12 вересня 2026 року площа морського льоду в Арктиці була близько 4,6 млн км², на рівні десятого найменшого значення за всі роки супутникових спостережень. Товстого багаторічного льоду стає дедалі менше.',
      en: 'On 12 September 2026 Arctic sea ice covered about 4.6 million km², tied for the tenth lowest in the satellite record. Thick multiyear ice keeps declining.',
    },
    why: { uk: 'Темна вода поглинає більше сонця, ніж білий лід, тож що менше льоду, то швидше нагрівається океан.', en: 'Dark water absorbs more sunlight than white ice, so less ice makes the ocean warm faster.' },
    cause: { uk: 'Потепління клімату від парникових газів; Арктика гріється в кілька разів швидше за планету в цілому.', en: 'Climate warming from greenhouse gases; the Arctic is warming several times faster than the planet as a whole.' },
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
    text: {
      uk: 'Близько 1980 року льодовик втратив опору на мореному валу й почав швидко відступати; до 2011 року він розпався на два окремі льодовики.',
      en: 'Around 1980 the glacier lost its footing on a moraine and began a fast retreat; by 2011 it had split into two separate glaciers.',
    },
    why: { uk: 'Льодовик закінчується в морі: щойно край зійшов із мілини, вода почала відколювати айсберги набагато швидше.', en: 'The glacier ends in the sea: once its front left the shoal, the water calved icebergs off much faster.' },
    cause: { uk: 'Динаміка морських льодовиків на тлі потепління клімату.', en: 'The dynamics of tidewater glaciers against a warming climate.' },
    action: { uk: 'Стежити за льодовиками з космосу й скорочувати викиди парникових газів.', en: 'Watch glaciers from space and cut greenhouse gas emissions.' },
    photo: photos.columbia,
    sources: [{ label: 'NASA Earth Observatory: World of Change, Columbia Glacier', url: 'https://science.nasa.gov/earth/earth-observatory/world-of-change/columbia-glacier/' }],
  },
  {
    id: 'lockdown-no2',
    lat: 45.46,
    lon: 9.19,
    kind: 'air',
    layer: 'no2',
    title: { uk: 'Карантин 2020: менше NO₂ над Італією', en: 'Lockdown 2020: less NO₂ over Italy' },
    text: {
      uk: 'У березні 2020 року, під час карантину через COVID-19, супутник Sentinel-5P показав помітне падіння діоксиду азоту над Північною Італією.',
      en: 'In March 2020, during the COVID-19 lockdown, the Sentinel-5P satellite showed a clear drop in nitrogen dioxide over northern Italy.',
    },
    why: { uk: 'NO₂ живе в повітрі недовго, тож його кількість швидко відповідає на зменшення руху й виробництва.', en: 'NO₂ does not last long in the air, so it quickly follows less traffic and industry.' },
    cause: { uk: 'Карантин майже зупинив транспорт і частину заводів.', en: 'The lockdown almost stopped traffic and some industry.' },
    action: {
      uk: 'Показує, що чистіше міське повітря досяжне: громадський і електротранспорт, чистіша енергетика.',
      en: 'It shows cleaner city air is within reach: public and electric transport, cleaner energy.',
    },
    photo: photos.lockdown,
    sources: [{ label: 'ESA: Coronavirus lockdown leading to drop in pollution across Europe', url: 'https://www.esa.int/Applications/Observing_the_Earth/Copernicus/Sentinel-5P/Coronavirus_lockdown_leading_to_drop_in_pollution_across_Europe' }],
  },
  {
    id: 'florida-2023',
    lat: 24.8,
    lon: -80.9,
    kind: 'heat',
    layer: 'sst',
    title: { uk: 'Морська спека біля Флориди, 2023', en: 'Marine heatwave off Florida, 2023' },
    text: {
      uk: 'Улітку 2023 року вода біля Флорида-Кіс тижнями була рекордно теплою, і NOAA оголошувала найвищі рівні тривоги щодо знебарвлення коралів.',
      en: 'In summer 2023 the water off the Florida Keys was record warm for weeks, and NOAA issued its highest coral bleaching alert levels.',
    },
    why: {
      uk: 'Від перегріву корали виганяють водорості, що живуть у них і годують їх, і біліють; довгий перегрів їх убиває.',
      en: 'Overheated corals expel the algae that live in them and feed them, and turn white; long heat kills them.',
    },
    cause: { uk: 'Морська спека на тлі потепління океану.', en: 'A marine heatwave on top of a warming ocean.' },
    action: {
      uk: 'Вчені рятували корали, переносячи їх у розплідники на суші; у довшій перспективі — скорочення викидів.',
      en: 'Scientists rescued corals by moving them to nurseries on land; in the long run, cutting emissions.',
    },
    photo: photos.coral,
    sources: [{ label: 'NOAA Coral Reef Watch', url: 'https://coralreefwatch.noaa.gov/' }],
  },
  {
    id: 'pakistan-2022',
    lat: 26.5,
    lon: 68.3,
    kind: 'flood',
    layer: 'imerg',
    title: { uk: 'Повені в Пакистані, 2022', en: 'Pakistan floods, 2022' },
    text: {
      uk: 'Мусонні зливи з червня по серпень 2022 року затопили величезні площі провінцій Сінд і Белуджистан; загинули понад 1 700 людей.',
      en: 'Monsoon downpours from June to August 2022 flooded huge areas of Sindh and Balochistan; more than 1,700 people died.',
    },
    why: { uk: 'Дощів випало в рази більше за норму, а рівнинна долина Інду повільно відводить воду.', en: 'Several times the normal rain fell, and the flat Indus valley drains water slowly.' },
    cause: {
      uk: 'Надзвичайно сильний мусон. Дослідники World Weather Attribution дійшли висновку, що зміна клімату, ймовірно, посилила найсильніші зливи.',
      en: 'An extremely strong monsoon. World Weather Attribution researchers concluded that climate change likely made the heaviest rain worse.',
    },
    action: { uk: 'Раннє попередження, дамби й водовідведення, не забудовувати заплави.', en: 'Early warnings, levees and drainage, no building on floodplains.' },
    photo: photos.pakistan,
    sources: [{ label: 'NASA Earth Observatory: Devastating Floods in Pakistan', url: 'https://earthobservatory.nasa.gov/images/150279/devastating-floods-in-pakistan' }],
  },
  {
    id: 'ozone-hole',
    lat: -75.6,
    lon: -26.2,
    kind: 'ozone',
    layer: 'ozone',
    title: { uk: 'Озонова діра над Антарктидою', en: 'The Antarctic ozone hole' },
    text: {
      uk: 'Щовесни (у вересні–жовтні) озоновий шар над Антарктидою різко тоншає. Цю діру 1985 року описали британські вчені за вимірюваннями зі станції Галлі.',
      en: 'Every spring (September and October) the ozone layer over Antarctica thins sharply. British scientists described the hole in 1985 from measurements at Halley station.',
    },
    why: { uk: 'У холодній полярній стратосфері на крижаних хмарах хлор і бром дуже швидко руйнують озон.', en: 'In the cold polar stratosphere, on icy clouds, chlorine and bromine destroy ozone very fast.' },
    cause: { uk: 'Фреони й інші речовини з хлором і бромом, які колись широко використовували в холодильниках і аерозолях.', en: 'CFCs and other chlorine and bromine compounds once widely used in fridges and sprays.' },
    action: {
      uk: 'Монреальський протокол 1987 року заборонив ці речовини; діра повільно затягується, повне відновлення над Антарктидою очікують близько 2066 року.',
      en: 'The 1987 Montreal Protocol banned these substances; the hole is slowly closing, with full recovery over Antarctica expected around 2066.',
    },
    photo: photos.halley,
    sources: [{ label: 'NASA Ozone Watch', url: 'https://ozonewatch.gsfc.nasa.gov/' }],
    caseId: 'ozone',
  },
  {
    id: 'europe-drought-2022',
    lat: 45.05,
    lon: 10.2,
    kind: 'drought',
    layer: 'soil',
    title: { uk: 'Посуха в Європі, літо 2022', en: 'Europe’s drought, summer 2022' },
    text: {
      uk: 'Улітку 2022 року ґрунти пересохли на більшій частині Європи; найдовша річка Італії По місцями обміліла до піщаних кос. Об’єднаний дослідницький центр ЄС назвав цю посуху, ймовірно, найгіршою щонайменше за 500 років.',
      en: 'In summer 2022 soils dried out across most of Europe; Italy’s longest river, the Po, shrank to sandbars in places. The EU Joint Research Centre called it likely the worst drought in at least 500 years.',
    },
    why: { uk: 'Мало дощів узимку й навесні, а потім кілька хвиль спеки.', en: 'Little rain in winter and spring, then several heatwaves.' },
    cause: { uk: 'Тривала нестача опадів і спека; посухи в Європі частішають з потеплінням.', en: 'A long shortage of rain and heat; droughts in Europe grow more frequent with warming.' },
    action: { uk: 'Збирати й зберігати воду, ощадне зрошення, посухостійкі культури.', en: 'Capture and store water, efficient irrigation, drought-tolerant crops.' },
    sources: [{ label: 'Copernicus European Drought Observatory (EU JRC)', url: 'https://drought.emergency.copernicus.eu/' }],
  },
];

export const hintById = Object.fromEntries(hints.map((h) => [h.id, h])) as Record<string, Hint>;

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
