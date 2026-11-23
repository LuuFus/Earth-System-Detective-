// "The war's toll on the environment": four stories told with satellite images before and after,
// photos under free licences, videos from the channels named under them, and numbers from the
// sources linked next to each. Figures are given with their date; where sources disagree or a
// claim was never confirmed, the text says so.

import type { Photo } from './photos';
import type { Text } from './variables';

export type Source = { name: string | Text; url: string };
export type Fact = { text: Text; source: Source };
export type Shot = { src: string; date: Text };
export type BeforeAfter = { title: Text; before: Shot; after: Shot; credit: Text };
export type Video = { id: string; title: string; channel: string };
export type WarLink = { label: Text; to: string };

export type WarTopic = {
  id: 'kakhovka' | 'front' | 'azov' | 'nuclear';
  title: Text;
  when: Text;
  lead: Text;
  compare?: BeforeAfter[];
  facts: Fact[];
  ukraine: Fact[];
  world: Fact[];
  photos: Photo[];
  video?: Video;
  links: WarLink[];
};

export type Tally = { value: Text; label: Text; source: Source; date: Text };

const S = {
  nasaEo: { name: 'NASA Earth Observatory', url: 'https://science.nasa.gov/earth/earth-observatory/canals-in-ukraine-are-drying-up-151622/' },
  ceobsKakhovka: { name: 'CEOBS', url: 'https://ceobs.org/analysing-the-environmental-consequences-of-the-kakhovka-dam-collapse/' },
  unep: { name: 'UNEP', url: 'https://www.unep.org/resources/report/rapid-environmental-assessment-kakhovka-dam-breach-ukraine-2023' },
  yale: { name: 'Yale Environment 360', url: 'https://e360.yale.edu/digest/ukraine-dam-agriculture-environment' },
  wna: { name: { uk: 'World Nuclear Association (за даними МАГАТЕ)', en: 'World Nuclear Association (IAEA data)' }, url: 'https://world-nuclear.org/information-library/country-profiles/countries-t-z/ukraine-russia-war-and-nuclear-energy' },
  ceobsAzovstal: { name: 'CEOBS', url: 'https://ceobs.org/ukraine-damage-map-azovstal-iron-and-steel-works/' },
  ceobsIndustry: { name: 'CEOBS', url: 'https://ceobs.org/?p=8001' },
  ombudsman: { name: { uk: 'Уповноважений ВРУ з прав людини', en: 'Ukrainian Parliament Commissioner for Human Rights' }, url: 'https://www.ombudsman.gov.ua/en/news_details/upovnovazhenij-azovskomu-moryu-zagrozhuye-ekologichna-katastrofa-vsya-flora-i-fauna-mozhe-zaginuti' },
  damage: { name: { uk: 'Держекоінспекція / Мінекономіки', en: 'State Environmental Inspectorate / Ministry of Economy' }, url: 'https://me.gov.ua/News/Detail/29b4233b-e60e-4224-ae2e-81b5a7e62cdc?lang=en-GB&title=RussiasAggressionHasAlreadyCausedMoreThanUah6-TrillionInEnvironmentalDamageToUkraine' },
  ghg: { name: 'Initiative on GHG Accounting of War', url: 'https://planetarysecurityinitiative.org/news/climate-damage-caused-russias-war-ukraine-1' },
  forests: { name: { uk: 'Держлісагентство', en: 'State Forest Resources Agency' }, url: 'https://forest.gov.ua/en/news/at-the-uns-main-global-forest-forum-in-new-york-the-consequences-of-russian-aggression-for-ukraines-forest-ecosystems-were-discussed' },
  mines: { name: { uk: 'ДСНС', en: 'State Emergency Service of Ukraine' }, url: 'https://mediacenter.org.ua/nearly-a-quarter-of-ukraine-s-territory-contaminated-with-explosives-ses-officials-say/' },
  firms: { name: 'NASA FIRMS', url: 'https://firms.modaps.eosdis.nasa.gov/' },
};

const nasaCredit: Text = {
  uk: 'Знімки NASA Earth Observatory (Lauren Dauphin) за даними Landsat 8 і 9 (USGS); суспільне надбання.',
  en: 'NASA Earth Observatory images by Lauren Dauphin, using Landsat 8 and 9 data from the USGS; public domain.',
};

/** The war's cost to nature in a few numbers, each with its date and source. */
export const TALLY: Tally[] = [
  {
    value: { uk: '6,01 трлн грн', en: 'UAH 6.01 trillion' },
    label: { uk: 'збитки довкіллю, підтверджені лише на підконтрольній Україні території', en: 'damage to the environment, confirmed on Ukrainian-controlled land only' },
    source: S.damage,
    date: { uk: 'грудень 2025', en: 'December 2025' },
  },
  {
    value: { uk: '≈ 237 млн т', en: '≈ 237 million t' },
    label: { uk: 'CO₂-еквіваленту викидів через війну за перші три роки — як річні викиди Австрії, Угорщини, Чехії й Словаччини разом', en: 'CO₂-equivalent emitted because of the war in its first three years — as much as Austria, Hungary, Czechia and Slovakia emit in a year together' },
    source: S.ghg,
    date: { uk: 'жовтень 2025', en: 'October 2025' },
  },
  {
    value: { uk: '≈ ⅓ лісів', en: '≈ ⅓ of forests' },
    label: { uk: 'зазнали пошкоджень різного ступеня; ≈ 450 тис. га лісу забруднені вибухонебезпечними предметами', en: 'damaged to some degree; about 450,000 ha of forest contaminated with explosive ordnance' },
    source: S.forests,
    date: { uk: 'травень 2026', en: 'May 2026' },
  },
  {
    value: { uk: '136 тис. км²', en: '136,000 km²' },
    label: { uk: '≈ 23% країни потенційно заміновано — поля й ліси, які роками не можна обробляти', en: 'about 23% of the country may be mined — fields and forests that cannot be worked for years' },
    source: S.mines,
    date: { uk: 'листопад 2025', en: 'November 2025' },
  },
  {
    value: { uk: '20%', en: '20%' },
    label: { uk: 'природоохоронних територій уражено, зокрема 2,9 млн га Смарагдової мережі', en: 'of protected areas affected, including 2.9 million ha of the Emerald Network' },
    source: S.damage,
    date: { uk: 'грудень 2025', en: 'December 2025' },
  },
  {
    value: { uk: '18 км³', en: '18 km³' },
    label: { uk: 'води тримало Каховське водосховище — одне з найбільших у Європі, до руйнування греблі', en: 'of water held by the Kakhovka reservoir — one of the largest in Europe — before the dam was destroyed' },
    source: S.ceobsKakhovka,
    date: { uk: 'червень 2023', en: 'June 2023' },
  },
];

const commons = (file: string, author: string, license: string, uk: string, en: string): Photo => ({ file, author, license, caption: { uk, en } });

export const WAR_TOPICS: WarTopic[] = [
  {
    id: 'kakhovka',
    title: { uk: 'Каховська ГЕС: зникле водосховище', en: 'The Kakhovka dam: a reservoir gone' },
    when: { uk: '6 червня 2023', en: '6 June 2023' },
    lead: {
      uk: 'Рано-вранці 6 червня 2023 року греблю Каховської ГЕС на Дніпрі зруйновано. Вода затопила береги нижче за течією, а одне з найбільших водосховищ Європи за кілька тижнів перетворилося на поле мулу.',
      en: 'In the early hours of 6 June 2023 the Kakhovka dam on the Dnipro was destroyed. Water flooded the banks downstream, and one of the largest reservoirs in Europe turned into a field of mud within weeks.',
    },
    compare: [
      {
        title: { uk: 'Водосховище: за рік до і через 12 днів після', en: 'The reservoir: a year before and 12 days after' },
        before: { src: 'img/war/kakhovka-reservoir-2022-06-07.jpg', date: { uk: '7 червня 2022', en: '7 June 2022' } },
        after: { src: 'img/war/kakhovka-reservoir-2023-06-18.jpg', date: { uk: '18 червня 2023', en: '18 June 2023' } },
        credit: nasaCredit,
      },
      {
        title: { uk: 'Повінь на Дніпрі нижче греблі', en: 'The flood on the Dnipro below the dam' },
        before: { src: 'img/war/kakhovka-flood-2023-06-01.jpg', date: { uk: '1 червня 2023', en: '1 June 2023' } },
        after: { src: 'img/war/kakhovka-flood-2023-06-09.jpg', date: { uk: '9 червня 2023', en: '9 June 2023' } },
        credit: nasaCredit,
      },
      {
        title: { uk: 'Зрошувальні канали півдня пересихають', en: 'The irrigation canals of the south run dry' },
        before: { src: 'img/war/kakhovka-canals-2023-05-17.jpg', date: { uk: '17 травня 2023', en: '17 May 2023' } },
        after: { src: 'img/war/kakhovka-canals-2023-06-18.jpg', date: { uk: '18 червня 2023', en: '18 June 2023' } },
        credit: nasaCredit,
      },
    ],
    facts: [
      { text: { uk: 'Водосховище тримало 18 км³ води — одне з найбільших у Європі за об’ємом.', en: 'The reservoir held 18 km³ of water — one of the largest in Europe by volume.' }, source: S.ceobsKakhovka },
      { text: { uk: 'До 18 червня витекло близько 75% води — приблизно стільки, скільки у Великому Солоному озері в США.', en: 'By 18 June about 75% of the water had drained — roughly the volume of Utah’s Great Salt Lake.' }, source: S.nasaEo },
      { text: { uk: '6–9 червня затопило близько 620 км² (оцінка UNOSAT); загинула 31 людина.', en: 'About 620 km² flooded on 6-9 June (UNOSAT estimate); 31 people died.' }, source: S.ceobsKakhovka },
      { text: { uk: 'Тисячі будинків опинилися під водою, понад 40 тисяч людей евакуювали.', en: 'Thousands of homes went under water and more than 40,000 people were evacuated.' }, source: S.nasaEo },
      { text: { uk: 'Під воду пішли 88 небезпечних об’єктів — заправки, склади, очисні — і понад 90% Нижньодніпровської дельти, водно-болотного угіддя міжнародного значення.', en: '88 hazardous sites — fuel stations, depots, sewage works — went under water, and more than 90% of the Lower Dnipro Delta, a wetland of international importance.' }, source: S.ceobsKakhovka },
      { text: { uk: 'Усі чотири головні водозабори зрошувальних каналів відрізано від води; канали поливали до 500 000 га полів.', en: 'All four main inlets of the irrigation canals were cut off from the water; the canals watered up to 500,000 ha of fields.' }, source: S.nasaEo },
      { text: { uk: 'Запорізька АЕС брала воду для охолодження з водосховища; до вересня 2023 року для неї пробурили 10 нових свердловин.', en: 'The Zaporizhzhia nuclear plant drew its cooling water from the reservoir; by September 2023 ten new wells had been drilled for it.' }, source: S.wna },
    ],
    ukraine: [
      { text: { uk: 'Відновити зрошення від водосховища — від 3 до 7 років (оцінка Мінагрополітики).', en: 'Restoring irrigation from the reservoir would take 3 to 7 years (agriculture ministry estimate).' }, source: S.yale },
      { text: { uk: 'Без поливу частина полів півдня може повернутися до степу, а більший відбір підземних вод загрожує засоленням ґрунтів.', en: 'Without irrigation some southern fields may revert to steppe, and pumping more groundwater risks salting the soil.' }, source: S.ceobsKakhovka },
      { text: { uk: 'Наслідки вище за течією — оголене дно, відклади, зміна екосистем — найімовірніше, триватимуть довше, ніж повінь.', en: 'The effects upstream — the exposed bed, its sediments, changed ecosystems — are likely to last longer than the flood.' }, source: S.ceobsKakhovka },
    ],
    world: [
      { text: { uk: 'Руйнування греблі підштовхнуло вгору світові ціни на зерно; Україна — один із найбільших експортерів зерна.', en: 'The dam’s destruction pushed up world grain prices; Ukraine is one of the largest grain exporters.' }, source: S.yale },
      { text: { uk: 'Мул, сміття й забруднення потрапили в Чорне море; 10 червня біля Одеси вода була втричі менш солоною, ніж зазвичай.', en: 'Silt, debris and pollution reached the Black Sea; on 10 June the water off Odesa was three times less salty than usual.' }, source: S.ceobsKakhovka },
      { text: { uk: 'За оцінкою ООН, значна частина шкоди незворотна, а наслідки триватимуть десятиліттями й вийдуть за межі України.', en: 'The UN assessment found much of the damage irreversible, with effects lasting decades and reaching beyond Ukraine.' }, source: S.unep },
    ],
    photos: [
      commons('Kalynivske after the destruction of Kakhovka Hydroelectric Power Plant, 2023-06-14 (02).jpg', 'Херсонська ОВА', 'CC BY 4.0', 'Калинівське на Херсонщині під водою, 14 червня 2023', 'Kalynivske, Kherson region, under water, 14 June 2023'),
      commons('Kherson after the destruction of Kakhovka Hydroelectric Power Plant, 2023-06-07 (01).jpg', 'ДСНС України', 'CC BY 4.0', 'Затоплений Херсон, 7 червня 2023', 'Flooded Kherson, 7 June 2023'),
      commons('Flooded Kherson, 2023-06-07 (04).jpg', 'Дмитро Завтонов / АрміяInform', 'CC BY 4.0', 'Херсон наступного дня після руйнування греблі', 'Kherson the day after the dam was destroyed'),
    ],
    video: { id: 'acR8nk8M5Xg', title: 'Ukraine’s dam collapse is both a fast-moving disaster and a slow-moving ecological catastrophe', channel: 'Associated Press' },
    links: [{ label: { uk: 'Затоплений Херсон серед подій на 3D-Землі', en: 'Flooded Kherson among the events on the 3D Earth' }, to: '/explore?panel=cases&cam=46.80,33.40,1.20' }],
  },
  {
    id: 'front',
    title: { uk: 'Згарища вздовж фронту', en: 'Burned land along the front' },
    when: { uk: 'з 2022 року', en: 'since 2022' },
    lead: {
      uk: 'Обстріли підпалюють ліси, степи й поля, а міни роками не дають їх гасити й відновлювати. Супутники NASA бачать цей вогонь щодня — смуга пожеж рухається разом із лінією фронту.',
      en: 'Shelling sets forests, steppe and fields alight, and mines keep them from being put out or restored for years. NASA satellites see this fire every day — the band of fires moves with the front line.',
    },
    facts: [
      { text: { uk: 'У 2022 році супутники зафіксували 25 114 осередків вогню на півдні й сході країни за 280 днів від початку вторгнення.', en: 'In 2022 satellites recorded 25,114 fire detections in the south and east of the country in the 280 days after the invasion began.' }, source: S.firms },
      { text: { uk: 'Майже третина лісів України зазнала пошкоджень різного ступеня; на підконтрольній території війна спричинила лісові пожежі на ≈ 40 000 га.', en: 'Nearly a third of Ukraine’s forests have been damaged to some degree; on Ukrainian-controlled land the war has caused forest fires over about 40,000 ha.' }, source: S.forests },
      { text: { uk: 'Близько 450 000 га лісів забруднені вибухонебезпечними предметами.', en: 'About 450,000 ha of forest are contaminated with explosive ordnance.' }, source: S.forests },
      { text: { uk: 'Ландшафтні пожежі дали 49,4 млн т CO₂-екв — 21% усіх викидів війни за три роки.', en: 'Landscape fires released 49.4 million t of CO₂-equivalent — 21% of the war’s emissions over three years.' }, source: S.ghg },
    ],
    ukraine: [
      { text: { uk: '≈ 23% країни потенційно заміновано: поки землю не розміновано, її не можна обробляти, а пожежі на ній — гасити.', en: 'About 23% of the country may be mined: until it is cleared, the land cannot be farmed and fires on it cannot be fought.' }, source: S.mines },
      { text: { uk: 'Уражено 20% природоохоронних територій, зокрема 2,9 млн га Смарагдової мережі — оселищ рідкісних видів.', en: '20% of protected areas are affected, including 2.9 million ha of the Emerald Network — homes of rare species.' }, source: S.damage },
    ],
    world: [
      { text: { uk: 'Загиблі ліси ще віддаватимуть вуглець: ще 32,4 млн т CO₂-екв у майбутньому.', en: 'Dead forests will keep releasing carbon: another 32.4 million t of CO₂-equivalent in the future.' }, source: S.ghg },
      { text: { uk: 'Дим пожеж переноситься за кордон, а викиди війни лягають на клімат усієї планети: ≈ 237 млн т CO₂-екв за три роки.', en: 'Smoke from the fires drifts abroad, and the war’s emissions weigh on the whole planet’s climate: about 237 million t of CO₂-equivalent in three years.' }, source: S.ghg },
    ],
    photos: [
      commons('Balabanivka forest after Russian shelling, 2022-06-07 (01).jpg', 'ДСНС України', 'CC BY 4.0', 'Балабанівський ліс на Миколаївщині після обстрілу, червень 2022', 'The Balabanivka forest, Mykolaiv region, after shelling, June 2022'),
      commons('Balabanivka forest after Russian shelling, 2022-08-10 (02).jpg', 'ДСНС України', 'CC BY 4.0', 'Той самий ліс горить знову, серпень 2022', 'The same forest on fire again, August 2022'),
      commons('Forest in Donetsk Oblast after Russian shelling, 2024-08-22 (02).webp', 'ДСНС України', 'CC BY 4.0', 'Пожежа в лісі на Донеччині після обстрілу, серпень 2024', 'A forest fire in Donetsk region after shelling, August 2024'),
    ],
    video: { id: '5CtAXzFnxuc', title: 'How nature becomes a casualty of the war: an environmental catastrophe for Ukraine and Europe', channel: 'UATV English' },
    links: [{ label: { uk: 'Історія пожеж «Вогонь війни, 2022» на 3D-Землі', en: 'The “Fires of war, 2022” story on the 3D Earth' }, to: '/explore?panel=fires' }],
  },
  {
    id: 'azov',
    title: { uk: 'Маріуполь, Азовсталь і Азовське море', en: 'Mariupol, Azovstal and the Sea of Azov' },
    when: { uk: 'березень — травень 2022', en: 'March to May 2022' },
    lead: {
      uk: 'Металургійний комбінат «Азовсталь» стоїть на березі Азовського моря. Навесні 2022 року він опинився в центрі боїв за Маріуполь: горіли цехи, руйнувалися очисні споруди та сховища відходів.',
      en: 'The Azovstal iron and steel works stands on the shore of the Sea of Azov. In spring 2022 it was at the centre of the battle for Mariupol: workshops burned, and water treatment and waste storage were destroyed.',
    },
    facts: [
      { text: { uk: 'Комбінат займав близько 11 км² — приблизно 10% міста.', en: 'The works covered about 11 km² — roughly 10% of the city.' }, source: S.ceobsAzovstal },
      { text: { uk: 'Ще до війни стоки комбінату були найбільшим джерелом забруднення Азовського моря (дослідження 2019 року).', en: 'Even before the war its outflow was the single biggest source of pollution into the Sea of Azov (a 2019 study).' }, source: S.ceobsAzovstal },
      { text: { uk: 'Під час облоги супутники зафіксували 52 пожежі на території заводу; пошкоджено щонайменше 57% споруд.', en: 'During the siege satellites recorded 52 fires at the site; at least 57% of its structures were damaged.' }, source: S.ceobsAzovstal },
      { text: { uk: 'Пошкоджено доменні печі, підстанції, очисні споруди, сховища відходів і пального.', en: 'Blast furnaces, substations, water treatment, waste storage and fuel tanks were damaged.' }, source: S.ceobsIndustry },
      { text: { uk: 'У травні 2022 року Омбудсман і міська рада попередили: споруда з десятками тисяч тонн концентрованого розчину сірководню могла бути пошкоджена. Даних про підтверджений витік у море немає.', en: 'In May 2022 the Ombudsman and the city council warned that a structure holding tens of thousands of tonnes of concentrated hydrogen sulphide solution might be damaged. There is no record of a confirmed leak into the sea.' }, source: S.ombudsman },
      { text: { uk: 'Фото «отруйно-зеленого ставка», що ширилися тоді в мережі, виявилися старими — 2013 року.', en: 'Photos of a “toxic green pond” shared widely at the time turned out to be old — from 2013.' }, source: S.ceobsIndustry },
    ],
    ukraine: [
      { text: { uk: 'Поки місто окуповане, незалежної перевірки забруднення немає — справжній масштаб шкоди невідомий.', en: 'While the city is occupied there is no independent check of the pollution — the real scale of the damage is unknown.' }, source: S.ceobsAzovstal },
      { text: { uk: 'Зруйнований завод забруднюватиме довкілля ще роки; очищення буде величезним завданням.', en: 'The ruined works will pollute the area for years to come; cleaning it up will be a huge task.' }, source: S.ceobsIndustry },
    ],
    world: [
      { text: { uk: 'Азовське море з’єднане з Чорним Керченською протокою: забруднення не зупиняється на лінії фронту. CEOBS закликає до оцінки незалежними міжнародними експертами.', en: 'The Sea of Azov joins the Black Sea through the Kerch Strait: pollution does not stop at the front line. CEOBS calls for an assessment by independent international experts.' }, source: S.ceobsIndustry },
    ],
    photos: [
      commons('Azovstal iron and steel works in 2021 — Азовсталь, 2021 рік 08.jpg', 'Blast furnace chip worker', 'CC BY-SA 3.0', '«Азовсталь» за рік до війни, серпень 2021', 'Azovstal a year before the war, August 2021'),
      commons('Бої за Азовсталь.jpg', 'АрміяInform', 'CC BY 4.0', 'Дим над «Азовсталлю» під час боїв, квітень 2022', 'Smoke over Azovstal during the fighting, April 2022'),
      commons('Slag dump on Azov sea coast. Mariupol.JPG', 'Nikita Karasik', 'CC BY-SA 4.0', 'Шлаковий відвал на березі Азовського моря, 2014', 'A slag heap on the Sea of Azov coast, 2014'),
    ],
    links: [{ label: { uk: 'Маріуполь на 3D-Землі', en: 'Mariupol on the 3D Earth' }, to: '/explore?cam=47.10,37.60,1.15' }],
  },
  {
    id: 'nuclear',
    title: { uk: 'Чорнобиль і Запорізька АЕС', en: 'Chornobyl and the Zaporizhzhia nuclear plant' },
    when: { uk: 'з 2022 року', en: 'since 2022' },
    lead: {
      uk: 'Війна прийшла на ядерні об’єкти: зону відчуження окупували, Запорізьку АЕС — найбільшу в Європі — захопили, а дрон пробив арку над зруйнованим реактором Чорнобиля.',
      en: 'The war came to nuclear sites: the Exclusion Zone was occupied, the Zaporizhzhia plant — the largest in Europe — was seized, and a drone pierced the arch over Chornobyl’s ruined reactor.',
    },
    facts: [
      { text: { uk: 'Зона відчуження була під окупацією з 24 лютого до 31 березня 2022 року.', en: 'The Exclusion Zone was occupied from 24 February to 31 March 2022.' }, source: S.wna },
      { text: { uk: '14 лютого 2025 року дрон пробив обидва шари оболонки Нового безпечного конфайнменту; радіаційний фон лишився стабільним.', en: 'On 14 February 2025 a drone pierced both layers of the New Safe Confinement’s cladding; radiation levels stayed stable.' }, source: S.wna },
      { text: { uk: 'У листопаді 2025 року МАГАТЕ встановило, що арка втратила частину функцій, зокрема здатність утримувати радіоактивні речовини; викиду не було.', en: 'In November 2025 the IAEA found the arch had lost some functions, in particular its confinement capability; there was no release.' }, source: S.wna },
      { text: { uk: 'Запорізьку АЕС захопили 4 березня 2022 року; з квітня 2024 року всі шість енергоблоків у холодному зупині.', en: 'The Zaporizhzhia plant was seized on 4 March 2022; since April 2024 all six units have been in cold shutdown.' }, source: S.wna },
      { text: { uk: 'Станція 26 разів повністю втрачала зовнішнє живлення (станом на вересень 2026); найдовше — місяць, з 23 вересня по 23 жовтня 2025 року.', en: 'The plant has lost all off-site power 26 times (as of September 2026); the longest outage lasted a month, 23 September to 23 October 2025.' }, source: S.wna },
    ],
    ukraine: [
      { text: { uk: 'Без зовнішнього живлення охолодження тримається на дизель-генераторах; МАГАТЕ попереджало про ризик повного знеструмлення станції.', en: 'Without off-site power, cooling depends on diesel generators; the IAEA has warned of the risk of a full station blackout.' }, source: S.wna },
      { text: { uk: 'Найбільша АЕС Європи не виробляє електроенергію для України: усі шість блоків зупинені.', en: 'Europe’s largest nuclear plant produces no electricity for Ukraine: all six units are shut down.' }, source: S.wna },
    ],
    world: [
      { text: { uk: 'Радіоактивне забруднення не знає кордонів. З вересня 2022 року МАГАТЕ закликає негайно створити зону ядерної безпеки довкола ЗАЕС.', en: 'Radioactive pollution knows no borders. Since September 2022 the IAEA has called for a nuclear safety and security zone around the plant.' }, source: S.wna },
    ],
    photos: [
      commons('Chernobyl Nuclear Power Plant confinement after drone strike, 2025-02-14 (11).jpg', 'Чорнобильська АЕС', 'CC BY 4.0', 'Місце влучання дрона в арку Нового безпечного конфайнменту, 14 лютого 2025', 'Where the drone hit the arch of the New Safe Confinement, 14 February 2025'),
      commons('IAEA Support and Assistance Mission to Zaporizhzhya (02011309) (52340580223).jpg', 'IAEA Imagebank', 'CC BY 2.0', 'Місія МАГАТЕ на Запорізькій АЕС, вересень 2022', 'The IAEA mission at the Zaporizhzhia plant, September 2022'),
      commons('Forest fire in Chernobyl exclusion zone after Russian attack (2026-05-15) 01.webp', 'ДСНС України', 'CC BY 4.0', 'Гасіння лісової пожежі в зоні відчуження після атаки, травень 2026', 'Fighting a forest fire in the Exclusion Zone after an attack, May 2026'),
    ],
    video: { id: 'n2Xa5Ub9YEY', title: 'IAEA Director General visits Zaporizhzhya NPP after recent fire', channel: 'IAEAvideo' },
    links: [
      { label: { uk: 'Радіаційний фон на мапі України', en: 'Radiation on the map of Ukraine' }, to: '/map?mode=ukraine' },
      { label: { uk: 'Пожежа в зоні відчуження 2020 на 3D-Землі', en: 'The 2020 Exclusion Zone fire on the 3D Earth' }, to: '/explore?panel=fires' },
    ],
  },
];

/** A short film for the whole subject, from an EU institution. */
export const WAR_INTRO_VIDEO: Video = { id: 'ZNfxvqi_gZI', title: 'The environment, a victim of war', channel: 'European Parliamentary Research Service' };
/** Chornobyl after the drone strike, from the bank that funds the arch's repair. */
export const WAR_CHORNOBYL_VIDEO: Video = { id: '2_QDgclvGqM', title: 'Supporting Chornobyl after Russia’s drone attack', channel: 'European Bank for Reconstruction and Development' };
