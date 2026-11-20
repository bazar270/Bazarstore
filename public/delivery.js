const iraqRegions = [
 ['baghdad','بەغدا','بغداد','Baghdad'],['erbil','هەولێر','أربيل','Erbil'],
 ['sulaymaniyah','سلێمانی','السليمانية','Sulaymaniyah'],['duhok','دهۆک','دهوك','Duhok'],
 ['halabja','هەڵەبجە','حلبجة','Halabja'],['kirkuk','کەرکووک','كركوك','Kirkuk'],
 ['nineveh','نەینەوا','نينوى','Nineveh'],['anbar','ئەنبار','الأنبار','Anbar'],
 ['basra','بەسرە','البصرة','Basra'],['diyala','دیالە','ديالى','Diyala'],
 ['salahuddin','سەلاحەدین','صلاح الدين','Salah al-Din'],['babil','بابل','بابل','Babil'],
 ['karbala','کەربەلا','كربلاء','Karbala'],['najaf','نەجەف','النجف','Najaf'],
 ['wasit','واست','واسط','Wasit'],['qadisiyyah','قادسیە','القادسية','Al-Qadisiyyah'],
 ['dhiqar','زیقار','ذي قار','Dhi Qar'],['maysan','مەیسان','ميسان','Maysan'],
 ['muthanna','موسەننا','المثنى','Al-Muthanna']
];
function regionLabel(region,lang){return region[lang==='ckb'?1:lang==='en'?3:2]}
function iraqiMobile(raw){
 if(typeof raw!=='string'||raw.length>40)return '';
 const n=raw.trim().replace(/[٠-٩]/g,c=>c.charCodeAt(0)-1632).replace(/[۰-۹]/g,c=>c.charCodeAt(0)-1776).replace(/[ ()-]/g,'');
 return /^(?:07\d{9}|\+9647\d{9})$/.test(n)?n:''
}
function validCity(value){return typeof value==='string'&&value.trim().length<=80&&(value.match(/\p{L}/gu)||[]).length>=2&&/^[\p{L}\p{M}\p{N} '\u2019\u200c\u200d.-]+$/u.test(value.trim())}
