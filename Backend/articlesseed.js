/**
 * SEED FILE 5 of 5 — Articles (28), across all vets
 * Run AFTER files 1-4. Run: node seeds/05_articles.js
 */
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/petsneha';
const User = require('./src/models/user.model.js');
const Vet = require('./src/models/vet.model.js');
const Article = require('./src/models/article.model.js');

const VET_IDENTIFIERS = [
  { byEmail: 'guragainaruna2060@gmail.com' }, // Dr. Binod Thapa
  { byName: 'Dr. Anita Rai' },
  { byName: 'Dr. Ramesh Sharma' },
  { byName: 'Dr. Sunita Karki' },
  { byName: 'Dr. Sunita Pandey' },
  { byName: 'Dr. Nabin Gurung' }, // pending vet — articles from them stay unpublished
];

const ARTICLES = [
  {
    title: 'Summer Heat Safety Tips for Dogs',
    summary: "Protecting your dog's paws and preventing heatstroke in Kathmandu summers.",
    petType: ['dog'], season: 'summer', tags: ['summer', 'safety'], img: 'photo-1601758228041-f3b2795255f1',
    content: "Kathmandu's summer afternoons can push pavement temperatures well above what's safe for a dog's paw pads. A simple test: press the back of your hand to the pavement for seven seconds — if it's too hot for you, it's too hot for your dog. Walk early morning or after sunset instead, and stick to grass or shaded paths when possible.\n\nHeatstroke develops quickly and is a genuine emergency. Watch for heavy panting that doesn't slow down, bright red gums, drooling, wobbly movement, or collapse. Flat-faced breeds (pugs, bulldogs) and older, overweight, or thick-coated dogs are at higher risk even on moderately warm days.\n\nIf you suspect heatstroke: move your dog to shade immediately, offer small amounts of cool (not ice-cold) water, and wet their body with room-temperature water while fanning them, then get to a vet immediately, even if they seem to recover, since internal damage can continue after outward symptoms improve.\n\nAt home, always ensure fresh water is available in multiple locations, never leave a dog in a parked vehicle even briefly, and consider a cooling mat for particularly hot days.",
  },
  {
    title: 'Monsoon Skin Infections in Cats',
    summary: 'Spotting and preventing fungal skin issues during the rainy season.',
    petType: ['cat'], season: 'monsoon', tags: ['monsoon', 'skin'], img: 'photo-1573865526739-10659fec78a5',
    content: "Nepal's monsoon humidity creates ideal conditions for fungal and bacterial skin infections in cats, particularly around the ears, paws, and skin folds that stay damp longer. Ringworm, a fungal infection despite the name, is especially common this time of year and is contagious to humans, so early detection matters for the whole household.\n\nWatch for circular patches of hair loss, flaky or crusty skin, excessive scratching or grooming in one spot, and a musty odor. Cats that go outdoors or live in multi-cat households are at higher risk of picking up and spreading fungal infections.\n\nPrevention starts with keeping your cat's coat dry. Towel-dry thoroughly if they get wet, and ensure bedding is aired out regularly rather than left damp. Regular brushing helps you spot skin changes early and removes loose fur that traps moisture against the skin.\n\nIf you notice any skin changes, see a vet rather than trying home remedies first. Fungal infections need targeted antifungal treatment, and misdiagnosing a bacterial infection as fungal (or vice versa) can delay proper healing by weeks.",
  },
  {
    title: 'Winter Care for Exotic Birds',
    summary: 'Keeping pet birds warm and healthy through Kathmandu winters.',
    petType: ['bird'], season: 'winter', tags: ['winter', 'exotic'], img: 'photo-1522926193341-e9ffd686c60f',
    content: "Most pet birds, such as budgerigars, cockatiels, and lovebirds, originate from warmer climates and can struggle when Kathmandu's winter nights drop toward freezing. Birds are also very good at hiding illness, so a bird that's fluffed up and quiet in winter deserves attention rather than being assumed to just be cold.\n\nKeep the cage away from drafts, windows, and doors, and consider covering three sides of the cage at night with a breathable cloth to retain warmth without blocking airflow. A room temperature of at least 18-20°C is a reasonable minimum for most common pet bird species.\n\nWatch for warning signs beyond simple fluffing: laboured breathing, tail-bobbing with each breath, discharge from the nostrils or eyes, and reduced appetite. These can indicate a respiratory infection, which spreads and worsens quickly in birds.\n\nDiet also matters more in winter, since birds burn more energy maintaining body heat. Ensure consistent access to a balanced seed or pellet mix, and avoid sudden diet changes during cold snaps. If you notice any behavioural change lasting more than a day, see an exotic-experienced vet promptly.",
  },
  {
    title: "A First-Time Owner's Guide to Puppy Vaccinations",
    summary: 'Understanding the core vaccination schedule for new puppies.',
    petType: ['dog'], season: 'all', tags: ['puppy', 'vaccination'], img: 'photo-1552053831-71594a27632d',
    content: "Puppy vaccination protects against several serious, often fatal diseases, and getting the timing right matters as much as the vaccines themselves. A puppy's immune system needs multiple doses spaced correctly to build lasting protection.\n\nThe typical core schedule starts around 6-8 weeks with a combination vaccine, commonly covering distemper, parvovirus, and hepatitis, followed by boosters every 3-4 weeks until 16 weeks of age. Rabies vaccination is usually given around 12-16 weeks and is legally required in most areas.\n\nBetween vaccination doses, your puppy isn't fully protected, so it's best to avoid areas with unknown dogs, such as parks or pavements frequented by strays, until the full series is complete. This doesn't mean total isolation; controlled socialization with healthy, vaccinated dogs is still valuable during this window.\n\nKeep a written or photographed record of every vaccine given, including the date and vaccine batch if provided. You'll need this for future boarding, travel, or if you switch vets. After the initial puppy series, most core vaccines need annual or triennial boosters depending on the vaccine type, so set a reminder rather than relying on memory.",
  },
  {
    title: 'Why Is My Cat Not Eating? Common Causes',
    summary: 'A guide to appetite loss in cats and when to see a vet.',
    petType: ['cat'], season: 'all', tags: ['health', 'nutrition'], img: 'photo-1533738363-b7f9aef128ce',
    content: "Cats are notoriously good at masking illness, which makes appetite loss one of the more reliable early warning signs owners can actually observe. Unlike dogs, cats can develop a serious complication called hepatic lipidosis after even 2-3 days of not eating, making this a symptom that shouldn't be watched-and-waited on for long.\n\nCommon causes range from the mundane, such as a recent diet change or stress from a house move, to more serious issues like kidney disease, gastrointestinal blockages, or infections. Older cats not eating alongside increased thirst or urination often point toward kidney or thyroid issues.\n\nBefore assuming illness, rule out simple explanations: is the food fresh, is the bowl in a quiet low-stress location, has anything in the household changed recently? Cats can also refuse food due to bowl-placement stress near litter boxes or other pets.\n\nAs a general rule, if your cat hasn't eaten anything for 24 hours, or is eating noticeably less for more than 2 days, see a vet rather than waiting. Earlier intervention is significantly easier to treat than a cat that has already gone several days without food.",
  },
  {
    title: 'Deworming Schedules for Dogs and Cats',
    summary: 'How often to deworm and what signs to watch for.',
    petType: ['dog', 'cat'], season: 'all', tags: ['deworming', 'health'], img: 'photo-1552053831-71594a27632d',
    content: "Intestinal parasites are extremely common in both puppies/kittens and adult pets in Nepal, given the prevalence of stray animal contact, contaminated soil, and flea-transmitted tapeworms. Even indoor-only pets aren't fully protected, since some parasites can be tracked in on shoes or transmitted by fleas.\n\nPuppies and kittens typically need deworming every 2 weeks from 2 weeks of age until 12 weeks old, since they can be born with worms passed from the mother. After that, monthly deworming until 6 months of age is standard, transitioning to a quarterly schedule for adult pets.\n\nSigns of a heavy worm burden include a pot-bellied appearance in young animals, visible worms or worm segments in stool, weight loss despite normal appetite, and dull coat. That said, many worm infections show no obvious external signs at all, which is exactly why scheduled deworming matters more than waiting for symptoms.\n\nAlways use a dewormer appropriate for your pet's weight and species, since dog and cat dewormers aren't always interchangeable. Discuss the right product and schedule with your vet, especially for pregnant or nursing animals.",
  },
  {
    title: 'Recognizing Heatstroke in Pets Early',
    summary: 'Warning signs of heatstroke and immediate first-aid steps.',
    petType: ['dog', 'cat'], season: 'summer', tags: ['emergency', 'summer'], img: 'photo-1601758228041-f3b2795255f1',
    content: "Heatstroke in pets progresses from mild distress to organ failure faster than most owners expect, often within 30 minutes in severe cases, which is why recognizing the earliest signs matters more than knowing the late-stage ones.\n\nEarly signs include heavy panting that doesn't ease with rest, seeking out cool surfaces repeatedly, and unusual restlessness. As it progresses: bright red or purple gums, thick ropey drool, vomiting, and unsteady walking. Collapse and seizures indicate a critical emergency.\n\nIf you notice early signs, act immediately rather than waiting to see if it worsens: move to shade or an air-conditioned space, offer small sips of cool water, and apply cool, not ice-cold, wet towels to the neck, armpits, and groin where blood vessels sit close to the skin. Ice-cold water can actually worsen outcomes by constricting surface blood vessels and trapping heat internally.\n\nEven if your pet appears to recover after cooling measures, a vet visit afterward is still important. Heatstroke can cause internal damage to kidneys, clotting ability, or the gut lining that isn't visible externally but can develop over the following 24-48 hours.",
  },
  {
    title: 'Monsoon Tick and Flea Prevention',
    summary: 'Why parasite risk spikes during monsoon and how to prevent it.',
    petType: ['dog', 'cat'], season: 'monsoon', tags: ['monsoon', 'parasites'], img: 'photo-1573865526739-10659fec78a5',
    content: "Warm, humid monsoon conditions are exactly what fleas and ticks need to complete their life cycle quickly, which is why parasite burdens noticeably spike during Nepal's rainy season compared to drier months.\n\nFleas cause more than itching. Heavy infestations can lead to anemia in young or small animals, and fleas are also the intermediate host for tapeworms, meaning a flea problem can become a worm problem too. Ticks carry their own risks, including tick-borne diseases that affect blood cells and joints.\n\nCheck your pet's coat regularly during monsoon season, particularly around the ears, neck, armpits, and between toes where ticks commonly attach and fleas congregate. Look for small dark specks in the fur, known as flea dirt, as an early sign even before you spot a live flea.\n\nPreventive treatments, whether spot-on treatments, oral preventives, or collars, work far better applied consistently before an infestation than treating after the fact, since a full flea life-cycle can persist in your home environment even after treating the pet directly. Wash pet bedding in hot water weekly during peak monsoon months, and vacuum living areas regularly to remove flea eggs from the environment.",
  },
  {
    title: 'Keeping Senior Dogs Warm in Winter',
    summary: 'Joint care and warmth tips for older dogs in cold weather.',
    petType: ['dog'], season: 'winter', tags: ['senior', 'winter'], img: 'photo-1522926193341-e9ffd686c60f',
    content: "Cold weather affects senior dogs more noticeably than younger ones, particularly those with arthritis or other joint conditions. Many owners report their older dog becoming stiffer, slower to rise, or more reluctant to walk once temperatures drop.\n\nProvide a raised, padded bed away from cold floors and drafts, since tile and concrete floors pull heat from a dog's body even indoors. A dog sweater or coat genuinely helps short-haired or thin senior dogs during walks, despite sometimes being dismissed as unnecessary.\n\nKeep walks shorter but more frequent rather than one long walk, since joints stiffen faster in the cold and a shorter warm-up period reduces strain. Watch for increased limping, reluctance to use stairs, or difficulty getting up after resting, since these can indicate arthritis pain that's worth discussing with a vet, as effective pain management options exist.\n\nWinter is also when senior dogs may eat slightly more to maintain body heat, but watch portion sizes carefully if their activity level has also decreased, since winter weight gain compounds joint stress. A vet check before winter sets in is a good opportunity to assess joint health and adjust any existing pain management plan.",
  },
  {
    title: 'Understanding Rabbit Dental Health',
    summary: 'Why rabbits need constant chewing and how to support dental health.',
    petType: ['rabbit'], season: 'all', tags: ['rabbit', 'dental'], img: 'photo-1585110396000-c9ffd4e4b308',
    content: "Unlike dogs and cats, rabbit teeth grow continuously throughout their entire life, an adaptation for a diet of tough, fibrous plants. This means dental problems in rabbits are less about decay and more about overgrowth and misalignment, which is a very different, and often overlooked, health concern for new rabbit owners.\n\nA diet high in hay, ideally unlimited access to timothy or grass hay, is the single most important factor in keeping teeth worn down naturally through the grinding motion of chewing fibrous material. Pellets and vegetables alone don't provide enough of this grinding action.\n\nWarning signs of dental problems include reduced appetite or difficulty eating, drooling, weight loss, tear-staining below the eyes linked to tooth roots affecting tear ducts, and visibly overgrown front teeth. Rabbits can also develop molar spurs that cause mouth pain without any visible external sign at all, which is why unexplained appetite loss in a rabbit always warrants a vet check.\n\nRegular home checks of the front teeth are useful, but molar problems require a vet's examination since they're not visible without proper tools. Annual dental checks are recommended even for rabbits showing no obvious symptoms, since problems often develop before outward signs appear.",
  },
  {
    title: "Choosing the Right Diet for Your Puppy",
    summary: "Nutrition basics for the first year of a puppy's life.",
    petType: ['dog'], season: 'all', tags: ['puppy', 'nutrition'], img: 'photo-1568640347023-a616a30bc3bd',
    content: "A puppy's first year involves more growth and development than any other life stage, which is why puppy-specific food, not adult formula, matters. Puppy diets are formulated with higher protein and calorie density to support this rapid growth.\n\nLarge and giant breed puppies have specific needs. Growing too quickly on a calorie-dense diet can actually contribute to joint and bone development problems later in life, so large-breed-specific puppy formulas with controlled calcium and calorie levels are worth seeking out rather than defaulting to standard puppy food.\n\nFeeding frequency should decrease gradually with age. Young puppies under 3 months typically need 3-4 small meals a day, tapering to 2 meals by 6 months. Free-feeding makes it harder to monitor appetite changes, which are often the first sign something's wrong.\n\nAvoid switching foods abruptly, as sudden diet changes commonly cause digestive upset in puppies. When transitioning to a new food, mix increasing proportions of the new food with the old over 5-7 days. Treats should stay under 10% of total daily calories, and always avoid toxic foods like chocolate, grapes, onions, and xylitol-sweetened products.",
  },
  {
    title: 'Signs of Arthritis in Aging Dogs',
    summary: 'How to spot joint pain early and manage it long-term.',
    petType: ['dog'], season: 'all', tags: ['senior', 'joint'], img: 'photo-1552053831-71594a27632d',
    content: "Arthritis is extremely common in older dogs, but because it develops gradually, many owners mistake early signs for simply slowing down with age rather than a treatable medical condition. Larger breeds and dogs that were overweight for extended periods are at higher risk.\n\nEarly signs are often subtle: hesitating before jumping onto furniture or into a car, taking longer to sit or lie down, stiffness after resting that improves once moving, and reduced enthusiasm for walks or play they once loved. As it progresses, visible limping, muscle loss in the legs, and irritability when touched near affected joints become more apparent.\n\nWeight management is one of the most effective things an owner can do. Even a small amount of excess weight significantly increases joint stress, and weight loss alone measurably improves comfort in overweight arthritic dogs. Moderate, consistent low-impact exercise helps maintain muscle support around joints better than complete rest.\n\nA range of veterinary treatment options exist beyond just pain medication, including joint supplements, weight management plans, and physical therapy approaches. Because arthritis pain in dogs is often under-recognized, a vet check is worthwhile at the first sign of stiffness rather than waiting for visible limping.",
  },
  {
    title: 'Monsoon Paw Care for Dogs',
    summary: 'Preventing fungal paw infections during wet-season walks.',
    petType: ['dog'], season: 'monsoon', tags: ['monsoon', 'paws'], img: 'photo-1601758228041-f3b2795255f1',
    content: "Wet pavements, puddles, and muddy paths during monsoon season create constant moisture exposure for a dog's paws, and paws that stay damp for extended periods are far more prone to fungal and bacterial infections between the toes, a condition sometimes called interdigital dermatitis.\n\nAfter every walk during monsoon season, dry your dog's paws thoroughly with a towel, paying particular attention to the webbing between toes where moisture lingers longest. A quick check for redness, unusual odor, or excessive licking at the paws can catch problems early.\n\nTrimming excess fur between the paw pads, if your dog's breed has longer paw fur, reduces how much moisture gets trapped after wet walks. Avoid walking through visibly stagnant or dirty puddles when possible, since these can also carry bacteria and parasites beyond just causing dampness.\n\nIf you notice your dog licking or chewing at their paws more than usual, or any swelling, redness, or unpleasant smell, see a vet rather than waiting. Untreated interdigital infections can become quite painful and may need a course of antibiotics or antifungals to resolve, whereas early cases often respond quickly to simple drying and hygiene measures.",
  },
  {
    title: 'Bringing Home a New Kitten: First Week Checklist',
    summary: 'Essential steps for a smooth transition for a new kitten.',
    petType: ['cat'], season: 'all', tags: ['new owner', 'kitten'], img: 'photo-1533738363-b7f9aef128ce',
    content: "The first week with a new kitten sets the tone for their comfort in your home, and a few practical steps make the transition considerably smoother for both the kitten and the household.\n\nSet up a small, quiet safe room initially rather than giving full house access immediately. A spare room or bathroom with litter box, food, water, and a hiding spot lets the kitten adjust without being overwhelmed. Gradually expand access over several days as they show confidence.\n\nSchedule a first vet visit within the first week if one hasn't already happened, to check general health, discuss a vaccination schedule, and address deworming and flea prevention from the start. This is also the right time to ask about spay/neuter timing.\n\nKitten-proof your space: secure loose wires, remove small objects that could be swallowed, and check that windows and balconies are secured, since kittens are agile climbers with limited judgment about heights. Introduce existing pets slowly over days, not in one sudden meeting; scent swapping before a face-to-face introduction reduces stress considerably.\n\nExpect some vocalizing and exploring at night initially. This is normal adjustment behavior, not necessarily distress, and typically settles within the first couple of weeks as the kitten builds confidence in the new environment.",
  },
  {
    title: 'Common Bird Respiratory Issues in Winter',
    summary: 'Cold-weather respiratory risks for pet birds and prevention tips.',
    petType: ['bird'], season: 'winter', tags: ['winter', 'respiratory'], img: 'photo-1520808663317-647b476a81b9',
    content: "Birds have a highly efficient but sensitive respiratory system, and cold, dry winter air combined with indoor heating can worsen respiratory irritation and increase susceptibility to infections during Kathmandu's winter months.\n\nWatch for tail-bobbing with each breath, open-mouth breathing, audible clicking or wheezing sounds, nasal or eye discharge, and reduced vocalization or activity. Because birds mask illness instinctively, by the time symptoms are obvious, the condition may already be fairly advanced.\n\nAvoid placing bird cages near heating vents or space heaters, which dry out the air excessively and create temperature swings between day and night. A stable, moderate room temperature is better than a hot room that then goes cold once heating is turned off overnight.\n\nGood ventilation still matters even in winter. Avoid cooking fumes, aerosols, and non-stick cookware overheating near the bird's living area, as these release fumes that are far more dangerous to birds' sensitive respiratory systems than to humans or other pets, and can cause acute respiratory distress.\n\nAny bird showing respiratory symptoms should be seen by a vet experienced with avian patients promptly, since respiratory infections in birds can progress quickly, and general small-animal vets may not have the specific avian-medicine training needed for accurate treatment.",
  },
  {
    title: 'How to Introduce a New Dog to Your Household',
    summary: 'Step-by-step guidance for introducing dogs safely.',
    petType: ['dog'], season: 'all', tags: ['new owner', 'behaviour'], img: 'photo-1543466835-00a7907e9de1',
    content: "Introducing a new dog to an existing pet household works best as a gradual, structured process rather than a single dramatic first meeting. Rushing this step is one of the most common causes of ongoing tension between household pets.\n\nStart with scent introductions before any face-to-face meeting: swap bedding or use a cloth rubbed on each animal to let them get familiar with each other's smell first. This reduces the shock of a completely unfamiliar animal at first sight.\n\nWhen it's time for a direct introduction, choose neutral territory rather than one dog's established space, keep both dogs on leash initially, and keep the first meeting brief and calm. A short, positive interaction is far better than a long one that turns tense. Watch body language closely: stiff posture, prolonged staring, or raised hackles are signs to pause and separate calmly rather than push through.\n\nFeed and manage resources separately at first to avoid resource-guarding conflicts before the dogs have built trust. Gradual supervised time together, increasing over days or weeks depending on how comfortable both dogs seem, tends to produce better long-term results than trying to force quick bonding.\n\nIf tension persists beyond the first couple of weeks, or if there's any aggressive behavior, consulting a vet or animal behaviorist early prevents small issues from becoming entrenched habits.",
  },
  {
    title: 'Summer Grooming Tips for Long-Haired Cats',
    summary: 'Managing heat and matting in long-haired breeds during summer.',
    petType: ['cat'], season: 'summer', tags: ['summer', 'grooming'], img: 'photo-1601758228041-f3b2795255f1',
    content: "Long-haired cat breeds face a double challenge in summer: their thick coat retains heat more than a short-haired cat's, and matted fur, common if not brushed regularly, traps even more heat against the skin while also restricting airflow.\n\nDaily or near-daily brushing during summer months prevents mats from forming in the first place, which is far easier than removing established mats later. Focus especially on areas prone to matting: behind the ears, under the arms, and around the belly and hind legs.\n\nSome owners opt for a professional lion cut or partial trim during peak summer heat. This can genuinely help cats that struggle with heat or have chronic matting issues, though it should be done by an experienced groomer since cat skin is delicate and prone to nicks.\n\nWatch for signs your cat is overheating despite grooming efforts: excessive panting, which is unusual in cats and worth taking seriously, lethargy, or seeking out cool tiled floors more than usual. Ensure fresh water is available in multiple bowls, and consider a cool, shaded resting spot away from direct sun through windows, since indoor cats can still overheat from sun exposure through glass.",
  },
  {
    title: 'Recognizing Emergency Symptoms in Pets',
    summary: 'When a symptom means you should go to the vet immediately.',
    petType: ['dog', 'cat'], season: 'all', tags: ['emergency'], img: 'photo-1559839734-2b71ea197ec2',
    content: "Knowing which symptoms warrant an immediate emergency visit, versus which can reasonably wait for a scheduled appointment, helps owners act quickly when it matters most, without unnecessary panic over minor issues.\n\nSeek emergency care immediately for: difficulty breathing or persistent gasping, collapse or inability to stand, seizures, suspected poisoning, a bloated or distended abdomen especially in large-breed dogs, severe or uncontrolled bleeding, inability to urinate especially in male cats, and any trauma from a fall, vehicle accident, or fight with another animal.\n\nSymptoms that warrant a same-day or next-day vet visit but aren't necessarily emergencies include vomiting or diarrhea lasting more than a day, limping without obvious severe injury, mild lethargy with continued eating and drinking, and minor cuts without heavy bleeding.\n\nWhen in doubt, it's always safer to call a vet or emergency clinic to describe the symptom rather than assuming it's minor. A brief phone description often helps a vet advise whether immediate care is needed or whether monitoring at home is reasonable, and having this option readily accessible before an emergency happens is worth setting up in advance.",
  },
  {
    title: 'Rabbit Housing: Indoor vs Outdoor',
    summary: "Weighing the pros and cons of each housing setup in Nepal's climate.",
    petType: ['rabbit'], season: 'all', tags: ['rabbit', 'housing'], img: 'photo-1585110396000-c9ffd4e4b308',
    content: "Choosing between indoor and outdoor housing for a pet rabbit involves genuine tradeoffs, and Nepal's seasonal extremes, hot summers, heavy monsoon rain, and cold winters, make this decision particularly consequential compared to more temperate climates.\n\nOutdoor housing exposes rabbits to temperature extremes that they're not well-equipped to handle. Rabbits are actually more heat-sensitive than cold-sensitive, and summer heat combined with limited shade can be genuinely dangerous. Monsoon rain also creates dampness and flooding risk for ground-level outdoor hutches, along with increased parasite and predator exposure.\n\nIndoor housing offers more stable temperatures and protection from weather extremes and predators, but requires rabbit-proofing, covering electrical cords, blocking access to houseplants which are often toxic, and providing adequate space for exercise, since rabbits need significant daily movement, not just a small cage.\n\nIf outdoor housing is chosen, the hutch should be elevated off the ground, provide substantial shade and ventilation for summer, be moved or protected from monsoon flooding, and include extra insulation and bedding for winter. Regardless of housing choice, rabbits need several hours of supervised exercise time outside their primary enclosure daily for both physical and mental health.",
  },
  {
    title: 'Post-Surgery Care for Dogs',
    summary: 'What to expect and how to care for your dog after surgery.',
    petType: ['dog'], season: 'all', tags: ['surgery', 'recovery'], img: 'photo-1552053831-71594a27632d',
    content: "Recovery care after surgery significantly affects healing outcomes, and following your vet's specific post-operative instructions closely, rather than assuming general common sense is enough, reduces complications considerably.\n\nAn Elizabethan collar or recovery suit prevents licking or chewing at the incision site, which is one of the most common causes of post-surgical infection or wound reopening. Even a normally calm dog may attempt to lick at an incision once anesthesia wears off and mild discomfort sets in, so consistent use of the protective collar matters even when your dog seems fine.\n\nActivity restriction is equally important. Most surgeries require limiting jumping, running, and stairs for 10-14 days, even after your dog appears to be feeling back to normal. Dogs often feel better than their internal healing actually is, and premature activity is a common cause of complications like incisional hernias or wound reopening.\n\nMonitor the incision daily for excessive redness, swelling, discharge, or a foul odor, and check that your dog is eating, drinking, and toileting normally within the expected timeframe your vet outlined. Pain medication should be given exactly as prescribed, not withheld once your dog seems fine, since dogs often mask pain and adequate pain control actually supports faster healing.",
  },
  {
    title: "Winter Weight Gain: Managing Your Pet's Diet",
    summary: 'Preventing unhealthy weight gain during colder, less active months.',
    petType: ['dog', 'cat'], season: 'winter', tags: ['winter', 'nutrition'], img: 'photo-1522926193341-e9ffd686c60f',
    content: "Winter often brings reduced activity for pets, shorter walks, less outdoor play, more time curled up indoors, while appetite frequently stays the same or even increases, creating a common pattern of gradual winter weight gain that many owners don't notice until spring.\n\nExcess weight puts additional strain on joints, a particular concern for senior or arthritic pets already dealing with cold-weather stiffness, and is linked to a range of health issues including diabetes and reduced life expectancy, making winter weight management genuinely worth the attention.\n\nRather than cutting portions drastically, focus on maintaining consistent measured meals using an actual measuring cup, not estimation, and limiting winter treat-giving, which often increases during colder months when both pets and owners spend more time together indoors.\n\nIndoor exercise alternatives help offset reduced outdoor activity. Interactive food puzzles, short indoor play sessions, and stair-climbing where safe can maintain some activity level even when outdoor walks are shorter due to cold or early darkness. A simple monthly weight check helps catch gradual weight gain before it becomes a larger issue by the time warmer weather returns.",
  },
  {
    title: 'Understanding Vaccination Schedules for Cats',
    summary: 'Core and non-core vaccines cats need and when.',
    petType: ['cat'], season: 'all', tags: ['vaccination'], img: 'photo-1533738363-b7f9aef128ce',
    content: "Cat vaccination protects against several serious viral diseases, and understanding the difference between core, recommended for all cats, and non-core, recommended based on lifestyle and risk, vaccines helps owners make informed decisions alongside their vet.\n\nCore vaccines typically include protection against feline panleukopenia, feline calicivirus, and feline herpesvirus, often combined as FVRCP, plus rabies where legally required. Kittens usually start this series around 6-8 weeks, with boosters every 3-4 weeks until 16 weeks old, followed by a booster at one year and then every 1-3 years depending on the specific vaccine and your vet's recommendation.\n\nNon-core vaccines, such as feline leukemia virus, are typically recommended based on lifestyle. Outdoor access, contact with unknown cats, or multi-cat households increase risk considerably, while a strictly single-cat indoor household may have lower risk that doesn't always justify this additional vaccine.\n\nEven strictly indoor cats benefit from core vaccination, since some viruses can be brought inside on clothing or shoes, and indoor status can change unexpectedly. Discuss your cat's specific lifestyle and risk factors with your vet to determine the right non-core vaccine additions beyond the core series.",
  },
  {
    title: 'Monsoon-Safe Walking Routes and Times',
    summary: 'Reducing infection risk while still exercising your dog in the rain.',
    petType: ['dog'], season: 'monsoon', tags: ['monsoon', 'exercise'], img: 'photo-1573865526739-10659fec78a5',
    content: "Dogs still need regular exercise during monsoon season, but a few adjustments to timing and route reduce the health risks that come with wet-season walking without requiring you to skip exercise entirely.\n\nTime walks between rain showers when possible, and avoid walking immediately after heavy rainfall when puddles and standing water are at their peak, as these often carry higher bacterial and parasite loads from runoff. Early morning, before the day's rain typically begins, tends to be a more reliable window during monsoon season.\n\nChoose routes that avoid low-lying areas prone to flooding or standing water, and steer away from areas near open drains or waste collection points, which pose higher contamination risk during heavy rain when overflow is more likely.\n\nBring a towel for post-walk drying, paws especially, and consider a light rain-appropriate dog coat for short-haired breeds to reduce how long fur stays wet after a walk, since prolonged dampness is what drives most monsoon-related skin issues rather than the rain exposure itself.\n\nIf outdoor walking becomes genuinely impractical during the heaviest rain days, short indoor play sessions or a securely covered balcony or porch area can provide a reasonable substitute for a day or two without significant impact on your dog's overall exercise needs.",
  },
  {
    title: "Caring for a Pet Bird's Feathers",
    summary: 'Feather health basics and signs of underlying illness.',
    petType: ['bird'], season: 'all', tags: ['bird', 'grooming'], img: 'photo-1520808663317-647b476a81b9',
    content: "A bird's feather condition is one of the clearest visible indicators of overall health, since feather quality depends on proper nutrition, and behavioral changes around feathers often signal underlying stress or medical issues rather than simple grooming habits.\n\nNormal preening, a bird using its beak to clean and align feathers, is a healthy, routine behavior and shouldn't be confused with feather-plucking, which involves actively pulling out feathers and can leave bald patches, particularly on the chest and legs where a bird can reach easily.\n\nFeather-plucking has multiple possible causes: boredom and lack of mental stimulation, stress from an inadequate cage size or location, an underlying skin or systemic illness, or nutritional deficiencies. Because the causes vary so much, a vet visit is important to rule out medical causes before assuming it's purely behavioral.\n\nA balanced diet, not seed-only which is nutritionally incomplete on its own, supports healthy feather growth. Pellets alongside fresh vegetables and limited seed treats provide more complete nutrition than seed mixes alone. Regular time outside the cage for mental stimulation and natural light exposure also supports overall feather and skin health.",
  },
  {
    title: 'Dealing with Separation Anxiety in Dogs',
    summary: 'Recognizing and managing anxiety when dogs are left alone.',
    petType: ['dog'], season: 'all', tags: ['behaviour'], img: 'photo-1543466835-00a7907e9de1',
    content: "Separation anxiety is a genuine behavioral and emotional condition, not simple misbehavior, and recognizing it as such changes how effectively it can be addressed. Punishment-based approaches typically worsen anxiety-driven behavior rather than resolving it.\n\nCommon signs include destructive chewing focused specifically on doors and windows, excessive vocalization that starts shortly after you leave, house-soiling despite being otherwise house-trained, and pacing or drooling specifically tied to your departure. A dog showing these signs consistently only when left alone, and not otherwise, points toward separation-specific anxiety.\n\nGradual desensitization tends to work better than either ignoring the issue or introducing prolonged absences too quickly. Start with very short departures, even just stepping outside for a minute, and gradually increase duration only once your dog shows they can handle the current step calmly.\n\nCreating positive associations with departure cues, such as picking up keys or putting on shoes, by practicing these actions without actually leaving can reduce the anticipatory anxiety that builds before you even walk out the door. For moderate to severe cases, working with a vet or animal behaviorist is worthwhile, since some cases benefit from a structured behavior modification plan alongside environmental changes.",
  },
  {
    title: 'Choosing a Verified Vet: What to Look For',
    summary: 'Key credentials and questions to ask before your first visit.',
    petType: ['dog', 'cat'], season: 'all', tags: ['new owner', 'trust'], img: 'photo-1559839734-2b71ea197ec2',
    content: "Choosing a vet is one of the most consequential decisions a pet owner makes, yet many owners in Nepal have historically had limited ways to verify credentials or compare options before their first visit, something a platform like PetSneha's verified directory is specifically designed to address.\n\nA legitimate license number registered with the appropriate veterinary council is the baseline credential to look for. A verified badge on a vet directory profile typically indicates this has already been checked, saving you the step of verifying it yourself.\n\nBeyond licensing, consider years of experience relevant to your pet's needs, clear fee transparency before booking, and genuine reviews from other pet owners rather than relying solely on a clinic's own marketing.\n\nIt's reasonable to ask directly about a vet's experience with your specific pet type or breed, especially for less common pets like birds, rabbits, or reptiles that require more specialized knowledge than general small-animal practice covers. A good vet welcomes these questions rather than treating them as an inconvenience.\n\nFinally, consider practical factors like clinic location, availability hours, and whether the vet is open to a second opinion or referral for complex cases, all signs of a practice genuinely centered on animal welfare rather than just transaction volume.",
  },
  {
    title: "Summer Hydration Tips for Outdoor Pets",
    summary: "Keeping pets hydrated and cool during Kathmandu's hottest months.",
    petType: ['dog', 'cat'], season: 'summer', tags: ['summer', 'hydration'], img: 'photo-1601758228041-f3b2795255f1',
    content: "Proper hydration becomes significantly more important during summer heat, and pets that spend any time outdoors, even just a yard or balcony, need more deliberate water access planning than during cooler months.\n\nPlace multiple water bowls in different locations, both indoors and in any outdoor space your pet accesses, since a single bowl can be knocked over, run dry, or simply be inconvenient to reach during the hottest part of the day. Check water levels more frequently in summer, as pets drink more and water also evaporates faster in heat.\n\nAdding ice cubes to water bowls helps keep water cooler for longer during peak afternoon heat, and some pets enjoy licking ice cubes directly as an added cooling activity, though this should supplement rather than replace regular water access.\n\nWatch for signs of dehydration: dry or tacky gums, reduced skin elasticity, lethargy, and reduced urination. Cats in particular are prone to under-drinking even when water is available, so wet food can help boost overall hydration for cats that don't drink much on their own.\n\nDuring especially hot days, limiting strenuous outdoor activity to early morning or evening hours, alongside consistent water access, meaningfully reduces heat-related health risks for both dogs and cats.",
  },
  {
    title: 'Recognizing Pain in Cats: A Subtle Art',
    summary: 'Cats hide pain well — behavioural cues owners often miss.',
    petType: ['cat'], season: 'all', tags: ['health', 'behaviour'], img: 'photo-1533738363-b7f9aef128ce',
    content: "Cats are instinctively skilled at concealing pain, a survival trait from their wild ancestry, where showing weakness could mean becoming a target for predators. This makes recognizing pain in cats considerably harder than in dogs, and owners often underestimate how much discomfort a cat is actually experiencing.\n\nSubtle behavioral changes are often more reliable indicators than obvious signs like limping or vocalizing. Watch for reduced grooming, changes in litter box habits such as straining or avoiding the box, reduced appetite, and decreased interest in play or interaction.\n\nPosture changes matter too. A cat sitting hunched with all four paws tucked tightly under the body, or reluctant to jump onto normally-used furniture, can indicate joint or abdominal pain even without an obvious limp. Facial expression changes, such as squinted eyes, flattened ears, or tense whisker position, have been studied as pain indicators in cats and can be a useful, if subtle, cue.\n\nBecause cats mask pain so effectively, any behavioral change that persists for more than a day or two, even if it seems minor, is worth mentioning to a vet rather than dismissing as normal cat behavior. Cats experiencing chronic pain often adjust their behavior so gradually that owners don't notice the decline until it's pointed out or the cat's mobility is directly tested.",
  },
];

async function resolveVets() {
  const vets = [];
  for (const id of VET_IDENTIFIERS) {
    let vet;
    if (id.byEmail) {
      const user = await User.findOne({ email: id.byEmail });
      if (user) vet = await Vet.findOne({ userId: user._id });
    } else {
      vet = await Vet.findOne({ name: id.byName });
    }
    if (vet) vets.push(vet);
    else console.warn(`  ! Could not resolve vet ${id.byEmail || id.byName} — skipping as an author.`);
  }
  return vets;
}

async function run() {
  console.log('Connecting to', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('Connected.');

  const vets = await resolveVets();
  if (!vets.length) throw new Error('No vets resolved — run files 1-3 first.');
  console.log(`Resolved ${vets.length} vet(s) as potential authors.`);

  let created = 0;
  for (let i = 0; i < ARTICLES.length; i++) {
    const a = ARTICLES[i];
    const author = vets[i % vets.length]; // round-robin across all resolved vets
    const exists = await Article.findOne({ title: a.title, authorId: author._id });
    if (exists) continue;

    // Unverified vets' articles always stay unpublished; otherwise ~20% held for review to test admin moderation
    const isPending = !author.isVerified || i % 5 === 0;

    await Article.create({
      title: a.title,
      content: a.content,
      summary: a.summary,
      authorId: author._id,
      petType: a.petType,
      tags: a.tags,
      season: a.season,
      isVerified: !isPending,
      isPublished: !isPending,
      readTime: Math.max(2, Math.round(a.content.split(/\s+/).length / 200)),
      imageUrl: `https://images.unsplash.com/${a.img}?w=800`,
      views: isPending ? 0 : Math.floor(Math.random() * 150),
    });
    created++;
  }

  console.log(`Created ${created} articles across ${vets.length} authors.`);
  console.log('\n=== FILE 5 COMPLETE — ALL 5 SEED FILES DONE ===');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Seed failed:', err);
  mongoose.disconnect();
});