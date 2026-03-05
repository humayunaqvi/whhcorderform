/**
 * Patient-friendly descriptions for all 43 orderable tests.
 * Keys must match test names in test-options.ts exactly.
 */
export const TEST_DESCRIPTIONS: Record<string, string> = {
  // ── Stress Tests ──────────────────────────────────────────────
  'Exercise Treadmill Stress Test':
    'This test evaluates how your heart performs during physical activity. You will walk on a treadmill while your heart rate, blood pressure, and heart rhythm are monitored. The speed and incline gradually increase. This helps your doctor detect any signs of coronary artery disease or abnormal heart rhythms.',

  'Lexiscan Nuclear Stress Test':
    'This test uses a medication called Lexiscan (regadenoson) to simulate the effects of exercise on your heart, combined with a small amount of radioactive tracer to create detailed images of blood flow to your heart muscle. It is ideal for patients who cannot exercise on a treadmill. The test helps identify areas of your heart that may not be receiving adequate blood supply.',

  'Exercise Nuclear Stress Test':
    'This test combines treadmill exercise with nuclear imaging. While you walk on a treadmill, a small amount of radioactive tracer is injected into your bloodstream to create detailed images of blood flow to your heart. Images are taken at rest and after exercise to compare blood flow patterns and detect any blockages.',

  'Stress Echocardiogram':
    'This test uses ultrasound imaging to evaluate your heart before and immediately after exercise on a treadmill. By comparing images of your heart at rest and under stress, your doctor can assess how well your heart muscle is functioning and detect areas that may not be receiving enough blood flow.',

  'PET Stress':
    'Positron Emission Tomography (PET) stress testing is an advanced imaging technique that provides highly detailed images of blood flow to your heart muscle. A radioactive tracer is used along with a stress agent to evaluate coronary blood flow. PET offers superior image quality and accuracy compared to standard nuclear stress tests.',

  // ── Monitoring Devices ────────────────────────────────────────
  'MCT (Mobile Cardiac Telemetry)':
    'Mobile Cardiac Telemetry is a small, wireless heart monitor that you wear continuously. It records your heart rhythm 24/7 and automatically transmits data to a monitoring center. This allows your doctor to detect irregular heart rhythms (arrhythmias) that may occur unpredictably. You will wear the device for the prescribed number of days.',

  'Extended Holter Monitor':
    'An Extended Holter Monitor is a portable device that continuously records your heart\'s electrical activity over several days. Small electrodes are placed on your chest, and the device stores the data for your doctor to review. This extended monitoring increases the chance of capturing intermittent heart rhythm abnormalities.',

  'Ambulatory Blood Pressure Monitor':
    'This device measures your blood pressure automatically at regular intervals throughout the day and night while you go about your normal activities. It provides a complete picture of how your blood pressure behaves over a full 24 to 48-hour period, which helps your doctor make more accurate treatment decisions.',

  'Clinii BP Cuff':
    'The Clinii Blood Pressure Cuff is a connected blood pressure monitor that allows you to take readings at home and share them with your healthcare team electronically. Regular monitoring helps your doctor track your blood pressure trends and adjust medications as needed.',

  'Clinii Weight Scale':
    'The Clinii Weight Scale is a connected device that tracks your daily weight and transmits the data to your healthcare team. Monitoring weight changes is especially important for patients with heart failure, as sudden weight gain may indicate fluid retention that needs medical attention.',

  'BioBridge Device Monitoring Enrollment':
    'BioBridge is a remote monitoring program for patients with implanted cardiac devices such as pacemakers or defibrillators. Once enrolled, your device data is automatically transmitted to your care team, allowing them to monitor your heart rhythm and device function without requiring frequent office visits.',

  'In-Office Pacemaker Interrogation':
    'A pacemaker interrogation is a quick, painless procedure performed in our office. A small wand is placed over your pacemaker to read the stored data. This tells your doctor how your pacemaker is functioning, checks the battery life, and reviews any heart rhythm events that have been recorded.',

  // ── Office Imaging ────────────────────────────────────────────
  'Echocardiogram':
    'An echocardiogram uses sound waves (ultrasound) to create moving images of your heart. This painless test shows the size, structure, and function of your heart chambers and valves. It helps your doctor evaluate how well your heart is pumping and detect conditions such as valve problems, heart failure, or fluid around the heart.',

  'Carotid Ultrasound':
    'This non-invasive test uses ultrasound to examine the carotid arteries in your neck, which supply blood to your brain. It checks for narrowing or blockages caused by plaque buildup (atherosclerosis). The test helps assess your risk of stroke and guides treatment decisions.',

  'Ankle-Brachial Index':
    'The Ankle-Brachial Index (ABI) is a simple, non-invasive test that compares blood pressure readings in your ankles and arms. A lower pressure in the ankle may indicate narrowing of the arteries in your legs (peripheral arterial disease), which is also a marker for cardiovascular disease elsewhere in the body.',

  'Peripheral Arterial Doppler':
    'This ultrasound test examines blood flow in the arteries of your legs to detect blockages or narrowing. Sound waves are used to measure the speed and direction of blood flow. It helps diagnose peripheral arterial disease (PAD), which can cause leg pain, numbness, and increase your risk of heart attack and stroke.',

  'Abdominal Aortic Aneurysm Screen':
    'This screening uses ultrasound to check the aorta (the main blood vessel in your abdomen) for any abnormal widening or bulging (aneurysm). An abdominal aortic aneurysm can be life-threatening if it ruptures, so early detection allows for monitoring and, if necessary, intervention before complications occur.',

  'Venous Study':
    'A venous study uses ultrasound to evaluate the veins in your legs for blood clots (deep vein thrombosis), valve problems, or insufficiency. The test checks blood flow direction and speed to determine if your veins are functioning properly. It is commonly performed to evaluate leg swelling, pain, or varicose veins.',

  // ── Out-of-Office Imaging ─────────────────────────────────────
  'Cardiac CTA':
    'Cardiac CT Angiography is an advanced imaging test that uses a CT scanner with contrast dye to create detailed 3D images of your coronary arteries. This non-invasive test can detect blockages, plaque buildup, and other abnormalities in the arteries that supply blood to your heart.',

  'Cardiac CTA w/ FFR':
    'This combines Cardiac CT Angiography with Fractional Flow Reserve analysis. In addition to imaging your coronary arteries, the FFR component uses advanced computer analysis to evaluate whether any detected blockages are significantly reducing blood flow to your heart muscle, helping determine if a procedure is needed.',

  'Cardiac CTA with Cleerly Plaque Analysis':
    'This advanced test combines Cardiac CT Angiography with Cleerly AI-powered plaque analysis. In addition to showing your coronary arteries, the Cleerly analysis provides a detailed characterization of any plaque found, including its type, volume, and risk level. This helps your doctor create a more personalized treatment plan.',

  'Calcium Score':
    'A Coronary Calcium Score is a quick, non-invasive CT scan that measures the amount of calcium deposits in the walls of your coronary arteries. A higher score indicates more plaque buildup and a greater risk of future heart events. This test helps your doctor assess your cardiovascular risk and guide preventive treatment.',

  'CTA Carotid':
    'CT Angiography of the carotid arteries uses a CT scanner with contrast dye to create detailed images of the blood vessels in your neck that supply blood to your brain. This test helps detect narrowing, blockages, or other abnormalities that may increase your risk of stroke.',

  'CT Thoracic Aorta':
    'This CT scan creates detailed cross-sectional images of the thoracic aorta (the large blood vessel in your chest). It is used to evaluate conditions such as aneurysms, dissections, or other abnormalities of the aorta. Contrast dye is used to enhance the images.',

  'Cardiac MRI':
    'Cardiac MRI uses magnetic fields and radio waves to create highly detailed images of your heart. It provides information about heart structure, function, and tissue characteristics without radiation. This test is particularly useful for evaluating heart muscle disease, scarring, inflammation, and complex congenital conditions.',

  'PYP Scan':
    'A PYP (Pyrophosphate) Scan is a nuclear imaging test used to detect a specific type of heart disease called cardiac amyloidosis, where abnormal proteins deposit in the heart muscle and impair its function. A small amount of radioactive tracer is injected and images are taken to look for uptake in the heart.',

  'FDG PET':
    'FDG PET (Fluorodeoxyglucose Positron Emission Tomography) is an advanced imaging test that detects areas of inflammation or abnormal metabolic activity in the heart. It is commonly used to evaluate cardiac sarcoidosis, infection of cardiac devices, and other inflammatory heart conditions.',

  'Sleep Study':
    'A sleep study (polysomnography) monitors your sleep patterns, breathing, oxygen levels, and heart rhythm overnight. Sleep apnea and other sleep disorders are closely linked to cardiovascular health. Identifying and treating sleep issues can improve blood pressure, heart rhythm, and overall heart health.',

  'CT (General)':
    'A CT scan creates detailed cross-sectional images of the body using X-rays and computer processing. Your doctor has ordered a specific CT scan to evaluate the area of concern. The scan is quick and painless, though contrast dye may be used to enhance the images.',

  'Other Imaging':
    'Your doctor has ordered an additional imaging test to help evaluate your condition. The specific details of this test will be discussed with you. Please follow any preparation instructions provided by our staff.',

  // ── Procedures ────────────────────────────────────────────────
  'Left Heart Catheterization':
    'Also known as a coronary angiogram, this procedure involves inserting a thin, flexible tube (catheter) through a blood vessel in your wrist or groin and guiding it to your heart. Contrast dye is injected to visualize your coronary arteries on X-ray, allowing your doctor to identify any blockages. If a significant blockage is found, it may be treated during the same procedure with a stent.',

  'Right Heart Catheterization':
    'This procedure involves inserting a catheter through a vein and threading it into the right side of your heart and pulmonary artery. It directly measures pressures inside your heart chambers and lungs, and assesses how well your heart is pumping. This information is essential for diagnosing and managing heart failure and pulmonary hypertension.',

  'TEE (Transesophageal Echocardiogram)':
    'A TEE is an ultrasound of the heart performed by passing a small probe down your esophagus (the tube connecting your mouth to your stomach). Because the esophagus sits directly behind the heart, TEE provides much clearer and more detailed images than a standard echocardiogram. You will receive sedation for comfort during this procedure.',

  'TEE w/ Cardioversion':
    'This combines a Transesophageal Echocardiogram with cardioversion. First, the TEE checks for blood clots in the heart. If no clots are found, a brief electrical shock (cardioversion) is delivered to restore your heart to a normal rhythm. You will be sedated throughout the procedure.',

  'Cardioversion Only':
    'Cardioversion is a procedure that uses a brief, controlled electrical shock to restore your heart to its normal rhythm. Adhesive pads are placed on your chest, and the shock is delivered while you are under sedation. The procedure is quick and you will be monitored afterward as the sedation wears off.',

  'Loop Recorder Placement':
    'An implantable loop recorder is a small device (about the size of a USB drive) that is placed just under the skin of your chest through a tiny incision. It continuously monitors your heart rhythm for up to three years, automatically recording any abnormal events. This is helpful for diagnosing unexplained fainting, palpitations, or stroke.',

  'Dobutamine Stress Echo':
    'This test uses a medication called dobutamine, given through an IV, to make your heart beat faster and harder — simulating the effects of exercise. Ultrasound images are taken before and during the infusion to evaluate how your heart muscle responds. This test is used for patients who cannot exercise on a treadmill.',

  'Tilt Table Test':
    'The tilt table test evaluates the cause of unexplained fainting (syncope). While strapped securely to a table, you are gradually tilted from a lying position to an upright position. Your heart rate, blood pressure, and symptoms are monitored throughout. This test helps determine if your fainting is related to a drop in blood pressure or heart rate.',

  // ── Additional Orders ─────────────────────────────────────────
  'Obtain Medical Records':
    'We are requesting your medical records from another healthcare provider. These records will help us gain a more complete understanding of your medical history and ensure we provide the best possible care.',

  'Blood Pressure Log':
    'You have been asked to keep a blood pressure log. Please measure and record your blood pressure readings at home as instructed. Bring this log to your next appointment so your doctor can review the readings and make any necessary adjustments to your treatment.',

  'Labs are Printed':
    'Lab orders have been printed for you. Please take the printed lab orders to the designated lab facility to have your blood work completed. Try to complete your labs before your next appointment so results are available for your doctor to review.',

  'Please Order Labs':
    'Your doctor has requested specific laboratory tests. These blood tests will provide important information about your health and help guide your treatment plan. You will receive instructions on where and when to complete the lab work.',

  'Pre-Operative Cardiac Risk Stratification Paperwork':
    'Your doctor is completing a cardiac risk assessment for your upcoming surgery. This evaluation reviews your heart health to help your surgical team understand any cardiovascular risks and take appropriate precautions to keep you safe during and after your procedure.',

  'Refer for Clinical Trial':
    'Your doctor believes you may be eligible for a clinical trial. Clinical trials offer access to new treatments and therapies that are not yet widely available. Participation is always voluntary, and your care team will provide detailed information about the trial, including potential benefits and risks.',
};
