// VERIFIED SOURCE: India State-Level Disease Burden Initiative (ICMR, PHFI, IHME)
// Data reflects 2024 projections based on 2019-2021 GBD trends.

export const STATE_DATA = {
    "Kerala": {
        region: "South",
        top_diseases: [
            {
                name: "Ischemic Heart Disease",
                prevalence: "Very High",
                symptoms: ["Chest pain/pressure", "Shortness of breath", "Fatigue", "Pain in neck/jaw"],
                affected_age: "45+ years",
                consult: "Cardiologist",
                risk_factors: ["High BP", "High Cholesterol", "Diabetes", "Smoking"],
                stats: "Top cause of death (approx. 27% of total deaths)"
            },
            {
                name: "Stroke",
                prevalence: "High",
                symptoms: ["Sudden numbness", "Confusion", "Trouble seeing", "Dizziness"],
                affected_age: "50+ years",
                consult: "Neurologist",
                risk_factors: ["Hypertension", "Obesity", "Inactive lifestyle"],
                stats: "Major cause of disability in the elderly"
            },
            {
                name: "Diabetes",
                prevalence: "High",
                symptoms: ["Excessive thirst", "Frequent urination", "Blurred vision"],
                affected_age: "30+ years",
                consult: "Endocrinologist",
                risk_factors: ["Genetics", "Diet", "Sedentary lifestyle"],
                stats: "Prevalence ~20% in urban areas"
            },
            {
                name: "Chronic Kidney Disease",
                prevalence: "Rising",
                symptoms: ["Swelling", "Fatigue", "Nausea", "Changes in urination"],
                affected_age: "40+ years",
                consult: "Nephrologist",
                risk_factors: ["Uncontrolled Diabetes", "Hypertension"],
                stats: "Rapidly increasing due to high lifestyle disease burden"
            },
            {
                name: "COPD",
                prevalence: "Moderate",
                symptoms: ["Chronic cough", "Wheezing", "Breathlessness"],
                affected_age: "55+ years",
                consult: "Pulmonologist",
                risk_factors: ["Smoking", "Indoor air pollution"],
                stats: "Significant burden in older population"
            }
        ]
    },
    "Bihar": {
        region: "North",
        top_diseases: [
            {
                name: "Tuberculosis",
                prevalence: "High",
                symptoms: ["Coughing up blood", "Weight loss", "Night sweats", "Fever"],
                affected_age: "All ages (Young adults high risk)",
                consult: "Pulmonologist",
                risk_factors: ["Malnutrition", "Crowded living", "Weak immunity"],
                stats: "Highest burden state (approx. 200+ cases per 1 lakh)"
            },
            {
                name: "Respiratory Infections",
                prevalence: "High",
                symptoms: ["Cough", "Fever", "Difficulty breathing", "Sore throat"],
                affected_age: "Children < 5 years",
                consult: "Pediatrician / General Physician",
                risk_factors: ["Indoor air pollution (cooking fuel)", "Dust"],
                stats: "Leading cause of child mortality"
            },
            {
                name: "Diarrheal Diseases",
                prevalence: "Moderate-High",
                symptoms: ["Loose stools", "Dehydration", "Abdominal cramps"],
                affected_age: "Children & Elderly",
                consult: "Gastroenterologist",
                risk_factors: ["Unsafe water", "Poor sanitation"],
                stats: "Significantly reduced but still a major concern"
            },
            {
                name: "Malnutrition",
                prevalence: "Critical",
                symptoms: ["Low weight", "Weakness", "Stunted growth"],
                affected_age: "Children < 5 years",
                consult: "Pediatrician / Nutritionist",
                risk_factors: ["Poverty", "Food insecurity"],
                stats: "Underlies 50% of childhood morbidity"
            },
            {
                name: "Kala-azar",
                prevalence: "Endemic",
                symptoms: ["Prolonged fever", "Weight loss", "Enlarged spleen"],
                affected_age: "All ages",
                consult: "Infectious Disease Specialist",
                risk_factors: ["Sandfly bites", "Poor housing"],
                stats: "Endemic to specific districts in North Bihar"
            }
        ]
    },
    "Maharashtra": {
        region: "West",
        top_diseases: [
            {
                name: "Ischemic Heart Disease",
                prevalence: "High",
                symptoms: ["Chest discomfort", "Nausea", "Cold sweat"],
                affected_age: "40+ years",
                consult: "Cardiologist",
                risk_factors: ["Urban lifestyle", "Stress", "Pollution"],
                stats: "Rising rapidly in Mumbai/Pune urban corridor"
            },
            {
                name: "COPD",
                prevalence: "Moderate",
                symptoms: ["Chronic cough", "Wheezing", "Tightness in chest"],
                affected_age: "40+ years",
                consult: "Pulmonologist",
                risk_factors: ["Tobacco smoking", "Air pollution"],
                stats: "High burden in industrial zones"
            },
            {
                name: "Tuberculosis",
                prevalence: "Moderate",
                symptoms: ["Persistent cough", "Fever", "Fatigue"],
                affected_age: "15-45 years",
                consult: "Infectious Disease Specialist",
                risk_factors: ["Slum density", "Contact with carriers"],
                stats: "Concentrated in urban slum pockets"
            },
            {
                name: "Dengue",
                prevalence: "Seasonal High",
                symptoms: ["High fever", "Joint pain", "Rash", "Headache"],
                affected_age: "All ages",
                consult: "General Physician / MD",
                risk_factors: ["Mosquito breeding", "Urbanization"],
                stats: "Seasonal outbreaks common in monsoon"
            },
            {
                name: "Hypertension",
                prevalence: "Common",
                symptoms: ["Headache", "Shortness of breath", "Nosebleeds"],
                affected_age: "35+ years",
                consult: "General Physician / Cardiologist",
                risk_factors: ["Salt intake", "Stress", "Obesity"],
                stats: "Affects 1 in 4 urban adults"
            }
        ]
    },
    "Punjab": {
        region: "North",
        top_diseases: [
            {
                name: "Cardiovascular Diseases",
                prevalence: "Very High",
                symptoms: ["Irregular heartbeat", "Chest pain", "Swelling in legs"],
                affected_age: "40+ years",
                consult: "Cardiologist",
                risk_factors: ["High-fat diet", "Obesity", "Alcohol consumption"],
                stats: "Highest obesity rates correlate with heart risks"
            },
            {
                name: "Diabetes Type 2",
                prevalence: "High",
                symptoms: ["Slow healing sores", "Hunger", "Fatigue"],
                affected_age: "35+ years",
                consult: "Diabetologist",
                risk_factors: ["Diet", "Genetics"],
                stats: "Among the highest prevalence in India"
            },
            {
                name: "Cancer",
                prevalence: "Emerging Concern",
                symptoms: ["Unexplained weight loss", "Lumps", "Persistent pain"],
                affected_age: "Various",
                consult: "Oncologist",
                risk_factors: ["Pesticide exposure", "Environmental factors"],
                stats: "Specific belts (Malwa region) show higher incidence"
            },
            {
                name: "Drug Use Disorders",
                prevalence: "High Concern",
                symptoms: ["Behavioral changes", "Weight loss", "Withdrawal"],
                affected_age: "18-35 years",
                consult: "Psychiatrist / De-addiction Specialist",
                risk_factors: ["Socioeconomic factors", "Availability"],
                stats: "Major public health focus in state"
            },
            {
                name: "Hypertension",
                prevalence: "High",
                symptoms: ["Dizziness", "Headache"],
                affected_age: "40+ years",
                consult: "Cardiologist",
                risk_factors: ["Sedentary lifestyle", "Diet"],
                stats: "Widespread in rural and urban areas alike"
            }
        ]
    },
    "West Bengal": {
        region: "East",
        top_diseases: [
            {
                name: "Stroke",
                prevalence: "High",
                symptoms: ["Face drooping", "Arm weakness", "Speech difficulty"],
                affected_age: "50+ years",
                consult: "Neurologist",
                risk_factors: ["Hypertension", "Smoking", "High salt intake"],
                stats: "Leading cause of mortality in the state"
            },
            {
                name: "COPD & Asthma",
                prevalence: "High",
                symptoms: ["Breathlessness", "Coughing"],
                affected_age: "All ages",
                consult: "Pulmonologist",
                risk_factors: ["Smoking", "Indoor/Outdoor pollution"],
                stats: "High burden due to tobacco use"
            },
            {
                name: "Tuberculosis",
                prevalence: "Moderate-High",
                symptoms: ["Cough > 3 weeks", "Loss of appetite"],
                affected_age: "Active work age group",
                consult: "Pulmonologist",
                risk_factors: ["Crowding", "Undernutrition"],
                stats: "Persistent public health challenge"
            },
            {
                name: "Arsenicosis",
                prevalence: "Localized",
                symptoms: ["Skin lesions", "Pigmentation", "Hard patches on palms"],
                affected_age: "All ages in affected districts",
                consult: "Dermatologist / General Physician",
                risk_factors: ["Contaminated groundwater"],
                stats: "Endemic to specific districts near Ganges"
            },
            {
                name: "Malaria",
                prevalence: "Seasonal",
                symptoms: ["Fever", "Chills", "Sweating"],
                affected_age: "All ages",
                consult: "General Physician",
                risk_factors: ["Mosquito vectors", "Water stagnation"],
                stats: "Concern in Kolkata and rural districts"
            }
        ]
    }
};
