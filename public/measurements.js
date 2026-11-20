const measurementKeys=['length','height','width','capacity'];
const measurementLabels={
 ckb:['پێوانە و گنجایش (ئارەزوومەندانە)','درێژی','بەرزی','پانی','گنجایش','سم','لیتر'],
 ar:['القياسات والسعة (اختياري)','الطول','الارتفاع','العرض','السعة','سم','لتر'],
 en:['Dimensions and capacity (optional)','Length','Height','Width','Capacity','cm','L']
};
function measurementText(values,lang){
 const labels=measurementLabels[lang];
 return measurementKeys.flatMap((key,i)=>values?.[key]>0?[labels[i+1]+' '+values[key].toLocaleString(lang)+' '+labels[key==='capacity'?6:5]]:[]).join(' · ');
}
