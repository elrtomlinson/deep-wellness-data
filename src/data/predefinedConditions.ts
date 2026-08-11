export interface PredefinedCondition {
  name: string;
  category: string;
  symptoms: string[];
  medications: string[];
  treatments: string[];
}

export const CONDITION_CATEGORIES = [
  'Cancers',
  'Cardiovascular Diseases',
  'Chronic Respiratory Diseases',
  'Diabetes Mellitus',
  'Atrial Fibrillation',
  'Atopic Dermatitis',
  'ADHD',
  'Autism Spectrum Disorder',
  'Autoimmune Diseases',
  'Blindness',
  'Cerebral Palsy',
  'Chronic Hepatitis',
  'Chronic Kidney Disease',
  'Chronic Osteoarticular Diseases',
  'Chronic Pain Syndromes',
  'Down Syndrome',
  'Dwarfism',
  'Deafness',
  'Ehlers-Danlos Syndrome',
  'Endometriosis',
  'Epilepsy',
  'Fetal Alcohol Spectrum Disorder',
  'Fibromyalgia',
  'HIV/AIDS',
  'Migraines',
  'Multiple Sclerosis',
  'ME/CFS',
  'Narcolepsy',
  'Obesity',
  'Osteoporosis',
  "Parkinson's Disease",
  'PCOS',
  'POTS',
  'Prader-Willi Syndrome',
  'Sickle Cell & Haemoglobin Disorders',
  'Substance Use Disorders',
  'Sleep Apnoea',
  'Thyroid Disease',
  'Tuberculosis',
  'Williams Syndrome',
] as const;

export const PREDEFINED_CONDITIONS: PredefinedCondition[] = [
  // CANCERS
  {
    name: 'Leukemia (AML, ALL, CLL, CML)',
    category: 'Cancers',
    symptoms: ['Fatigue', 'Frequent infections', 'Easy bruising/bleeding', 'Swollen lymph nodes', 'Bone pain', 'Night sweats', 'Unexplained weight loss', 'Pale skin'],
    medications: ['Cytarabine', 'Daunorubicin', 'Imatinib', 'Venetoclax'],
    treatments: ['Chemotherapy', 'Targeted therapy', 'Immunotherapy', 'Stem cell/bone marrow transplant', 'Radiation', 'CAR-T cell therapy'],
  },
  {
    name: "Lymphoma (Hodgkin's & Non-Hodgkin's)",
    category: 'Cancers',
    symptoms: ['Painless swollen lymph nodes', 'Fever', 'Night sweats', 'Fatigue', 'Unexplained weight loss', 'Itching', 'Chest pressure'],
    medications: ['Rituximab', 'Pembrolizumab'],
    treatments: ['ABVD chemotherapy', 'RCHOP chemotherapy', 'Radiation therapy', 'Stem cell transplant', 'Checkpoint inhibitors', 'CAR-T therapy'],
  },
  {
    name: 'Multiple Myeloma',
    category: 'Cancers',
    symptoms: ['Bone pain (back/hips)', 'Fractures', 'Anaemia', 'Kidney problems', 'Hypercalcaemia', 'Recurrent infections', 'Fatigue', 'Numbness in legs'],
    medications: ['Bortezomib', 'Lenalidomide', 'Dexamethasone', 'Daratumumab', 'Bisphosphonates'],
    treatments: ['VRd regimen', 'Autologous stem cell transplant', 'Supportive care'],
  },
  {
    name: 'Breast cancer',
    category: 'Cancers',
    symptoms: ['Breast lump', 'Nipple discharge', 'Skin dimpling', 'Breast pain', 'Swollen lymph nodes', 'Nausea', 'Hair loss', 'Fatigue', 'Lymphoedema'],
    medications: ['Docetaxel', 'Trastuzumab', 'Tamoxifen', 'Aromatase inhibitors', 'CDK4/6 inhibitors'],
    treatments: ['Lumpectomy', 'Mastectomy', 'AC-T chemotherapy', 'HER2-targeted therapy', 'Hormone therapy', 'Radiation'],
  },
  {
    name: 'Lung cancer (NSCLC & SCLC)',
    category: 'Cancers',
    symptoms: ['Persistent cough', 'Haemoptysis', 'Chest pain', 'Shortness of breath', 'Hoarseness', 'Unexplained weight loss', 'Bone pain'],
    medications: ['Carboplatin', 'Paclitaxel', 'Osimertinib', 'Crizotinib', 'Pembrolizumab'],
    treatments: ['Lobectomy', 'Chemotherapy', 'Targeted therapy', 'Checkpoint inhibitors', 'Radiation', 'Prophylactic cranial irradiation'],
  },
  {
    name: 'Colorectal cancer',
    category: 'Cancers',
    symptoms: ['Change in bowel habits', 'Rectal bleeding', 'Abdominal cramping', 'Fatigue', 'Unexplained weight loss', 'Anaemia'],
    medications: ['Bevacizumab', 'Cetuximab'],
    treatments: ['Colectomy', 'Colostomy', 'FOLFOX chemotherapy', 'FOLFIRI chemotherapy', 'Checkpoint inhibitors', 'Radiation', 'Targeted therapy'],
  },
  {
    name: 'Prostate cancer',
    category: 'Cancers',
    symptoms: ['Urinary hesitancy', 'Weak stream', 'Frequent urination', 'Haematuria', 'Bone pain'],
    medications: ['Leuprolide', 'Enzalutamide', 'Abiraterone', 'Docetaxel', 'PARP inhibitors'],
    treatments: ['Active surveillance', 'Radical prostatectomy', 'EBRT radiation', 'Brachytherapy', 'Hormone therapy (ADT)', 'Cardiac rehabilitation'],
  },
  {
    name: 'Melanoma',
    category: 'Cancers',
    symptoms: ['Asymmetric/multi-coloured changing moles', 'Ulcerated lesions', 'Itching', 'Lymphadenopathy', 'Weight loss'],
    medications: ['Pembrolizumab', 'Ipilimumab', 'Dabrafenib', 'Trametinib'],
    treatments: ['Surgical excision', 'Sentinel lymph node biopsy', 'Immunotherapy', 'BRAF/MEK targeted therapy', 'Radiation'],
  },
  {
    name: 'Basal & Squamous Cell Carcinoma',
    category: 'Cancers',
    symptoms: ['Pearly or waxy bump', 'Flat lesion', 'Bleeding sore that doesn\'t heal', 'Rough scaly patch'],
    medications: ['Topical 5-fluorouracil', 'Imiquimod', 'Vismodegib'],
    treatments: ['Surgical excision', 'Mohs surgery', 'Cryotherapy', 'Photodynamic therapy', 'Radiation'],
  },
  {
    name: 'Cervical / Ovarian / Uterine cancers',
    category: 'Cancers',
    symptoms: ['Abnormal vaginal bleeding or discharge', 'Pelvic pain', 'Bloating', 'Urinary frequency'],
    medications: ['Cisplatin', 'Bevacizumab', 'Olaparib'],
    treatments: ['Hysterectomy', 'Oophorectomy', 'Cisplatin-based chemotherapy', 'PARP inhibitors', 'Radiation (brachytherapy)', 'Hormone therapy'],
  },

  // CARDIOVASCULAR DISEASES
  {
    name: 'Ischaemic stroke / TIA',
    category: 'Cardiovascular Diseases',
    symptoms: ['Facial drooping', 'Arm weakness', 'Speech difficulty', 'Confusion', 'Vision loss', 'Severe headache', 'Hemiplegia', 'Aphasia', 'Cognitive changes', 'Depression'],
    medications: ['Alteplase (tPA)', 'Aspirin', 'Clopidogrel', 'Warfarin', 'Apixaban', 'Statins', 'Antihypertensives'],
    treatments: ['Mechanical thrombectomy', 'Carotid endarterectomy', 'Rehabilitation'],
  },
  {
    name: 'Haemorrhagic stroke',
    category: 'Cardiovascular Diseases',
    symptoms: ['Sudden severe headache ("thunderclap")', 'Vomiting', 'Loss of consciousness', 'Weakness', 'Vision changes'],
    medications: ['Nicardipine', 'Labetalol'],
    treatments: ['BP management', 'Reversal of anticoagulation', 'Surgical clipping', 'Endovascular coiling', 'Craniotomy', 'Neuro-rehabilitation'],
  },
  {
    name: 'Heart failure — HFrEF',
    category: 'Cardiovascular Diseases',
    symptoms: ['Dyspnoea on exertion', 'Orthopnoea', 'Paroxysmal nocturnal dyspnoea', 'Peripheral oedema', 'Fatigue', 'Weight gain', 'Cough'],
    medications: ['Lisinopril', 'Sacubitril/valsartan', 'Carvedilol', 'Bisoprolol', 'Spironolactone', 'Dapagliflozin', 'Furosemide'],
    treatments: ['ACE inhibitors/ARBs', 'Beta-blockers', 'SGLT2 inhibitors', 'ICD/CRT devices'],
  },
  {
    name: 'Heart failure — HFpEF',
    category: 'Cardiovascular Diseases',
    symptoms: ['Dyspnoea on exertion', 'Orthopnoea', 'Peripheral oedema', 'Fatigue'],
    medications: ['SGLT2 inhibitors', 'Diuretics'],
    treatments: ['Blood pressure control', 'Comorbidity management'],
  },
  {
    name: 'Coronary Artery Disease (Ischaemic heart disease)',
    category: 'Cardiovascular Diseases',
    symptoms: ['Angina (chest pressure)', 'Jaw/arm radiation pain', 'Dyspnoea', 'Palpitations', 'Crushing chest pain', 'Sweating', 'Nausea'],
    medications: ['Aspirin', 'Ticagrelor', 'Statins', 'Beta-blockers', 'Nitrates (GTN spray)', 'ACE inhibitors'],
    treatments: ['PCI (coronary stenting)', 'CABG surgery', 'Cardiac rehabilitation'],
  },

  // CHRONIC RESPIRATORY DISEASES
  {
    name: 'Asthma — Intermittent',
    category: 'Chronic Respiratory Diseases',
    symptoms: ['Episodic wheeze', 'Cough (especially nocturnal)', 'Chest tightness', 'Shortness of breath'],
    medications: ['Salbutamol/albuterol (SABA)', 'Low-dose ICS/formoterol'],
    treatments: ['Allergen avoidance'],
  },
  {
    name: 'Asthma — Persistent (mild–severe)',
    category: 'Chronic Respiratory Diseases',
    symptoms: ['Frequent wheeze', 'Nocturnal waking', 'Exercise limitation', 'Eosinophilia', 'Status asthmaticus'],
    medications: ['Budesonide', 'Fluticasone', 'Formoterol', 'Salmeterol', 'Montelukast', 'Dupilumab', 'Mepolizumab', 'Omalizumab', 'Oral steroids'],
    treatments: ['Inhaled corticosteroids (ICS)', 'Long-acting beta-agonists (LABAs)', 'Biologics'],
  },
  {
    name: 'COPD — Mild to Moderate (GOLD 1–2)',
    category: 'Chronic Respiratory Diseases',
    symptoms: ['Chronic productive cough', 'Mild dyspnoea on exertion', 'Wheezing'],
    medications: ['SABAs', 'SAMAs', 'Tiotropium', 'Indacaterol'],
    treatments: ['Smoking cessation', 'Pulmonary rehabilitation'],
  },
  {
    name: 'COPD — Severe to Very Severe (GOLD 3–4)',
    category: 'Chronic Respiratory Diseases',
    symptoms: ['Severe dyspnoea at rest', 'Barrel chest', 'Cyanosis', 'Cachexia', 'Frequent exacerbations', 'Cor pulmonale', 'CO₂ retention'],
    medications: ['Roflumilast', 'Azithromycin'],
    treatments: ['LABA + LAMA + ICS triple therapy', 'Supplemental oxygen', 'NIV/CPAP', 'Lung volume reduction', 'Transplant consideration'],
  },

  // DIABETES MELLITUS
  {
    name: 'Type 1 Diabetes',
    category: 'Diabetes Mellitus',
    symptoms: ['Polydipsia', 'Polyuria', 'Polyphagia', 'Rapid weight loss', 'DKA (nausea, vomiting)', 'Hypoglycaemia', 'Retinopathy', 'Nephropathy', 'Neuropathy'],
    medications: ['Insulin glargine', 'Insulin detemir', 'Insulin aspart', 'Insulin lispro'],
    treatments: ['Continuous glucose monitoring (CGM)', 'Insulin pump (CSII)', 'Carbohydrate counting', 'Closed-loop artificial pancreas'],
  },
  {
    name: 'Type 2 Diabetes',
    category: 'Diabetes Mellitus',
    symptoms: ['Fatigue', 'Increased thirst/urination', 'Slow wound healing', 'Recurrent infections', 'Blurred vision'],
    medications: ['Metformin', 'Empagliflozin', 'Semaglutide', 'Liraglutide', 'Sitagliptin', 'Sulfonylureas', 'Insulin'],
    treatments: ['Weight management', 'Lifestyle modification', 'Bariatric surgery'],
  },
  {
    name: 'Pre-diabetes',
    category: 'Diabetes Mellitus',
    symptoms: ['Usually asymptomatic', 'Fatigue', 'Increased thirst'],
    medications: ['Metformin'],
    treatments: ['Intensive lifestyle modification', 'Annual monitoring'],
  },

  // ATRIAL FIBRILLATION
  {
    name: 'Atrial fibrillation — Paroxysmal',
    category: 'Atrial Fibrillation',
    symptoms: ['Palpitations', 'Irregular heartbeat', 'Fatigue', 'Dyspnoea', 'Dizziness', 'Chest discomfort'],
    medications: ['Beta-blockers', 'Digoxin', 'Diltiazem', 'Flecainide', 'Propafenone', 'Amiodarone', 'Apixaban', 'Rivaroxaban', 'Warfarin'],
    treatments: ['Rate control', 'Rhythm control', 'Cardioversion', 'Ablation'],
  },
  {
    name: 'Atrial fibrillation — Persistent / Permanent',
    category: 'Atrial Fibrillation',
    symptoms: ['Palpitations', 'Irregular heartbeat', 'Fatigue', 'Dyspnoea', 'Increased stroke risk'],
    medications: ['Anticoagulants', 'Rate control agents'],
    treatments: ['Long-term anticoagulation', 'Pulmonary vein isolation (catheter ablation)', 'Left atrial appendage closure (WATCHMAN)', 'Lifestyle management'],
  },

  // ATOPIC DERMATITIS
  {
    name: 'Atopic dermatitis — Mild',
    category: 'Atopic Dermatitis',
    symptoms: ['Dry, itchy skin', 'Mild redness', 'Lichenified patches'],
    medications: ['Hydrocortisone 1%'],
    treatments: ['Moisturising emollients', 'Trigger avoidance', 'Gentle skincare'],
  },
  {
    name: 'Atopic dermatitis — Moderate to Severe',
    category: 'Atopic Dermatitis',
    symptoms: ['Intense pruritus', 'Widespread erythema', 'Weeping/crusting', 'Lichenification', 'Secondary bacterial infections', 'Sleep disruption'],
    medications: ['Potent topical corticosteroids', 'Tacrolimus', 'Pimecrolimus', 'Crisaborole', 'Dupilumab', 'Tralokinumab', 'Abrocitinib', 'Upadacitinib', 'Ciclosporin', 'Methotrexate'],
    treatments: ['Topical calcineurin inhibitors', 'Biologics', 'JAK inhibitors', 'Phototherapy', 'Oral immunosuppressants'],
  },

  // ADHD
  {
    name: 'ADHD — Predominantly Inattentive',
    category: 'ADHD',
    symptoms: ['Difficulty sustaining attention', 'Easily distracted', 'Forgetfulness', 'Poor organisation', 'Losing items', 'Failing to follow through on tasks'],
    medications: ['Methylphenidate (Ritalin, Concerta)', 'Amphetamine salts (Adderall, Vyvanse)', 'Atomoxetine', 'Guanfacine', 'Clonidine'],
    treatments: ['CBT', 'Coaching', 'Organisational skills training', 'School/workplace accommodations'],
  },
  {
    name: 'ADHD — Predominantly Hyperactive-Impulsive',
    category: 'ADHD',
    symptoms: ['Fidgeting', 'Leaving seat', 'Running/climbing inappropriately', 'Excessive talking', 'Interrupting', 'Difficulty awaiting turn', 'Impulsive decision-making'],
    medications: ['Methylphenidate', 'Amphetamine salts', 'Atomoxetine', 'Guanfacine', 'Clonidine'],
    treatments: ['Behavioural therapy', 'Parent training', 'Social skills groups', 'Environmental modifications'],
  },
  {
    name: 'ADHD — Combined Presentation',
    category: 'ADHD',
    symptoms: ['Difficulty sustaining attention', 'Easily distracted', 'Fidgeting', 'Impulsive decision-making', 'Poor organisation', 'Excessive talking'],
    medications: ['Long-acting stimulant formulations', 'Methylphenidate', 'Amphetamine salts', 'Atomoxetine'],
    treatments: ['Combined pharmacological and psychosocial approach', 'Regular monitoring'],
  },

  // AUTISM SPECTRUM DISORDER
  {
    name: 'Autism Spectrum Disorder (Level 1–3)',
    category: 'Autism Spectrum Disorder',
    symptoms: ['Difficulties in social communication', 'Restricted/repetitive behaviours', 'Sensory sensitivities', 'Challenges with change/transitions', 'Co-occurring anxiety', 'ADHD', 'GI issues'],
    medications: ['SSRIs (anxiety)', 'Stimulants (ADHD)', 'Aripiprazole', 'Risperidone'],
    treatments: ['ABA therapy', 'EIBI', 'Speech-language therapy', 'Occupational therapy', 'Social skills groups', 'Sensory integration therapy'],
  },

  // AUTOIMMUNE DISEASES
  {
    name: 'Systemic Lupus Erythematosus (SLE)',
    category: 'Autoimmune Diseases',
    symptoms: ['Butterfly malar rash', 'Photosensitivity', 'Arthritis', 'Serositis', 'Renal involvement (lupus nephritis)', 'Haematological abnormalities', 'CNS manifestations', 'Fatigue', 'Fever', 'Hair loss'],
    medications: ['Hydroxychloroquine', 'NSAIDs', 'Corticosteroids', 'Azathioprine', 'Mycophenolate mofetil', 'Belimumab', 'Voclosporin', 'Cyclophosphamide'],
    treatments: ['Sun protection', 'Immunosuppression'],
  },
  {
    name: "Crohn's Disease",
    category: 'Autoimmune Diseases',
    symptoms: ['Abdominal pain', 'Diarrhoea (often bloody)', 'Weight loss', 'Fever', 'Fatigue', 'Perianal disease', 'Mouth ulcers', 'Arthritis', 'Uveitis', 'Erythema nodosum'],
    medications: ['5-ASA compounds', 'Corticosteroids', 'Azathioprine', '6-MP', 'Methotrexate', 'Infliximab', 'Adalimumab', 'Vedolizumab', 'Ustekinumab', 'Upadacitinib'],
    treatments: ['Immunomodulators', 'Biologics', 'JAK inhibitors', 'Strictureplasty', 'Surgical resection'],
  },
  {
    name: 'Coeliac Disease',
    category: 'Autoimmune Diseases',
    symptoms: ['Diarrhoea', 'Steatorrhoea', 'Bloating', 'Abdominal pain', 'Weight loss', 'Fatigue', 'Anaemia', 'Dermatitis herpetiformis', 'Osteoporosis', 'Infertility'],
    medications: ['Iron supplements', 'Folate', 'B12', 'Vitamin D', 'Calcium'],
    treatments: ['Strict lifelong gluten-free diet', 'Nutritional supplementation'],
  },
  {
    name: 'Psoriasis — Plaque',
    category: 'Autoimmune Diseases',
    symptoms: ['Raised red scaly plaques', 'Itching', 'Skin cracking and bleeding', 'Nail pitting', 'Psoriatic arthritis'],
    medications: ['Topical corticosteroids', 'Calcipotriol', 'Coal tar', 'Methotrexate', 'Cyclosporin', 'Acitretin', 'Adalimumab', 'Secukinumab', 'Guselkumab', 'Risankizumab'],
    treatments: ['Phototherapy (narrowband UVB)', 'Biologics', 'TNF-α inhibitors', 'IL-17 inhibitors', 'IL-23 inhibitors'],
  },
  {
    name: "Hashimoto's Thyroiditis",
    category: 'Autoimmune Diseases',
    symptoms: ['Fatigue', 'Weight gain', 'Cold intolerance', 'Constipation', 'Dry skin', 'Hair loss', 'Depression', 'Brain fog', 'Goitre', 'Menstrual irregularity'],
    medications: ['Levothyroxine', 'Selenium supplementation'],
    treatments: ['Regular TSH monitoring', 'Maintaining euthyroid state'],
  },

  // BLINDNESS
  {
    name: 'Glaucoma (chronic open-angle)',
    category: 'Blindness',
    symptoms: ['Gradual peripheral vision loss', 'Tunnel vision', 'Eye pain (acute)', 'Headache', 'Nausea', 'Halos around lights'],
    medications: ['Latanoprost', 'Timolol', 'Dorzolamide', 'Brimonidine'],
    treatments: ['Laser trabeculoplasty', 'Trabeculectomy', 'Glaucoma drainage devices'],
  },
  {
    name: 'Age-related Macular Degeneration (AMD)',
    category: 'Blindness',
    symptoms: ['Blurred central vision', 'Distorted straight lines', 'Scotoma'],
    medications: ['AREDS2 supplements', 'Ranibizumab', 'Aflibercept', 'Bevacizumab', 'Faricimab'],
    treatments: ['Anti-VEGF injections', 'Laser photocoagulation'],
  },
  {
    name: 'Diabetic Retinopathy',
    category: 'Blindness',
    symptoms: ['Floaters', 'Blurred vision', 'Colour changes', 'Dark areas', 'Sudden vision loss'],
    medications: ['Ranibizumab'],
    treatments: ['Glycaemic control', 'Blood pressure control', 'Anti-VEGF injections', 'Laser photocoagulation', 'Vitrectomy', 'Regular screening'],
  },
  {
    name: 'Cataracts',
    category: 'Blindness',
    symptoms: ['Cloudy/blurry/dim vision', 'Halos around lights', 'Night vision difficulty', 'Faded colours'],
    medications: [],
    treatments: ['Phacoemulsification cataract surgery with IOL implant', 'Protective eyewear/sunglasses'],
  },

  // CEREBRAL PALSY
  {
    name: 'Spastic CP',
    category: 'Cerebral Palsy',
    symptoms: ['Increased muscle tone', 'Stiff movements', 'Scissor gait', 'Toe-walking', 'Joint contractures', 'Limb weakness', 'Seizures', 'Speech/swallowing difficulties', 'Pain'],
    medications: ['Baclofen', 'Diazepam', 'Dantrolene', 'Botulinum toxin A'],
    treatments: ['Physiotherapy', 'Occupational therapy', 'Speech-language therapy', 'Orthopaedic surgery', 'Selective dorsal rhizotomy', 'Orthotics/AFOs', 'AAC devices'],
  },
  {
    name: 'Dyskinetic CP',
    category: 'Cerebral Palsy',
    symptoms: ['Involuntary movements', 'Fluctuating tone', 'Poor posture control', 'Speech difficulties', 'Hearing loss'],
    medications: ['Trihexyphenidyl', 'Carbidopa/levodopa'],
    treatments: ['Physiotherapy', 'Occupational therapy', 'Deep brain stimulation (DBS)'],
  },
  {
    name: 'Ataxic CP',
    category: 'Cerebral Palsy',
    symptoms: ['Poor coordination', 'Unsteady gait', 'Tremor', 'Balance problems', 'Hypotonia'],
    medications: [],
    treatments: ['Physiotherapy (balance and coordination)', 'Assistive devices', 'Occupational therapy'],
  },

  // CHRONIC HEPATITIS
  {
    name: 'Chronic Hepatitis B',
    category: 'Chronic Hepatitis',
    symptoms: ['Fatigue', 'Jaundice', 'Right upper quadrant pain', 'Joint aches', 'Cirrhosis', 'Liver failure'],
    medications: ['Tenofovir alafenamide (TAF)', 'Tenofovir disoproxil fumarate (TDF)', 'Entecavir', 'Pegylated interferon alfa'],
    treatments: ['HBV vaccination (prevention)', 'HCC monitoring', 'Liver transplant'],
  },
  {
    name: 'Chronic Hepatitis C',
    category: 'Chronic Hepatitis',
    symptoms: ['Fatigue', 'Nausea', 'Abdominal pain', 'Cirrhosis', 'Portal hypertension'],
    medications: ['Sofosbuvir/velpatasvir (Epclusa)', 'Glecaprevir/pibrentasvir (Maviret)', 'Ledipasvir/sofosbuvir'],
    treatments: ['Direct-acting antivirals (DAAs)', 'Liver transplant'],
  },

  // CHRONIC KIDNEY DISEASE
  {
    name: 'CKD — Stages 1–3',
    category: 'Chronic Kidney Disease',
    symptoms: ['Often asymptomatic', 'Mild hypertension', 'Mild anaemia', 'Elevated creatinine'],
    medications: ['Ramipril', 'Losartan', 'Dapagliflozin', 'Finerenone'],
    treatments: ['Blood pressure control', 'Glycaemic control', 'Dietary modifications', 'Smoking cessation'],
  },
  {
    name: 'CKD — Stages 4–5',
    category: 'Chronic Kidney Disease',
    symptoms: ['Fatigue', 'Nausea', 'Vomiting', 'Fluid retention', 'Shortness of breath', 'Itching (uraemic pruritus)', 'Confusion', 'Muscle cramps', 'Anaemia', 'Bone disease'],
    medications: ['Darbepoetin (ESA)', 'IV iron', 'Sevelamer', 'Calcium carbonate', 'Calcitriol', 'Bicarbonate'],
    treatments: ['Haemodialysis', 'Peritoneal dialysis', 'Kidney transplantation'],
  },

  // CHRONIC OSTEOARTICULAR DISEASES
  {
    name: 'Osteoarthritis',
    category: 'Chronic Osteoarticular Diseases',
    symptoms: ['Joint pain (worsens with activity)', 'Stiffness (morning, <30 min)', 'Crepitus', 'Reduced range of motion', 'Joint swelling', 'Bony enlargement'],
    medications: ['Paracetamol (acetaminophen)', 'Ibuprofen', 'Diclofenac (topical)', 'Intra-articular corticosteroids', 'Hyaluronic acid injections'],
    treatments: ['Physiotherapy', 'Weight loss', 'Assistive devices', 'Joint replacement surgery (TKR/THR)'],
  },
  {
    name: 'Rheumatoid Arthritis',
    category: 'Chronic Osteoarticular Diseases',
    symptoms: ['Symmetrical joint swelling', 'Joint warmth/tenderness', 'Morning stiffness >1 hour', 'Fatigue', 'Rheumatoid nodules', 'Interstitial lung disease'],
    medications: ['Methotrexate', 'Hydroxychloroquine', 'Sulfasalazine', 'Leflunomide', 'Etanercept', 'Adalimumab', 'Tocilizumab', 'Rituximab', 'Abatacept', 'Tofacitinib', 'Baricitinib'],
    treatments: ['DMARDs', 'Biologics', 'JAK inhibitors', 'NSAIDs/corticosteroids (bridging)', 'Physiotherapy'],
  },

  // CHRONIC PAIN SYNDROMES
  {
    name: 'Complex Regional Pain Syndrome (CRPS)',
    category: 'Chronic Pain Syndromes',
    symptoms: ['Severe burning/aching pain', 'Allodynia', 'Hyperalgesia', 'Skin colour/temperature changes', 'Oedema', 'Sweating abnormalities', 'Motor dysfunction', 'Trophic changes'],
    medications: ['Pregabalin', 'Gabapentin', 'Amitriptyline', 'Duloxetine', 'Corticosteroids', 'Bisphosphonates', 'IV ketamine'],
    treatments: ['Physiotherapy', 'Mirror therapy', 'Graded motor imagery', 'Sympathetic nerve blocks', 'Spinal cord stimulation (SCS)'],
  },

  // DOWN SYNDROME
  {
    name: 'Down Syndrome (Trisomy 21)',
    category: 'Down Syndrome',
    symptoms: ['Intellectual disability', 'Hypotonia', 'Flat facial features', 'Congenital heart defects', 'GI malformations', 'Hearing/vision impairment', 'Hypothyroidism', 'Early-onset Alzheimer\'s risk'],
    medications: ['Thyroxine (if hypothyroid)', 'Stimulant medications (ADHD)'],
    treatments: ['Early intervention therapies', 'Cardiac surgery for CHD', 'Hearing aids', 'Health surveillance', 'Specialised educational support'],
  },

  // DWARFISM
  {
    name: 'Achondroplasia',
    category: 'Dwarfism',
    symptoms: ['Short stature', 'Shortened limbs relative to trunk', 'Macrocephaly', 'Spinal stenosis', 'Sleep apnoea', 'Recurrent ear infections'],
    medications: ['Vosoritide', 'Growth hormone'],
    treatments: ['Surgical decompression for spinal stenosis', 'Limb lengthening surgery', 'CPAP for sleep apnoea'],
  },
  {
    name: 'Growth Hormone Deficiency Dwarfism',
    category: 'Dwarfism',
    symptoms: ['Slow growth', 'Short stature', 'Delayed puberty', 'Adiposity', 'Reduced muscle mass', 'Fatigue'],
    medications: ['Somatropin (recombinant growth hormone)'],
    treatments: ['GH replacement therapy'],
  },

  // DEAFNESS
  {
    name: 'Sensorineural Hearing Loss',
    category: 'Deafness',
    symptoms: ['Difficulty hearing/distinguishing speech', 'Tinnitus', 'Muffled sounds', 'Hypersensitivity to loud noise', 'Social isolation', 'Depression'],
    medications: [],
    treatments: ['Hearing aids', 'Cochlear implants', 'Bone-anchored hearing devices (BAHA)', 'Lip-reading', 'Sign language'],
  },
  {
    name: 'Conductive Hearing Loss',
    category: 'Deafness',
    symptoms: ['Reduced sound volume', 'Fullness in ear', 'Tinnitus'],
    medications: ['Antibiotics (for otitis media)'],
    treatments: ['Grommet insertion', 'Stapedectomy', 'Surgical repair', 'Bone-anchored hearing aids', 'Conventional hearing aids'],
  },

  // EHLERS-DANLOS SYNDROME
  {
    name: 'Hypermobile EDS (hEDS)',
    category: 'Ehlers-Danlos Syndrome',
    symptoms: ['Joint hypermobility', 'Recurrent dislocations/subluxations', 'Chronic widespread pain', 'Easy bruising', 'Fatigue', 'Proprioceptive deficits', 'Dysautonomia (POTS overlap)', 'Anxiety'],
    medications: ['NSAIDs', 'Amitriptyline', 'Duloxetine', 'Pregabalin'],
    treatments: ['Physiotherapy (core strengthening, proprioception)', 'Occupational therapy', 'Joint stabilising braces/orthotics', 'Pacing strategies', 'POTS management'],
  },
  {
    name: 'Classical EDS (cEDS)',
    category: 'Ehlers-Danlos Syndrome',
    symptoms: ['Skin hyperextensibility', 'Velvety texture', 'Widened atrophic scarring', 'Joint hypermobility', 'Soft tissue fragility'],
    medications: ['Vitamin C supplementation'],
    treatments: ['Wound care', 'Physiotherapy', 'Protective padding', 'Avoid contact sports'],
  },
  {
    name: 'Vascular EDS (vEDS)',
    category: 'Ehlers-Danlos Syndrome',
    symptoms: ['Translucent skin', 'Acrogeria', 'Arterial/bowel/uterine rupture risk'],
    medications: ['Celiprolol'],
    treatments: ['Lifestyle modifications', 'Regular vascular surveillance', 'Emergency surgical intervention', 'Genetic counselling'],
  },

  // ENDOMETRIOSIS
  {
    name: 'Endometriosis (Stage I–IV)',
    category: 'Endometriosis',
    symptoms: ['Cyclical/chronic pelvic pain', 'Severe dysmenorrhoea', 'Deep dyspareunia', 'Dyschezia', 'Dysuria', 'Infertility', 'Fatigue'],
    medications: ['NSAIDs', 'Paracetamol', 'Combined oral contraceptive pill', 'Norethisterone', 'Medroxyprogesterone', 'Goserelin', 'Elagolix'],
    treatments: ['Hormonal suppression', 'Levonorgestrel IUS', 'Surgical excision (laparoscopy)', 'IVF for infertility'],
  },

  // EPILEPSY
  {
    name: 'Focal Seizures',
    category: 'Epilepsy',
    symptoms: ['Motor (jerking, automatisms)', 'Sensory (tingling, visual aura)', 'Autonomic (flushing, nausea)', 'Cognitive/emotional changes', 'Post-ictal confusion'],
    medications: ['Carbamazepine', 'Lamotrigine', 'Lacosamide', 'Levetiracetam', 'Oxcarbazepine'],
    treatments: ['Surgical resection', 'Vagus nerve stimulation (VNS)', 'Responsive neurostimulation (RNS)', 'Ketogenic diet'],
  },
  {
    name: 'Generalised Seizures — Tonic-clonic',
    category: 'Epilepsy',
    symptoms: ['Sudden loss of consciousness', 'Stiffening', 'Rhythmic jerking', 'Tongue biting', 'Incontinence', 'Post-ictal confusion and fatigue'],
    medications: ['Valproate', 'Lamotrigine', 'Levetiracetam', 'Topiramate', 'Midazolam (rescue)', 'Diazepam (rescue)'],
    treatments: ['Implantable devices'],
  },
  {
    name: 'Absence Seizures',
    category: 'Epilepsy',
    symptoms: ['Brief staring spells', 'Unresponsiveness', 'Subtle eye fluttering', 'No post-ictal state'],
    medications: ['Ethosuximide', 'Valproate', 'Lamotrigine'],
    treatments: ['Monitoring', 'Usually remit by adulthood'],
  },
  {
    name: 'Dravet Syndrome / Genetic epilepsies',
    category: 'Epilepsy',
    symptoms: ['Early-onset prolonged febrile seizures', 'Multiple seizure types', 'Developmental regression', 'Movement disorder', 'Sleep disturbance'],
    medications: ['Clobazam', 'Valproate', 'Stiripentol', 'Fenfluramine', 'Cannabidiol (Epidiolex)'],
    treatments: ['Avoid sodium channel blockers', 'Ketogenic diet'],
  },

  // FETAL ALCOHOL SPECTRUM DISORDER
  {
    name: 'Fetal Alcohol Syndrome (FAS)',
    category: 'Fetal Alcohol Spectrum Disorder',
    symptoms: ['Growth deficiency', 'Characteristic facial features', 'Intellectual disability', 'Behavioural problems', 'Seizures'],
    medications: ['Stimulants (ADHD)', 'SSRIs (anxiety/depression)', 'Risperidone (aggression)'],
    treatments: ['Early intervention therapies', 'Educational support', 'Structured environments'],
  },
  {
    name: 'Alcohol-Related Neurodevelopmental Disorder (ARND)',
    category: 'Fetal Alcohol Spectrum Disorder',
    symptoms: ['Executive function deficits', 'Learning disabilities', 'Memory problems', 'Social difficulties', 'Impulse control issues'],
    medications: [],
    treatments: ['Neurofeedback', 'CBT', 'Parent-child interaction therapy', 'Social skills training'],
  },

  // FIBROMYALGIA
  {
    name: 'Fibromyalgia',
    category: 'Fibromyalgia',
    symptoms: ['Widespread musculoskeletal pain', 'Tender points', 'Fatigue', 'Non-restorative sleep', 'Cognitive dysfunction ("fibro fog")', 'Headaches', 'IBS', 'Depression/anxiety', 'Sensitivity to touch/light/sound'],
    medications: ['Duloxetine', 'Milnacipran', 'Pregabalin', 'Amitriptyline (low-dose)'],
    treatments: ['Aerobic exercise', 'CBT', 'Multimodal pain rehabilitation', 'Avoid opioids'],
  },

  // HIV/AIDS
  {
    name: 'HIV — Acute Infection',
    category: 'HIV/AIDS',
    symptoms: ['Flu-like illness', 'Fever', 'Lymphadenopathy', 'Sore throat', 'Rash', 'Myalgia'],
    medications: ['Emtricitabine/tenofovir (PrEP)'],
    treatments: ['Immediate ART initiation', 'Pre-exposure prophylaxis (PrEP)'],
  },
  {
    name: 'HIV — Chronic (treated)',
    category: 'HIV/AIDS',
    symptoms: ['Usually asymptomatic with ART', 'Metabolic syndrome', 'Cardiovascular risk', 'Bone density loss'],
    medications: ['Dolutegravir', 'Emtricitabine/tenofovir', 'Bictegravir/FTC/TAF', 'Cabotegravir', 'Rilpivirine'],
    treatments: ['Lifelong ART', 'Long-acting injectable ART'],
  },
  {
    name: 'AIDS (advanced, CD4 <200)',
    category: 'HIV/AIDS',
    symptoms: ['Opportunistic infections', 'Wasting syndrome', 'Kaposi\'s sarcoma', 'Lymphoma', 'Severe immune deficiency'],
    medications: ['Co-trimoxazole (prophylaxis)', 'Azithromycin (MAC prophylaxis)'],
    treatments: ['ART', 'Treat specific opportunistic infections', 'IRIS management'],
  },

  // MIGRAINES
  {
    name: 'Migraine Without Aura',
    category: 'Migraines',
    symptoms: ['Unilateral pulsating head pain', 'Nausea/vomiting', 'Photophobia', 'Phonophobia', 'Worsened by physical activity'],
    medications: ['Ibuprofen', 'Naproxen', 'Sumatriptan', 'Rizatriptan', 'Eletriptan', 'Ubrogepant', 'Rimegepant', 'Lasmiditan', 'Propranolol', 'Amitriptyline', 'Valproate', 'Topiramate', 'Erenumab', 'Fremanezumab'],
    treatments: ['NSAIDs (acute)', 'Triptans (acute)', 'CGRP monoclonal antibodies (prevention)', 'Anti-emetics'],
  },
  {
    name: 'Migraine With Aura',
    category: 'Migraines',
    symptoms: ['Visual aura (zigzag lines, scotoma)', 'Sensory aura (tingling)', 'Speech disturbance', 'Headache phase'],
    medications: ['Sumatriptan', 'Propranolol', 'Amitriptyline', 'Topiramate', 'Erenumab', 'Magnesium supplementation'],
    treatments: ['Same acute treatments', 'Avoid combined oral contraceptive', 'Preventive options'],
  },
  {
    name: 'Chronic Migraine (≥15 days/month)',
    category: 'Migraines',
    symptoms: ['Frequent disabling headache days', 'Medication overuse headache risk', 'Significant functional impairment', 'Depression and anxiety'],
    medications: ['OnabotulinumtoxinA (Botox)', 'Erenumab', 'Fremanezumab', 'Galcanezumab', 'Eptinezumab', 'Topiramate'],
    treatments: ['Botox injections every 12 weeks', 'CGRP antibodies', 'Analgesic detoxification', 'Multidisciplinary pain management'],
  },
  {
    name: 'Vestibular Migraine',
    category: 'Migraines',
    symptoms: ['Recurrent vertigo/dizziness', 'Episodes lasting minutes to hours', 'With or without headache'],
    medications: ['Triptans (acute)', 'Betahistine'],
    treatments: ['Preventive migraine therapies', 'Vestibular rehabilitation'],
  },

  // MULTIPLE SCLEROSIS
  {
    name: 'Relapsing-Remitting MS (RRMS)',
    category: 'Multiple Sclerosis',
    symptoms: ['Optic neuritis', 'Limb weakness', 'Sensory changes', 'Balance/coordination problems', 'Fatigue', 'Bladder dysfunction', 'Cognitive changes', 'Depression'],
    medications: ['Natalizumab', 'Ocrelizumab', 'Ofatumumab', 'Cladribine', 'Alemtuzumab', 'Dimethyl fumarate', 'Teriflunomide', 'Siponimod', 'IV methylprednisolone', 'Amantadine', 'Oxybutynin', 'Baclofen', 'Fampridine'],
    treatments: ['High-efficacy DMTs', 'Acute relapse treatment', 'Symptom management', 'Rehabilitation'],
  },
  {
    name: 'Secondary Progressive MS (SPMS)',
    category: 'Multiple Sclerosis',
    symptoms: ['Gradual disability accumulation', 'Progressive gait impairment', 'Balance impairment', 'Spasticity', 'Pain', 'Cognitive decline'],
    medications: ['Siponimod', 'Cladribine'],
    treatments: ['Rehabilitation (physiotherapy, OT)', 'Symptomatic management', 'Power wheelchair', 'Assistive technology'],
  },
  {
    name: 'Primary Progressive MS (PPMS)',
    category: 'Multiple Sclerosis',
    symptoms: ['Steady neurological decline', 'Progressive walking difficulty', 'Spinal cord involvement'],
    medications: ['Ocrelizumab'],
    treatments: ['Aggressive symptom management', 'Neurorehabilitation', 'Multidisciplinary team support'],
  },

  // ME/CFS
  {
    name: 'ME/CFS (Myalgic Encephalomyelitis)',
    category: 'ME/CFS',
    symptoms: ['Post-exertional malaise (PEM)', 'Profound fatigue', 'Unrefreshing sleep', 'Cognitive impairment (brain fog)', 'Orthostatic intolerance', 'Pain'],
    medications: ['Low-dose naltrexone', 'Clonidine', 'Midodrine', 'Fludrocortisone', 'Melatonin', 'Low-dose tricyclics'],
    treatments: ['Energy management / pacing', 'Avoid boom-bust cycles', 'Orthostatic intolerance management'],
  },

  // NARCOLEPSY
  {
    name: 'Narcolepsy Type 1 (with cataplexy)',
    category: 'Narcolepsy',
    symptoms: ['Excessive daytime sleepiness', 'Cataplexy', 'Hypnagogic/hypnopompic hallucinations', 'Sleep paralysis', 'Disrupted nocturnal sleep'],
    medications: ['Sodium oxybate', 'Lumryz (extended-release)', 'Modafinil', 'Armodafinil', 'Solriamfetol', 'Pitolisant', 'Venlafaxine', 'Fluoxetine'],
    treatments: ['Wakefulness agents', 'Scheduled daytime naps', 'Sleep hygiene'],
  },
  {
    name: 'Narcolepsy Type 2 (without cataplexy)',
    category: 'Narcolepsy',
    symptoms: ['Excessive daytime sleepiness', 'REM-related phenomena'],
    medications: ['Modafinil', 'Armodafinil', 'Pitolisant', 'Solriamfetol', 'Sodium oxybate', 'Methylphenidate', 'Amphetamines'],
    treatments: ['Wakefulness agents', 'Scheduled daytime naps'],
  },

  // OBESITY
  {
    name: 'Obesity — Class I–II (BMI 30–39.9)',
    category: 'Obesity',
    symptoms: ['Fatigue', 'Dyspnoea on exertion', 'Joint pain', 'Sleep apnoea', 'Reflux', 'Low self-esteem'],
    medications: ['Semaglutide (Wegovy)', 'Tirzepatide (Zepbound)', 'Naltrexone/bupropion', 'Orlistat'],
    treatments: ['Structured lifestyle programme', 'Diet', 'Physical activity', 'Behavioural therapy'],
  },
  {
    name: 'Obesity — Class III (BMI ≥40)',
    category: 'Obesity',
    symptoms: ['Greater cardiovascular burden', 'Musculoskeletal burden', 'Severe functional impairment'],
    medications: ['Semaglutide (Wegovy)', 'Tirzepatide (Zepbound)', 'Naltrexone/bupropion', 'Orlistat'],
    treatments: ['Roux-en-Y gastric bypass', 'Sleeve gastrectomy', 'Adjustable gastric band', 'Intragastric balloon', 'Intensive dietetic support'],
  },

  // OSTEOPOROSIS
  {
    name: 'Osteoporosis',
    category: 'Osteoporosis',
    symptoms: ['Often asymptomatic until fracture', 'Low-trauma fractures', 'Back pain', 'Height loss', 'Stooped posture (kyphosis)'],
    medications: ['Calcium', 'Vitamin D', 'Alendronate', 'Risedronate', 'Zoledronate', 'Denosumab', 'Teriparatide', 'Abaloparatide', 'Romosozumab'],
    treatments: ['Bisphosphonates', 'Weight-bearing exercise', 'Fall prevention strategies'],
  },

  // PARKINSON'S DISEASE
  {
    name: "Parkinson's — Early Stage",
    category: "Parkinson's Disease",
    symptoms: ['Resting tremor (pill-rolling)', 'Bradykinesia', 'Rigidity', 'Postural instability', 'Hyposmia', 'Constipation', 'REM sleep behaviour disorder', 'Depression', 'Anxiety'],
    medications: ['Levodopa/carbidopa', 'Pramipexole', 'Ropinirole', 'Rasagiline', 'Selegiline', 'Entacapone'],
    treatments: ['Physiotherapy', 'Exercise (boxing, tai chi, cycling)'],
  },
  {
    name: "Parkinson's — Mid Stage",
    category: "Parkinson's Disease",
    symptoms: ['Motor fluctuations ("wearing off")', 'Dyskinesias', 'Freezing of gait', 'Falls', 'Autonomic dysfunction', 'Cognitive changes', 'Hallucinations'],
    medications: ['Optimised levodopa', 'MAO-B inhibitors', 'COMT inhibitors', 'Apomorphine'],
    treatments: ['Speech therapy', 'Levodopa-carbidopa intestinal gel (LCIG) pump', 'Deep brain stimulation (DBS)'],
  },
  {
    name: "Parkinson's — Advanced Stage",
    category: "Parkinson's Disease",
    symptoms: ['Severe disability', 'Cognitive decline/dementia', 'Dysphagia', 'Severe postural instability', 'Psychosis'],
    medications: ['Rivastigmine', 'Quetiapine', 'Clozapine', 'Pimavanserin'],
    treatments: ['Palliative care', 'Multidisciplinary team', 'DBS'],
  },

  // PCOS
  {
    name: 'PCOS — Lean Phenotype',
    category: 'PCOS',
    symptoms: ['Oligomenorrhoea/amenorrhoea', 'Polycystic ovaries', 'Hirsutism', 'Acne', 'Alopecia', 'Infertility'],
    medications: ['Combined oral contraceptive pill', 'Spironolactone', 'Topical eflornithine', 'Letrozole', 'Clomifene'],
    treatments: ['Ovulation induction', 'Anti-androgen therapy'],
  },
  {
    name: 'PCOS — Metabolic Phenotype',
    category: 'PCOS',
    symptoms: ['Oligomenorrhoea/amenorrhoea', 'Obesity', 'Insulin resistance', 'Metabolic syndrome', 'Elevated cardiovascular risk', 'Anxiety', 'Depression'],
    medications: ['Metformin', 'Inositol supplements', 'GLP-1 agonists', 'Combined oral contraceptive pill'],
    treatments: ['Lifestyle modification (diet, exercise)', 'Ovulation induction'],
  },

  // POTS
  {
    name: 'Postural Orthostatic Tachycardia Syndrome (POTS)',
    category: 'POTS',
    symptoms: ['Heart rate increase ≥30 bpm on standing', 'Palpitations', 'Dizziness', 'Pre-syncope', 'Fatigue', 'Cognitive impairment', 'Headache', 'Nausea', 'Exercise intolerance'],
    medications: ['Fludrocortisone', 'Midodrine', 'Ivabradine', 'Low-dose propranolol', 'Pyridostigmine'],
    treatments: ['Increased fluid intake (2–3L/day)', 'Increased salt intake', 'Compression garments', 'Head-of-bed elevation', 'Graduated exercise programme'],
  },

  // PRADER-WILLI SYNDROME
  {
    name: 'Prader-Willi Syndrome',
    category: 'Prader-Willi Syndrome',
    symptoms: ['Neonatal hypotonia', 'Feeding difficulties', 'Insatiable hunger (hyperphagia)', 'Obesity', 'Intellectual disability', 'Short stature', 'Hypogonadism', 'Behavioural challenges', 'Sleep-disordered breathing', 'Scoliosis'],
    medications: ['Growth hormone therapy', 'Hormone replacement'],
    treatments: ['Strict dietary supervision', 'Calorie restriction', 'CPAP (sleep apnoea)', 'Behavioural therapy'],
  },

  // SICKLE CELL & HAEMOGLOBIN DISORDERS
  {
    name: 'Sickle Cell Anaemia (HbSS)',
    category: 'Sickle Cell & Haemoglobin Disorders',
    symptoms: ['Vaso-occlusive crises (severe pain)', 'Acute chest syndrome', 'Stroke', 'Splenic sequestration', 'Priapism', 'Avascular necrosis', 'Chronic haemolytic anaemia', 'Fatigue', 'Delayed growth'],
    medications: ['Hydroxyurea', 'Voxelotor', 'Crizanlizumab', 'L-glutamine', 'Opioids (crises)', 'NSAIDs', 'Penicillin prophylaxis'],
    treatments: ['Blood transfusions', 'Haematopoietic stem cell transplant', 'Gene therapy (betibeglogene/exa-cel)', 'Vaccinations'],
  },
  {
    name: 'Beta-thalassaemia Major',
    category: 'Sickle Cell & Haemoglobin Disorders',
    symptoms: ['Severe anaemia from infancy', 'Hepatosplenomegaly', 'Bone deformities', 'Growth retardation', 'Iron overload'],
    medications: ['Deferoxamine', 'Deferasirox', 'Deferiprone', 'Luspatercept'],
    treatments: ['Regular blood transfusions', 'Iron chelation therapy', 'Stem cell transplant', 'Gene therapy (betibeglogene)'],
  },

  // SUBSTANCE USE DISORDERS
  {
    name: 'Alcohol Use Disorder',
    category: 'Substance Use Disorders',
    symptoms: ['Craving', 'Inability to control intake', 'Tolerance', 'Withdrawal (tremors, seizures, delirium tremens)', 'Liver disease', 'Neuropathy', 'Cardiomyopathy', 'Cognitive impairment', 'Depression/anxiety'],
    medications: ['Benzodiazepines (withdrawal)', 'Naltrexone', 'Acamprosate', 'Disulfiram', 'Nalmefene', 'Thiamine'],
    treatments: ['Medically supervised detoxification', 'Mutual aid (AA, SMART Recovery)', 'CBT', 'Motivational interviewing'],
  },
  {
    name: 'Opioid Use Disorder',
    category: 'Substance Use Disorders',
    symptoms: ['Euphoria/sedation', 'Severe withdrawal', 'Cravings', 'Overdose risk', 'Abscesses (IV use)', 'Hepatitis/HIV risk'],
    medications: ['Methadone', 'Buprenorphine/naloxone (Suboxone)', 'Naltrexone (extended-release)', 'Naloxone (Narcan)'],
    treatments: ['Opioid agonist therapy (OAT)', 'Harm reduction', 'Needle exchange', 'CBT', 'Contingency management'],
  },
  {
    name: 'Stimulant Use Disorder',
    category: 'Substance Use Disorders',
    symptoms: ['Euphoria', 'Agitation', 'Cardiovascular effects', 'Paranoia', 'Psychosis', 'Depression on withdrawal', 'Fatigue', 'Cravings'],
    medications: ['Mirtazapine', 'Topiramate', 'Naltrexone'],
    treatments: ['Contingency management', 'CBT'],
  },
  {
    name: 'Cannabis Use Disorder',
    category: 'Substance Use Disorders',
    symptoms: ['Impaired memory/cognition', 'Motivational syndrome', 'Anxiety', 'Paranoia', 'Cannabis hyperemesis syndrome', 'Irritability', 'Insomnia'],
    medications: ['Short-term benzodiazepines', 'Quetiapine', 'Gabapentin'],
    treatments: ['CBT', 'Motivational enhancement therapy (MET)'],
  },

  // SLEEP APNOEA
  {
    name: 'Obstructive Sleep Apnoea (OSA)',
    category: 'Sleep Apnoea',
    symptoms: ['Loud snoring', 'Witnessed apnoeas', 'Choking/gasping', 'Excessive daytime sleepiness', 'Morning headaches', 'Poor concentration', 'Nocturia', 'Hypertension', 'Mood disturbance'],
    medications: [],
    treatments: ['CPAP therapy', 'Auto-adjusting CPAP (APAP)', 'BiPAP', 'Mandibular advancement device', 'Positional therapy', 'Weight loss', 'Upper airway surgery', 'Hypoglossal nerve stimulator', 'Adenotonsillectomy (children)'],
  },
  {
    name: 'Central Sleep Apnoea (CSA)',
    category: 'Sleep Apnoea',
    symptoms: ['Apnoeas without respiratory effort', 'Cheyne-Stokes respiration', 'Insomnia', 'Excessive sleepiness'],
    medications: ['Acetazolamide'],
    treatments: ['Treat underlying cause', 'Adaptive servo-ventilation (ASV)', 'Bilevel PAP with backup rate', 'Phrenic nerve stimulation', 'Optimise heart failure therapy'],
  },

  // THYROID DISEASE
  {
    name: "Hypothyroidism (incl. Hashimoto's)",
    category: 'Thyroid Disease',
    symptoms: ['Fatigue', 'Weight gain', 'Cold intolerance', 'Constipation', 'Dry skin', 'Hair thinning', 'Bradycardia', 'Cognitive slowing', 'Depression', 'Menstrual irregularity'],
    medications: ['Levothyroxine', 'Liothyronine (T3)'],
    treatments: ['Regular TSH monitoring', 'Myxoedema coma: IV levothyroxine + hydrocortisone'],
  },
  {
    name: "Hyperthyroidism / Graves' Disease",
    category: 'Thyroid Disease',
    symptoms: ['Weight loss', 'Heat intolerance', 'Sweating', 'Palpitations', 'Tremor', 'Anxiety', 'Diarrhoea', 'Exophthalmos', 'Goitre', 'Proximal myopathy'],
    medications: ['Carbimazole', 'Propylthiouracil', 'Propranolol', 'Teprotumumab'],
    treatments: ['Antithyroid drugs', 'Radioactive iodine ablation', 'Thyroidectomy', 'Thyroid storm monitoring'],
  },
  {
    name: 'Thyroid Nodules / Differentiated Thyroid Cancer',
    category: 'Thyroid Disease',
    symptoms: ['Often asymptomatic', 'Dysphagia', 'Hoarseness', 'Neck mass'],
    medications: ['Levothyroxine suppression therapy', 'Lenvatinib', 'Sorafenib'],
    treatments: ['Thyroidectomy', 'Radioactive iodine ablation', 'TSH monitoring'],
  },

  // TUBERCULOSIS
  {
    name: 'Active Pulmonary TB',
    category: 'Tuberculosis',
    symptoms: ['Persistent productive cough (>3 weeks)', 'Haemoptysis', 'Night sweats', 'Unexplained weight loss', 'Fever', 'Fatigue'],
    medications: ['Isoniazid', 'Rifampicin', 'Pyrazinamide', 'Ethambutol', 'Pyridoxine'],
    treatments: ['Standard 6-month HRZE regimen', 'Directly observed therapy (DOT)'],
  },
  {
    name: 'Latent TB',
    category: 'Tuberculosis',
    symptoms: ['No symptoms', 'Positive TST or IGRA'],
    medications: ['Isoniazid', 'Rifampicin', 'Rifapentine'],
    treatments: ['Isoniazid monotherapy (6–9 months)', 'Rifampicin (4 months)', '3HP regimen'],
  },
  {
    name: 'Drug-Resistant TB (MDR-TB / XDR-TB)',
    category: 'Tuberculosis',
    symptoms: ['Same as active TB', 'Fails standard treatment', 'Higher mortality'],
    medications: ['Bedaquiline', 'Linezolid', 'Pretomanid', 'Moxifloxacin'],
    treatments: ['BPaL or BPaLM regimen', 'Drug sensitivity testing', 'Expert consultation'],
  },

  // WILLIAMS SYNDROME
  {
    name: 'Williams Syndrome',
    category: 'Williams Syndrome',
    symptoms: ['Characteristic "elfin" facial features', 'Intellectual disability', 'Highly sociable personality', 'Hypercalcaemia', 'Supravalvular aortic stenosis', 'Hypersensitivity to sound', 'Anxiety', 'Joint hypermobility'],
    medications: ['SSRIs (anxiety)'],
    treatments: ['Cardiac surgery for SVAS', 'Calcium/vitamin D restriction', 'Speech therapy', 'Occupational therapy', 'Educational therapy', 'Regular cardiac surveillance'],
  },
];

/** Get all unique symptoms across all predefined conditions */
export function getAllPredefinedSymptoms(): string[] {
  const set = new Set<string>();
  PREDEFINED_CONDITIONS.forEach(c => c.symptoms.forEach(s => set.add(s)));
  return Array.from(set).sort();
}

/** Get all unique medications across all predefined conditions */
export function getAllPredefinedMedications(): string[] {
  const set = new Set<string>();
  PREDEFINED_CONDITIONS.forEach(c => c.medications.forEach(m => set.add(m)));
  return Array.from(set).sort();
}

/** Get all unique treatments across all predefined conditions */
export function getAllPredefinedTreatments(): string[] {
  const set = new Set<string>();
  PREDEFINED_CONDITIONS.forEach(c => c.treatments.forEach(t => set.add(t)));
  return Array.from(set).sort();
}

/** Get predefined conditions for a given category */
export function getConditionsByCategory(category: string): PredefinedCondition[] {
  return PREDEFINED_CONDITIONS.filter(c => c.category === category);
}

/** Search predefined items by name */
export function searchPredefined<T extends { name?: string }>(items: T[], query: string): T[] {
  const q = query.toLowerCase();
  return items.filter(item => item.name?.toLowerCase().includes(q) || (typeof item === 'string' && (item as string).toLowerCase().includes(q)));
}

export function searchPredefinedStrings(items: string[], query: string): string[] {
  const q = query.toLowerCase();
  return items.filter(item => item.toLowerCase().includes(q));
}
