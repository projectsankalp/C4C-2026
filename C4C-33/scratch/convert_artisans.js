const fs = require('fs');
const path = require('path');

const targetFilePath = 'c:\\Users\\mhyas\\Desktop\\projects\\Hackathon Projs\\HaathSe\\src\\data\\mockData.js';
let fileContent = fs.readFileSync(targetFilePath, 'utf8');

// 1. Ram Swaroop -> Radha Devi
fileContent = fileContent
  .replace(/Ram Swaroop/g, 'Radha Devi')
  .replace(/राम स्वरूप/g, 'राधा देवी')
  .replace(/राम स्वरुप/g, 'राधा देवी')
  .replace(/gender:\s*"Male"/g, 'gender: "Female"') // first instance
  .replace(/Trained under his father/g, 'Trained under her mother')
  .replace(/dedicated his life/g, 'dedicated her life')
  .replace(/specializing in traditional/g, 'specializing in traditional')
  .replace(/Ram is one of/g, 'Radha is one of')
  .replace(/राम जिले के/g, 'राधा जिले के')
  .replace(/ಇವರೂ ಒಬ್ಬರು/g, 'ಇವರೂ ಒಬ್ಬರು')
  .replace(/राम एक आहेत/g, 'राधा एक आहेत')
  .replace(/రామ్ ఒకరు/g, 'రాధ ఒకరు')
  .replace(/I am Ram Swaroop/g, 'I am Radha Devi')
  .replace(/मैं राम स्वरुप हूँ/g, 'मैं राधा देवी हूँ')
  .replace(/நான் ராம் ஸ்வரூப்/g, 'நான் राधा देवी')
  .replace(/আমি রাম স্বরূপ/g, 'আমি রাধা দেবী')
  .replace(/ನಾನು ರಾಮ್ ಸ್ವರೂಪ್/g, 'ನಾನು ರಾಧಾ ದೇವಿ')
  .replace(/मी राम स्वरूप/g, 'मी राधा देवी')
  .replace(/నేను రామ్ స్వరూప్/g, 'నేను రాధా దేవి')
  .replace(/मेरे ३६ वर्षों/g, 'मेरे ३६ वर्षों')
  .replace(/ನನ್ನ ೩೬ ವರ್ಷಗಳ/g, 'ನನ್ನ ೩೬ ವರ್ಷಗಳ')
  .replace(/मैं राम स्वरूप हूँ/g, 'मैं राधा देवी हूँ');

// 2. Shivram Baghel -> Shanti Baghel
fileContent = fileContent
  .replace(/Shivram Baghel/g, 'Shanti Baghel')
  .replace(/शिवराम बघेल/g, 'शांति बघेल')
  .replace(/శివరామ్ బాఘేల్/g, 'శాంతి బాఘేల్')
  .replace(/Shivram/g, 'Shanti')
  .replace(/शिवराम/g, 'शांति')
  .replace(/சிவ்ராம்/g, 'சாந்தி')
  .replace(/শিবরাম/g, 'শান্তি')
  .replace(/ಶಿವರಾಮ್/g, 'ಶಾಂತಿ')
  .replace(/शिवाजी/g, 'शांती')
  .replace(/శివరామ్/g, 'శాంతి')
  .replace(/practices the lost-wax/g, 'practices the lost-wax')
  .replace(/He is keeping/g, 'She is keeping')
  .replace(/वह बस्तर के/g, 'वह बस्तर के')
  .replace(/அவர் பஸ்தார்/g, 'அவர் பஸ்தார்')
  .replace(/তিনি বস্তারের/g, 'তিনি বস্তারের')
  .replace(/ಅವರು ಬಸ್ತಾರ್/g, 'ಅವರು ಬಸ್ತಾರ್')
  .replace(/ते बस्तरच्या/g, 'त्या बस्तरच्या')
  .replace(/అతను బస్తార్/g, 'ఆమె బస్తార్')
  .replace(/Shivram is an expert/g, 'Shanti is an expert')
  .replace(/शिवराम एक विशेषज्ञ/g, 'शांति एक विशेषज्ञ')
  .replace(/சிவ்ராம் பழங்குடி/g, 'சாந்தி பழங்குடி')
  .replace(/শিবরাম একজন বিশেষজ্ঞ/g, 'শান্তি একজন বিশেষজ্ঞ')
  .replace(/ಶಿವರಾಮ್ ಬುಡಕಟ್ಟು/g, 'ಶಾಂತಿ ಬುಡಕಟ್ಟು')
  .replace(/शिवराम हे आदिवासी/g, 'शांती या आदिवासी')
  .replace(/శివరామ్ గిరిజన/g, 'శాంతి గిరిజన')
  .replace(/I am Shivram/g, 'I am Shanti')
  .replace(/मैं कोंडागांव से शांति बघेल हूँ/g, 'मैं कोंडागांव से शांति बघेल हूँ')
  .replace(/நான் கொண்டகானில் இருந்து சாந்தி/g, 'நான் கொண்டகானில் இருந்து சாந்தி')
  .replace(/ನಾನು ಕೊಂಡಗಾಂವ್‌ನಿಂದ ಶಾಂತಿ/g, 'ನಾನು ಕೊಂಡಗಾಂವ್‌ನಿಂದ ಶಾಂತಿ')
  .replace(/मी कोंडागावचा शांति बघेल/g, 'मी कोंडागावची शांति बघेल')
  .replace(/నేను కొండగావ్ నుండి శాంతి/g, 'నేను కొండగావ్ నుండి శాంతి');

// 3. Ghulam Rasool -> Fatima Bano
fileContent = fileContent
  .replace(/Ghulam Rasool/g, 'Fatima Bano')
  .replace(/गुलाम रसूल/g, 'फातिमा बानो')
  .replace(/గులామ్ రసూల్/g, 'ఫాతిమా బానో')
  .replace(/Ghulam/g, 'Fatima')
  .replace(/गुलाम/g, 'फातिमा')
  .replace(/குலாம்/g, 'பாத்திமா')
  .replace(/গোলাম রসুল/g, 'ফাতিমা বানু')
  .replace(/ಗುಲಾಮ್/g, 'ಫಾತಿಮಾ')
  .replace(/अस्सलामु अलैकुम, मेरा नाम फातिमा बानो है/g, 'अस्सलामु अलैकुम, मेरा नाम फातिमा बानो है')
  .replace(/அஸ்ஸலாமு அலைக்கும், என் பெயர் பாத்திமா/g, 'அஸ்ஸலாமு அலைக்கும், என் பெயர் பாத்திமா')
  .replace(/ಅಸ್ಸಲಾಮು ಅಲೈಕುಮ್, ನನ್ನ ಹೆಸರು ಫಾತಿಮಾ/g, 'ಅಸ್ಸಲಾಮು ಅಲೈಕುಮ್, ನನ್ನ ಹೆಸರು ಫಾತಿಮಾ')
  .replace(/अस्सलामु अलैकुम, माझे नाव फातिमा बानो आहे/g, 'अस्सलामु अलैकुम, माझे नाव फातिमा बानो आहे')
  .replace(/అస్సలాము అలైకుమ్, నా పేరు ఫాతిమా/g, 'అస్సలాము అలైకుమ్, నా పేరు ఫాతిమా')
  .replace(/I am Fatima Bano/g, 'I am Fatima Bano')
  .replace(/मैं कश्मीरी पश्मीना शॉल चांगथंगी ऊन से बनी है। इसे 'तालीम' कोड लिपि का अनुवाद करके तीन महीनों में तैयार किया गया है।/g, 'मैं फातिमा बानो हूँ। यह कश्मीरी पश्मीना शॉल चांगथंगी ऊन से बनी है। इसे तीन महीनों में तैयार किया गया है।')
  .replace(/Passed down through seven generations/g, 'Passed down through seven generations of women weavers')
  .replace(/originating from the fine/g, 'originating from the fine')
  .replace(/hand-woven on wooden looms/g, 'hand-woven on wooden looms')
  .replace(/Fatima is one of/g, 'Fatima is one of')
  .replace(/फातिमा 'कानी' शॉल/g, 'फातिमा \'कानी\' शॉल')
  .replace(/பாத்திமா 'கானி'/g, 'பாத்திமா \'கானி\'')
  .replace(/ফাতিমা 'কানি'/g, 'ফাতিমা \'কানি\'')
  .replace(/ಫಾತಿಮಾ ಅವರು 'ಕಾನಿ'/g, 'ಫಾತಿಮಾ ಅವರು \'ಕಾನಿ\'')
  .replace(/He spent three months/g, 'She spent three months')
  .replace(/इसे बुनने में हमें लगभग तीन महीने लगे हैं/g, 'इसे बुनने में हमें लगभग तीन महीने लगे हैं');

// 4. Devappa M. -> Devamma M.
fileContent = fileContent
  .replace(/Devappa M\./g, 'Devamma M.')
  .replace(/Devappa/g, 'Devamma')
  .replace(/देवप्पा/g, 'देवम्मा')
  .replace(/தேவப்பா/g, 'தேவம்மா')
  .replace(/দেবপ্পা/g, 'দেবম্মা')
  .replace(/ದೇವಪ್ಪ/g, 'ದೇವಮ್ಮ')
  .replace(/ದೇವಪ್ಪ M\./g, 'ದೇವಮ್ಮ M.')
  .replace(/ದೇವಪ್ಪ ಅವರು/g, 'ದೇವಮ್ಮ ಅವರು')
  .replace(/ದೇವರಾಜ್/g, 'ದೇವಮ್ಮ')
  .replace(/దేవప్ప/g, 'దేవమ్మ')
  .replace(/National Awardee Devamma/g, 'National Awardee Devamma')
  .replace(/देवम्मा ने 40 वर्षों/g, 'देवम्मा ने 40 वर्षों')
  .replace(/தேவம்மா 40 ஆண்டுகளாக/g, 'தேவம்மா 40 ஆண்டுகளாக')
  .replace(/দেবম্মা ৪০ বছর ধরে/g, 'দেবম্মা ৪০ বছর ধরে')
  .replace(/ದೇವಮ್ಮ ಅವರು ೪೦ ವರ್ಷಗಳಿಂದ/g, 'ದೇವಮ್ಮ ಅವರು ೪೦ ವರ್ಷಗಳಿಂದ')
  .replace(/देवम्मा यांनी ४० वर्षांपासून/g, 'देवम्मा यांनी ४० वर्षांपासून')
  .replace(/దేవమ్మ 40 సంవత్సరాలు/g, 'దేవమ్మ 40 సంవత్సరాలు')
  .replace(/Devamma is a legendary/g, 'Devamma is a legendary')
  .replace(/देवम्मा सागर/g, 'देवम्मा सागर')
  .replace(/தேவம்மா சிவமோக்காவின்/g, 'தேவம்மா சிவமோக்காவின்')
  .replace(/ದೇವಮ್ಮ ಶಿವಮೊಗ್ಗದ/g, 'ದೇವಮ್ಮ ಶಿವಮೊಗ್ಗದ')
  .replace(/देवम्मा सागर, शिवमोगा/g, 'देवम्मा सागर, शिवमोगा')
  .replace(/దేవమ్మ శివమొగ్గలోని/g, 'దేవమ్మ శివమొగ్గలోని')
  .replace(/I am Devamma/g, 'I am Devamma')
  .replace(/मैं सागर से देवम्मा हूँ/g, 'मैं सागर से देवम्मा हूँ')
  .replace(/நான் சாகரிலிருந்து தேவம்மா/g, 'நான் சாகரிலிருந்து தேவம்மா')
  .replace(/ನಾನು ಸಾಗರದಿಂದ ದೇವಮ್ಮ/g, 'ನಾನು ಸಾಗರದಿಂದ ದೇವಮ್ಮ')
  .replace(/मी सागरमधून देवम्मा/g, 'मी सागरमधून देवम्मा')
  .replace(/నేను సాగర్ నుండి దేవమ్మ/g, 'నేను సాగర్ నుండి దేవమ్మ')
  .replace(/It took me 24 days/g, 'It took me 24 days')
  .replace(/ಇದನ್ನು ಮಾಡಲು ನನಗೆ/g, 'ಇದನ್ನು ಮಾಡಲು ನನಗೆ')
  .replace(/ಹಾಗೂ ಸುರಕ್ಷಿತವಾಗಿದೆ/g, 'ಹಾಗೂ ಸುರಕ್ಷಿತವಾಗಿದೆ')
  .replace(/ದೇವಮ್ಮ. ಈ ಆನೆಯನ್ನು/g, 'ದೇವಮ್ಮ. ಈ ಆನೆಯನ್ನು');

// Ensure all "gender: \"Male\"" are replaced with "gender: \"Female\""
fileContent = fileContent.replace(/gender:\s*"Male"/g, 'gender: "Female"');

fs.writeFileSync(targetFilePath, fileContent, 'utf8');
console.log("Successfully converted all mock artisans to rural women!");
