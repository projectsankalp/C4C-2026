const fs = require('fs');
let c = fs.readFileSync('apps/mobile/app/breathing-tools.tsx', 'utf8');

c = c.replace(/'#fafaf3'/g, "'#FFF7F8'")
     .replace(/'#466736'/g, "'#E89AAE'")
     .replace(/'#e8e9e2'/g, "'#FFFDFD'")
     .replace(/'#1a1c18'/g, "'#2B2B2B'")
     .replace(/'#bde4a7'/g, "'#F6C7D2'")
     .replace(/'#062100'/g, "'#2B2B2B'")
     .replace(/'#c7eeb0'/g, "'#F9E3E8'");

c = c.replace(/fontSize: (\d+),/g, "fontSize: $1,\n    fontFamily: 'PlusJakartaSans-Regular',");
c = c.replace(/fontWeight: '700',\s*fontFamily: 'PlusJakartaSans-Regular',/g, "fontFamily: 'PlusJakartaSans-Bold',");
c = c.replace(/fontWeight: 'bold',\s*fontFamily: 'PlusJakartaSans-Regular',/g, "fontFamily: 'PlusJakartaSans-Bold',");
c = c.replace(/fontWeight: '600',\s*fontFamily: 'PlusJakartaSans-Regular',/g, "fontFamily: 'PlusJakartaSans-SemiBold',");
c = c.replace(/fontWeight: '500',\s*fontFamily: 'PlusJakartaSans-Regular',/g, "fontFamily: 'PlusJakartaSans-Medium',");

fs.writeFileSync('apps/mobile/app/breathing-tools.tsx', c);
