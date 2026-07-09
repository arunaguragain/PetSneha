export const backendTranslations = {
  // Articles
  "Monsoon-Safe Walking Routes and Times": "मनसुन-सुरक्षित हिड्ने मार्गहरू र समय",
  "Reducing infection risk while still exercising your dog in the rain.": "वर्षामा कुकुरलाई व्यायाम गराउँदा संक्रमणको जोखिम कम गर्ने।",
  "Recognizing Pain in Cats: A Subtle Art": "बिरालोमा दुखाइ पहिचान: एक सूक्ष्म कला",
  "Summer Hydration Tips for Outdoor Pets": "बाहिरी पाल्तु जनावरहरूको लागि गर्मीमा पानी खुवाउने सुझावहरू",
  "Choosing a Verified Vet: What to Look For": "प्रमाणित पशुचिकित्सक छान्दै: के कुरामा ध्यान दिने",
  "Puppy Training 101": "कुकुरको बच्चाको तालिम १०१",
  "Healthy Diet for Cats": "बिरालोका लागि स्वस्थ आहार",
  
  // Alerts & Reminders
  "Deworming Update": "जुकाको औषधि अपडेट",
  "Vaccination Due": "खोप लगाउने समय",
  "Annual Checkup": "वार्षिक जाँच",
  
  // Clinics & Vets
  "Kathmandu Veterinary Hospital": "काठमाडौं पशु चिकित्सा अस्पताल",
  "Advanced Pet Care": "उन्नत पाल्तु हेरचाह",
  
  // Reasons
  "General Checkup": "सामान्य जाँच",
  "Vaccination": "खोप",
  "Consultation": "परामर्श",
  "Follow up": "फलो-अप",
  "Emergency": "आपातकालीन"
};

export const translateDynamic = (text, language) => {
  if (!text) return text;
  // If language is Nepali and we have a translation, use it
  if (language === 'ne' && backendTranslations[text]) {
    return backendTranslations[text];
  }
  return text;
};
