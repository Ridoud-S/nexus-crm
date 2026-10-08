import { useEffect, useState } from 'react'
import Landing from './Landing'
import Dashboard from './Dashboard'
import { DemoData, demoData } from './lib/demo-data'
const STORE_KEY='nexus-crm-demo-v1'
function readDemo():DemoData{
  try{
    const raw=window.localStorage.getItem(STORE_KEY)
    if(!raw)return demoData()
    const data:unknown=JSON.parse(raw)
    if(data&&typeof data==='object'&&'leads' in data&&'reminders' in data&&Array.isArray(data.leads)&&Array.isArray(data.reminders))return data as DemoData
  }catch{ /* localStorage puede estar bloqueado */ }
  return demoData()
}
export default function App(){
  const [page,setPage]=useState<'landing'|'demo'>('landing')
  const [data,setData]=useState<DemoData>(readDemo)
  useEffect(()=>{try{window.localStorage.setItem(STORE_KEY,JSON.stringify(data))}catch{/* Sin persistencia en navegador privado */}},[data])
  const navigate=(p:'landing'|'demo')=>{setPage(p);window.scrollTo({top:0,behavior:'auto'})}
  return page==='landing'?<Landing onDemo={()=>navigate('demo')}/>:<Dashboard data={data} setData={setData} onBack={()=>navigate('landing')}/>
}
