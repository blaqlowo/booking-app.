import {useEffect,useState} from 'react'

const CATS=['Doctors','Salons','Restaurants']
const CITIES=['Abuja','Lagos','Kaduna','Ibadan','Ife','Port Harcourt']
const TIMES=['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00']
const LIST=[
{id:1,c:'Doctors',name:'Dr. Amina Bello',sub:'Cardiology',city:'Abuja',price:25000,info:'MBBS, FWACP. 12 years of experience.'},
{id:2,c:'Doctors',name:'Dr. Tunde Okafor',sub:'Dermatology',city:'Lagos',price:20000,info:'MBBS, MWACP. 8 years of experience.'},
{id:3,c:'Doctors',name:'Dr. Zainab Musa',sub:'Pediatrics',city:'Kaduna',price:15000,info:'MBBS, FMCPaed. 10 years of experience.'},
{id:4,c:'Salons',name:'Glow Studio',sub:'Haircut and manicure',city:'Abuja',price:6000,info:'Open 9 to 6. Walk-ins welcome.'},
{id:5,c:'Salons',name:'Velvet Nails',sub:'Manicure and pedicure',city:'Lagos',price:8000,info:'Open 10 to 7.'},
{id:6,c:'Salons',name:'Crown Cuts',sub:'Barber',city:'Kaduna',price:3000,info:'Open 9 to 6.'},
{id:7,c:'Restaurants',name:'Mama Put Kitchen',sub:'Nigerian',city:'Abuja',price:7000,info:'Jollof, pounded yam with egusi, suya platter.'},
{id:8,c:'Restaurants',name:'Bella Roma',sub:'Italian',city:'Lagos',price:15000,info:'Wood-fired pizza and fresh pasta.'},
{id:9,c:'Restaurants',name:'Sakura House',sub:'Japanese',city:'Abuja',price:20000,info:'Sushi, ramen and teriyaki.'}]
const iso=(o=0)=>{const d=new Date();d.setDate(d.getDate()+o);return d.toISOString().slice(0,10)}
const naira=n=>'₦'+n.toLocaleString()
const load=()=>{try{return JSON.parse(localStorage.getItem('bookly'))||{users:{},me:null,bookings:[]}}catch{return {users:{},me:null,bookings:[]}}}
function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),2500)}

export default function App(){
  const [db,setDb]=useState(load)
  const [screen,setScreen]=useState('welcome')
  useEffect(()=>{localStorage.setItem('bookly',JSON.stringify(db))},[db])
  const user=db.me&&db.users[db.me]
  const save=fn=>setDb(d=>fn(structuredClone(d)))
  if(!user) return screen==='welcome'?<Welcome go={setScreen}/>:<Auth mode={screen} go={setScreen} db={db} save={save}/>
  if(!user.onboarded) return <Onboarding user={user} save={save}/>
  return <Home user={user} db={db} save={save}/>
}

function Welcome({go}){
  return <div className="wrap"><div className="hero">
    <h1>Book anything, in a few taps.</h1>
    <p>Doctors, salons and restaurants near you, with live availability.</p>
    <button className="btn" onClick={()=>go('signup')}>Create account</button>
    <button className="btn alt" onClick={()=>go('login')}>Sign in</button>
  </div></div>
}

function Auth({mode,go,db,save}){
  const [email,setEmail]=useState('');const [pw,setPw]=useState('');const [err,setErr]=useState('')
  const signup=mode==='signup'
  const submit=e=>{
    e.preventDefault();const k=email.trim().toLowerCase();const u=db.users[k]
    if(signup){if(u)return setErr('That email already has an account. Sign in instead.')
      save(d=>{d.users[k]={email:k,pw,onboarded:false,interests:[]};d.me=k;return d})}
    else{if(!u||u.pw!==pw)return setErr('Wrong email or password.')
      save(d=>{d.me=k;return d})}
  }
  return <div className="wrap">
    <button className="link" onClick={()=>go('welcome')}>Back</button>
    <h1>{signup?'Create your account':'Welcome back'}</h1>
    <form onSubmit={submit}>
      <input type="email" required placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
      <input type="password" required minLength={4} placeholder="Password" value={pw} onChange={e=>setPw(e.target.value)}/>
      {err&&<div className="err">{err}</div>}
      <button className="btn">{signup?'Create account':'Sign in'}</button>
    </form>
    <button className="link" onClick={()=>go(signup?'login':'signup')}>{signup?'I already have an account':'Create a new account'}</button>
  </div>
}

function Onboarding({user,save}){
  const [step,setStep]=useState(0)
  const [name,setName]=useState(user.name||'');const [city,setCity]=useState(user.city||'');const [ints,setInts]=useState(user.interests||[])
  const toggle=c=>setInts(i=>i.includes(c)?i.filter(x=>x!==c):[...i,c])
  const finish=()=>save(d=>{Object.assign(d.users[user.email],{name:name.trim(),city,interests:ints,onboarded:true});return d})
  const ok=[name.trim().length>1,!!city,ints.length>0][step]
  return <div className="wrap">
    <div className="bar"><i style={{width:((step+1)/3*100)+'%'}}/></div>
    {step===0&&<><h1>What should we call you?</h1><p className="mu">Your first name is fine.</p><input autoFocus placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/></>}
    {step===1&&<><h1>Where are you based?</h1><p className="mu">We show nearby places first.</p><select value={city} onChange={e=>setCity(e.target.value)}><option value="">Choose your city</option>{CITIES.map(c=><option key={c}>{c}</option>)}</select></>}
    {step===2&&<><h1>What do you book most?</h1><p className="mu">Pick one or more.</p><div className="chips">{CATS.map(c=><button key={c} className={'chip '+(ints.includes(c)?'on':'')} onClick={()=>toggle(c)}>{c}</button>)}</div></>}
    <button className="btn" disabled={!ok} onClick={()=>step<2?setStep(step+1):finish()}>{step<2?'Continue':'Finish'}</button>
    {step>0&&<button className="link" onClick={()=>setStep(step-1)}>Back</button>}
  </div>
}

function Home({user,db,save}){
  const [tab,setTab]=useState('explore');const [sel,setSel]=useState(null)
  return <div className="wrap">
    {sel?<Detail item={sel} db={db} user={user} save={save} back={()=>setSel(null)} done={()=>{setSel(null);setTab('bookings')}}/>:
    tab==='explore'?<Explore user={user} open={setSel}/>:
    tab==='bookings'?<Bookings db={db} user={user} save={save}/>:<Me user={user} save={save}/>}
    <div className="tabs"><div>
      {[['explore','Explore'],['bookings','My bookings'],['me','Profile']].map(([k,l])=><button key={k} className={tab===k&&!sel?'on':''} onClick={()=>{setSel(null);setTab(k)}}>{l}</button>)}
    </div></div>
  </div>
}

function Explore({user,open}){
  const [cat,setCat]=useState(user.interests[0]||CATS[0]);const [q,setQ]=useState('');const [near,setNear]=useState(true)
  const list=LIST.filter(r=>r.c===cat&&(!near||r.city===user.city)&&(r.name+' '+r.sub).toLowerCase().includes(q.toLowerCase()))
  return <>
    <h1>Hi {user.name.split(' ')[0]}</h1><p className="mu">What would you like to book?</p>
    <div className="chips">{CATS.map(c=><button key={c} className={'chip '+(cat===c?'on':'')} onClick={()=>setCat(c)}>{c}</button>)}</div>
    <input placeholder={'Search '+cat.toLowerCase()} value={q} onChange={e=>setQ(e.target.value)}/>
    <div className="chips"><button className={'chip '+(near?'on':'')} onClick={()=>setNear(!near)}>Near {user.city}</button></div>
    {list.map(r=><div key={r.id} className="card tap" onClick={()=>open(r)}><h2>{r.name}</h2><div className="mu">{r.sub}, {r.city}</div><div className="price">From {naira(r.price)}</div></div>)}
    {!list.length&&<p className="mu">Nothing matches. Turn off the city filter or try another search.</p>}
  </>
}

function Detail({item,db,user,save,back,done}){
  const [date,setDate]=useState(iso(1));const [slot,setSlot]=useState('');const [guests,setGuests]=useState(2)
  const taken=t=>db.bookings.some(b=>b.lid===item.id&&b.date===date&&b.slot===t&&b.status==='confirmed')||(item.id===1&&date===iso(1)&&t==='10:00')
  const confirm=()=>{
    if(taken(slot)){toast('That slot was just taken. Pick another.');return setSlot('')}
    save(d=>{d.bookings.push({id:Date.now(),email:user.email,lid:item.id,date,slot,guests:item.c==='Restaurants'?guests:1,status:'confirmed'});return d})
    toast('Booking confirmed');done()
  }
  return <>
    <button className="link" onClick={back}>Back</button>
    <div className="card"><h1 style={{fontSize:28}}>{item.name}</h1><div className="mu">{item.sub}, {item.city}</div><p>{item.info}</p><div className="price">From {naira(item.price)}</div></div>
    <div className="card"><h2>Pick a time</h2>
      <input type="date" min={iso(0)} value={date} onChange={e=>{setDate(e.target.value);setSlot('')}}/>
      {item.c==='Restaurants'&&<select value={guests} onChange={e=>setGuests(+e.target.value)}>{[1,2,3,4,5,6,8].map(n=><option key={n} value={n}>{n} {n===1?'guest':'guests'}</option>)}</select>}
      <div className="slots">{TIMES.map(t=><button key={t} disabled={taken(t)} className={'slot '+(slot===t?'on':'')} onClick={()=>setSlot(t)}>{t}</button>)}</div>
      <button className="btn" disabled={!slot} onClick={confirm}>Confirm booking</button>
    </div>
  </>
}

function Bookings({db,user,save}){
  const mine=db.bookings.filter(b=>b.email===user.email).sort((a,b)=>b.date.localeCompare(a.date))
  const cancel=id=>{save(d=>{d.bookings.find(b=>b.id===id).status='cancelled';return d});toast('Booking cancelled')}
  const today=iso(0)
  const groups=[['Upcoming',mine.filter(b=>b.status==='confirmed'&&b.date>=today)],['Past',mine.filter(b=>b.status==='confirmed'&&b.date<today)],['Cancelled',mine.filter(b=>b.status==='cancelled')]]
  return <><h1>My bookings</h1>
    {!mine.length&&<p className="mu">No bookings yet. Find something on Explore.</p>}
    {groups.map(([t,a])=>a.length>0&&<div key={t}><div className="mu" style={{margin:'14px 0 6px'}}>{t}</div>
      {a.map(b=>{const l=LIST.find(x=>x.id===b.lid);return <div key={b.id} className="card"><h2>{l.name}<span className={'badge '+(b.status==='confirmed'?'ok':'bad')}>{b.status}</span></h2>
        <div className="mu">{b.date} at {b.slot}{l.c==='Restaurants'?`, ${b.guests} guests`:''}</div>
        {t==='Upcoming'&&<button className="btn alt" onClick={()=>cancel(b.id)}>Cancel booking</button>}</div>})}</div>)}
  </>
}

function Me({user,save}){
  return <><h1>Profile</h1>
    <div className="card"><h2>{user.name}</h2><div className="mu">{user.city}</div><div className="chips" style={{marginBottom:0}}>{user.interests.map(i=><span key={i} className="chip on">{i}</span>)}</div></div>
    <button className="btn alt" onClick={()=>save(d=>{d.users[user.email].onboarded=false;return d})}>Update my answers</button>
    <button className="btn alt" onClick={()=>save(d=>{d.me=null;return d})}>Sign out</button>
  </>
}
