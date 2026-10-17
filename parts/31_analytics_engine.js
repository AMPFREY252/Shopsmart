/* Analytics engine part 1: state + date ranges (real localStorage data only) */
function anDefaults(){return{preset:'30d',from:'',to:'',cat:'All',pay:'All',tab:'overview',chart:'bar',q:'',sort:'revenue_desc',page:1};}
function anState(){if(!S.an)S.an=anDefaults();return S.an;}
function anTodayKey(){return dayKey(new Date());}
function anParseDay(k){const p=String(k).split('-');return new Date(Number(p[0]),Number(p[1])-1,Number(p[2]));}
function anAddDays(k,n){const d=anParseDay(k);d.setDate(d.getDate()+n);return dayKey(d);}
function anMonthStart(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-01';}
function anQuarterStart(d){const q=Math.floor(d.getMonth()/3)*3;return d.getFullYear()+'-'+String(q+1).padStart(2,'0')+'-01';}
function anRange(){
const a=anState();const today=anTodayKey();const now=new Date();
let from='',to=today,label='';
if(a.preset==='today'){from=today;label='Today';}
else if(a.preset==='7d'){from=anAddDays(today,-6);label='Last 7 days';}
else if(a.preset==='30d'){from=anAddDays(today,-29);label='Last 30 days';}
else if(a.preset==='month'){from=anMonthStart(now);label='This month';}
else if(a.preset==='lastmonth'){const lm=new Date(now.getFullYear(),now.getMonth()-1,1);from=anMonthStart(lm);const end=new Date(now.getFullYear(),now.getMonth(),0);to=dayKey(end);label='Last month';}
else if(a.preset==='quarter'){from=anQuarterStart(now);label='This quarter';}
else if(a.preset==='year'){from=now.getFullYear()+'-01-01';label='This year';}
else if(a.preset==='all'){from='';to='';label='All time';}
else if(a.preset==='custom'){from=a.from||anAddDays(today,-29);to=a.to||today;if(to<from){const t=from;from=to;to=t;}label=fmtDate(from)+' - '+fmtDate(to);}
return{from:from,to:to,label:label};
}
