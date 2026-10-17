/* Analytics splits + smart insights (computed, not AI) */
function anPaySplit(shopId){const sales=anFilteredSales(shopId),a=anState(),pmap=anProdMap(shopId),m={};sales.forEach(s=>{const sl=anSaleSlice(s,pmap,a.cat);if(!m[s.method])m[s.method]={method:s.method,rev:0,orders:0};m[s.method].rev+=sl.rev;m[s.method].orders+=1;});return Object.keys(m).map(k=>m[k]).sort((x,y)=>y.rev-x.rev);}
function anExpenseSplit(shopId){const m={};anFilteredExpenses(shopId).forEach(e=>{const k=e.cat||'Other';m[k]=(m[k]||0)+Number(e.amount||0);});return Object.keys(m).map(k=>({cat:k,amt:m[k]})).sort((x,y)=>y.amt-x.amt);}
function anInsights(shopId){const k=anKPIs(shopId),prods=anProductPerf(shopId),cats=anCategoryPerf(shopId),exps=anExpenseSplit(shopId),sh=shopById(shopId),lowLevel=sh?sh.lowStockLevel:10,out=[];
if(k.hasPrev&&(k.rev>0||k.prev.rev>0)){const up=k.rev>=k.prev.rev;out.push({tone:up?'good':'bad',title:(up?'Sales up ':'Sales down ')+Math.abs(k.revGrowth).toFixed(1)+'% vs previous period',detail:'Revenue '+ugx(k.rev)+' vs '+ugx(k.prev.rev)+' ('+k.orders+' vs '+k.prev.orders+' orders).',action:up?'Keep best-sellers stocked.':'Restock winners and review slow days.'});}
const sorted=prods.slice().sort((x,y)=>y.rev-x.rev);
if(sorted.length&&sorted[0].rev>0)out.push({tone:'good',title:'Top earner: '+sorted[0].name,detail:fmt(sorted[0].qty)+' units, '+ugx(sorted[0].rev)+' revenue, '+ugx(sorted[0].profit)+' profit.',action:'Never let it run out.'});
if(cats.length&&cats[0].rev>0){const share=k.rev?(cats[0].rev/k.rev)*100:0;out.push({tone:'info',title:cats[0].cat+' drives '+share.toFixed(0)+'% of revenue',detail:ugx(cats[0].rev)+' from '+fmt(cats[0].qty)+' units.',action:'Feature this category.'});}
prods.filter(p=>p.stock<=lowLevel&&p.qty>0).sort((x,y)=>y.qty-x.qty).slice(0,3).forEach(p=>{out.push({tone:'warn',title:'Restock soon: '+p.name,detail:'Only '+fmt(p.stock)+' left, sold '+fmt(p.qty)+' in period.',action:'Reorder now.'});});
prods.filter(p=>p.stock>lowLevel*2&&p.qty===0).slice(0,2).forEach(p=>{out.push({tone:'warn',title:'Possible dead stock: '+p.name,detail:fmt(p.stock)+' units, zero sales. Tied: '+ugx(p.stockVal)+'.',action:'Discount or bundle.'});});
if(exps.length)out.push({tone:'info',title:'Biggest expense: '+exps[0].cat,detail:ugx(exps[0].amt)+' of '+ugx(k.exp)+' total.',action:'Review '+exps[0].cat+' receipts.'});
prods.filter(p=>p.rev>0&&p.margin<0).slice(0,2).forEach(p=>{out.push({tone:'bad',title:'Losing money: '+p.name,detail:'Revenue '+ugx(p.rev)+' below cost '+ugx(p.cost)+'.',action:'Raise price or cut discount.'});});
if(!out.length)out.push({tone:'info',title:'Not enough data yet',detail:'Record sales to unlock insights.',action:'Go to Selling (POS).'});
return out.slice(0,8);}
