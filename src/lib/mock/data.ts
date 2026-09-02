import girCow from "@/assets/gir-cow.jpg";
import buffalo from "@/assets/buffalo.jpg";
import goat from "@/assets/goat.jpg";
import sheep from "@/assets/sheep.jpg";
import poultry from "@/assets/poultry.jpg";
import cowWhite from "@/assets/cow-white.jpg";
import grazing from "@/assets/grazing.jpg";
import vetVisit from "@/assets/vet-visit.jpg";
import type {
  Animal, AreaAlert, FirstAidTopic, HealthCase, Hospital, Species, VaccinationCamp, Vet,
} from "../types";

export const images = { girCow, buffalo, goat, sheep, poultry, cowWhite, grazing, vetVisit };

export const speciesPhoto: Record<Species, string> = {
  cow: girCow,
  buffalo,
  goat,
  sheep,
  poultry,
  multiple: grazing,
  other: cowWhite,
};

export const farmer = {
  name: "Ramesh",
  nameHi: "रमेश",
  village: "Rampur",
  villageHi: "रामपुर",
  district: "Sitapur",
  totalAnimals: 24,
};

const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const todayIso = daysFromNow(0);

export const animals: Animal[] = [
  {
    id: "KC-00124",
    name: "Ganga",
    species: "cow",
    breed: "Gir Cow",
    gender: "female",
    ageYears: 4,
    status: "healthy",
    photo: girCow,
    vaccinations: [
      { id: "v1", name: "FMD", dueDate: daysFromNow(5), status: "due" },
      { id: "v2", name: "HS (Haemorrhagic Septicaemia)", givenDate: "2026-03-12", status: "done" },
      { id: "v3", name: "Brucellosis", givenDate: "2025-11-02", status: "done" },
    ],
    movement: [
      { id: "m1", place: "Farm", placeKey: "farm", from: "06:00", to: "08:00", date: todayIso },
      { id: "m2", place: "North Grazing Area", placeKey: "grazing", from: "08:00", to: "11:30", date: todayIso },
      { id: "m3", place: "Farm", placeKey: "farm", from: "11:30", date: todayIso },
    ],
    history: [
      { id: "h1", date: "2026-03-12", title: "HS vaccination", kind: "visit", detail: "Dr. Anita Verma" },
      { id: "h2", date: "2025-12-04", title: "Mild fever reported", kind: "report", detail: "Resolved in 3 days" },
      { id: "h3", date: "2025-12-05", title: "Antipyretic course (3 days)", kind: "treatment", detail: "Prescribed by Dr. Anita Verma" },
    ],
  },
  {
    id: "KC-00131",
    name: "Lakshmi",
    species: "buffalo",
    breed: "Murrah Buffalo",
    gender: "female",
    ageYears: 5,
    status: "attention",
    statusNote: "reducedAppetite",
    photo: buffalo,
    vaccinations: [
      { id: "v4", name: "FMD", givenDate: "2026-06-01", status: "done" },
      { id: "v5", name: "HS (Haemorrhagic Septicaemia)", dueDate: daysFromNow(-3), status: "overdue" },
    ],
    movement: [
      { id: "m4", place: "Farm", placeKey: "farm", from: "06:00", to: "07:30", date: todayIso },
      { id: "m5", place: "Village Water Point", placeKey: "waterPoint", from: "07:30", to: "08:15", date: todayIso },
      { id: "m6", place: "Farm", placeKey: "farm", from: "08:15", date: todayIso },
    ],
    history: [
      { id: "h4", date: daysFromNow(-1), title: "Reduced appetite noticed", kind: "note" },
    ],
  },
  {
    id: "KC-00140",
    name: "Kaju",
    species: "goat",
    breed: "Jamunapari Goat",
    gender: "male",
    ageYears: 2,
    status: "healthy",
    photo: goat,
    vaccinations: [
      { id: "v6", name: "PPR", givenDate: "2026-01-02", status: "done" },
      { id: "v7", name: "Enterotoxaemia", dueDate: daysFromNow(40), status: "due" },
    ],
    movement: [
      { id: "m7", place: "Farm", placeKey: "farm", from: "06:00", date: todayIso },
    ],
    history: [{ id: "h5", date: "2026-01-02", title: "PPR vaccination", kind: "visit", detail: "Camp – Rampur" }],
  },
  {
    id: "KC-00118",
    name: "Radha",
    species: "cow",
    breed: "Hariana Cow",
    gender: "female",
    ageYears: 6,
    status: "care",
    statusNote: "underTreatment",
    photo: cowWhite,
    activeCaseId: "PH-1024",
    vaccinations: [
      { id: "v8", name: "FMD", givenDate: "2026-05-14", status: "done" },
      { id: "v9", name: "HS (Haemorrhagic Septicaemia)", givenDate: "2026-03-12", status: "done" },
    ],
    movement: [
      { id: "m8", place: "Farm", placeKey: "farm", from: "06:00", to: "08:00", date: daysFromNow(-1) },
      { id: "m9", place: "North Grazing Area", placeKey: "grazing", from: "08:00", to: "11:30", date: daysFromNow(-1) },
      { id: "m10", place: "Farm", placeKey: "farm", from: "11:30", date: daysFromNow(-1) },
    ],
    history: [
      { id: "h6", date: daysFromNow(-2), title: "Fever and breathing difficulty reported", kind: "report", detail: "Case PH-1024" },
      { id: "h7", date: daysFromNow(-1), title: "Vet visit – Dr. Anita Verma", kind: "visit", detail: "Samples collected, treatment started" },
      { id: "h8", date: daysFromNow(-1), title: "Antibiotic course (5 days)", kind: "treatment", detail: "As prescribed" },
    ],
  },
];

export const seedCases: HealthCase[] = [
  {
    id: "PH-1024",
    animalId: "KC-00118",
    animalName: "Radha",
    species: "cow",
    symptoms: ["fever", "breathing"],
    count: "1",
    onset: "2-3d",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    assessment: {
      score: 78,
      level: "high",
      reasons: ["Fever reported", "Breathing difficulty", "Symptoms for 2–3 days"],
    },
    stage: "treatment",
    syncState: "synced",
    vetEta: "Visited",
    vetInstructions: [
      "Give the prescribed medicine morning and evening for 5 days.",
      "Keep Radha in a shaded, well-ventilated place.",
      "Offer fresh water and soft green fodder often.",
      "Call immediately if breathing becomes faster or she stops eating.",
    ],
    recovery: [
      {
        id: "r1",
        date: new Date(Date.now() - 86400000).toISOString(),
        overall: "same",
        eating: "less",
        activity: "less",
      },
    ],
    location: "Rampur",
    mode: "questions",
  },
];

export const vets: Vet[] = [
  {
    id: "vet1",
    name: "Dr. Anita Verma",
    role: "Veterinary Officer, Rampur",
    roleHi: "पशु चिकित्सा अधिकारी, रामपुर",
    phone: "+91 98765 43210",
    availability: "available",
    photoInitials: "AV",
    activeCases: 3,
  },
];

export const hospital: Hospital = {
  name: "Government Veterinary Hospital, Rampur",
  nameHi: "सरकारी पशु चिकित्सालय, रामपुर",
  distanceKm: 3.2,
  open: true,
  phone: "+91 5862 234 567",
  hours: "8:00 AM – 4:00 PM",
};

export const vaccinationCamp: VaccinationCamp = {
  location: "Panchayat Bhawan, Rampur",
  locationHi: "पंचायत भवन, रामपुर",
  date: daysFromNow(4),
  time: "9:00 AM – 1:00 PM",
  verified: true,
};

export const areaStatus = {
  level: "elevated" as "normal" | "elevated" | "high",
  nearbyReports: 8,
  signs: ["fever", "coughing", "notEating"] as const,
};

export const alerts: AreaAlert[] = [
  {
    id: "a1",
    category: "health",
    title: "Your area's health activity has increased",
    titleHi: "आपके क्षेत्र में बीमारी की गतिविधि बढ़ी है",
    body: "8 similar livestock health reports were recorded within 5 km in the last 7 days.",
    bodyHi: "पिछले 7 दिनों में 5 किमी के भीतर 8 ऐसी ही पशु स्वास्थ्य रिपोर्ट दर्ज हुई हैं।",
    date: todayIso,
    nearbyReports: 8,
    signs: ["fever", "coughing", "notEating"],
    precautions: [
      { en: "Check each animal's appetite and breathing every morning.", hi: "हर सुबह हर पशु का खाना और सांस जांचें।" },
      { en: "Avoid mixing your herd with other herds at water points this week.", hi: "इस हफ़्ते पानी स्थल पर अपने पशुओं को दूसरे झुंडों से न मिलाएं।" },
      { en: "Keep new or returning animals separate for a few days.", hi: "नए या लौटे पशुओं को कुछ दिन अलग रखें।" },
      { en: "Report any fever or coughing early — early reports protect the whole village.", hi: "बुखार या खांसी तुरंत रिपोर्ट करें — जल्दी रिपोर्ट पूरे गाँव को बचाती है।" },
    ],
  },
  {
    id: "a2",
    category: "vaccination",
    title: "FMD vaccination camp on Saturday",
    titleHi: "शनिवार को FMD टीकाकरण शिविर",
    body: "Free FMD vaccination at Panchayat Bhawan, Rampur, 9:00 AM – 1:00 PM. Bring your animal ID.",
    bodyHi: "पंचायत भवन, रामपुर में मुफ़्त FMD टीकाकरण, सुबह 9 – दोपहर 1 बजे। पशु ID साथ लाएं।",
    date: daysFromNow(4),
  },
  {
    id: "a3",
    category: "prevention",
    title: "Monsoon shelter care",
    titleHi: "मानसून में बाड़े की देखभाल",
    body: "Keep bedding dry and remove standing water near the shelter to reduce infections and flies.",
    bodyHi: "बिछावन सूखा रखें और बाड़े के पास जमा पानी हटाएं ताकि संक्रमण और मक्खियाँ कम हों।",
    date: daysFromNow(-2),
    precautions: [
      { en: "Change wet bedding daily.", hi: "गीला बिछावन रोज़ बदलें।" },
      { en: "Clean water troughs every two days.", hi: "पानी की नांद हर दो दिन साफ़ करें।" },
      { en: "Ensure good airflow in the shelter.", hi: "बाड़े में हवा का आना-जाना ठीक रखें।" },
    ],
  },
];

/**
 * Approved first-aid knowledge base.
 * In production this is maintained by veterinarians/admins and fetched from the API.
 * Content here is limited to low-risk, general safety guidance.
 */
export const firstAidTopics: FirstAidTopic[] = [
  {
    id: "bleeding",
    title: "Bleeding / Injury",
    titleHi: "खून बहना / चोट",
    urgent: true,
    icon: "droplets",
    doSteps: [
      { en: "Keep the animal calm and still in a safe place.", hi: "पशु को शांत और सुरक्षित जगह पर स्थिर रखें।" },
      { en: "Press a clean cloth firmly on the wound to slow bleeding.", hi: "घाव पर साफ़ कपड़ा मज़बूती से दबाएं ताकि खून कम बहे।" },
      { en: "Keep the wound away from dirt, flies and water until the vet arrives.", hi: "डॉक्टर आने तक घाव को गंदगी, मक्खी और पानी से बचाएं।" },
    ],
    avoid: [
      { en: "Do not apply turmeric, ash, oil or any home remedy inside the wound.", hi: "घाव के अंदर हल्दी, राख, तेल या कोई घरेलू नुस्खा न लगाएं।" },
      { en: "Do not give any medicine without the vet's instruction.", hi: "डॉक्टर की सलाह के बिना कोई दवा न दें।" },
    ],
    approvedBy: "District Veterinary Panel",
    version: "2026.1",
  },
  {
    id: "breathing",
    title: "Breathing Difficulty",
    titleHi: "सांस लेने में तकलीफ़",
    urgent: true,
    icon: "wind",
    doSteps: [
      { en: "Move the animal to a shaded, open, well-ventilated area.", hi: "पशु को छायादार, खुली और हवादार जगह ले जाएं।" },
      { en: "Loosen any rope or halter around the neck.", hi: "गले की रस्सी या पट्टा ढीला करें।" },
      { en: "Keep other animals away and avoid making the animal walk.", hi: "दूसरे पशुओं को दूर रखें और पशु को चलने से बचाएं।" },
    ],
    avoid: [
      { en: "Do not pour water into the mouth or nose.", hi: "मुँह या नाक में पानी न डालें।" },
      { en: "Do not force the animal to eat or drink.", hi: "खाने-पीने के लिए ज़बरदस्ती न करें।" },
    ],
    approvedBy: "District Veterinary Panel",
    version: "2026.1",
  },
  {
    id: "collapse",
    title: "Animal Collapse",
    titleHi: "पशु का गिर जाना",
    urgent: true,
    icon: "heart-pulse",
    doSteps: [
      { en: "Ensure the animal is lying on its side on soft ground, not on its back.", hi: "पशु को नरम ज़मीन पर करवट लिटाएं, पीठ के बल नहीं।" },
      { en: "Provide shade and keep the area quiet.", hi: "छाया दें और आस-पास शांति रखें।" },
      { en: "Note the time it collapsed and tell the veterinarian.", hi: "गिरने का समय नोट करें और डॉक्टर को बताएं।" },
    ],
    avoid: [
      { en: "Do not try to lift or drag the animal.", hi: "पशु को उठाने या खींचने की कोशिश न करें।" },
      { en: "Do not give any injection or medicine yourself.", hi: "खुद कोई इंजेक्शन या दवा न दें।" },
    ],
    approvedBy: "District Veterinary Panel",
    version: "2026.1",
  },
  {
    id: "eye",
    title: "Eye Injury",
    titleHi: "आँख की चोट",
    urgent: false,
    icon: "eye",
    doSteps: [
      { en: "Keep the animal in a shaded place away from dust and flies.", hi: "पशु को धूल और मक्खी से दूर छाया में रखें।" },
      { en: "Gently rinse around the eye with clean water if there is dirt.", hi: "गंदगी हो तो आँख के आस-पास साफ़ पानी से धीरे से धोएं।" },
    ],
    avoid: [
      { en: "Do not put any drops, powder or home remedy into the eye.", hi: "आँख में कोई बूंद, पाउडर या घरेलू नुस्खा न डालें।" },
      { en: "Do not rub the eye.", hi: "आँख को रगड़ें नहीं।" },
    ],
    approvedBy: "District Veterinary Panel",
    version: "2026.1",
  },
  {
    id: "bite",
    title: "Possible Bite / Sting",
    titleHi: "काटने / डंक की आशंका",
    urgent: true,
    icon: "bug",
    doSteps: [
      { en: "Keep the animal calm and reduce movement.", hi: "पशु को शांत रखें और हिलना-डुलना कम करें।" },
      { en: "Note where the bite is and the time — tell the veterinarian.", hi: "काटने की जगह और समय नोट करें — डॉक्टर को बताएं।" },
      { en: "Wash the area gently with clean water.", hi: "जगह को साफ़ पानी से धीरे से धोएं।" },
    ],
    avoid: [
      { en: "Do not cut, suck or tie tightly above the bite.", hi: "काटने की जगह को काटें, चूसें या ऊपर कसकर न बांधें।" },
      { en: "Do not delay — call the veterinarian right away.", hi: "देर न करें — तुरंत डॉक्टर को कॉल करें।" },
    ],
    approvedBy: "District Veterinary Panel",
    version: "2026.1",
  },
  {
    id: "otherEmergency",
    title: "Other Emergency",
    titleHi: "अन्य आपात स्थिति",
    urgent: false,
    icon: "life-buoy",
    doSteps: [
      { en: "Separate the animal from the herd where practical.", hi: "जहाँ संभव हो, पशु को झुंड से अलग करें।" },
      { en: "Provide shade, clean water and a quiet place.", hi: "छाया, साफ़ पानी और शांत जगह दें।" },
      { en: "Take a photo or voice note of what you see and report it.", hi: "जो दिख रहा है उसकी फोटो या आवाज़ रिकॉर्ड करें और रिपोर्ट करें।" },
    ],
    avoid: [
      { en: "Do not use medicine meant for humans or another animal.", hi: "इंसानों या दूसरे पशु की दवा इस्तेमाल न करें।" },
    ],
    approvedBy: "District Veterinary Panel",
    version: "2026.1",
  },
];

export const safetyMeasures = [
  { en: "Keep the suspected sick animal separated from healthy animals where practical.", hi: "जहाँ संभव हो, बीमार पशु को स्वस्थ पशुओं से अलग रखें।" },
  { en: "Avoid unnecessary movement of the animal.", hi: "पशु को बिना ज़रूरत इधर-उधर न ले जाएं।" },
  { en: "Avoid sharing feeding and watering equipment where possible.", hi: "जहाँ संभव हो, चारे-पानी के बर्तन साझा न करें।" },
  { en: "Monitor other animals for unusual signs.", hi: "दूसरे पशुओं में असामान्य लक्षण देखें।" },
  { en: "Tell the veterinarian where the animal has recently been.", hi: "डॉक्टर को बताएं कि पशु हाल में कहाँ गया था।" },
];

export const checklistItems = [
  { id: "water", key: "chkWater" },
  { id: "sick", key: "chkSick" },
  { id: "shelter", key: "chkShelter" },
  { id: "vacc", key: "chkVacc" },
  { id: "new", key: "chkNew" },
  { id: "feed", key: "chkFeed" },
] as const;
