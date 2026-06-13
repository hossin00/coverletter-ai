import { useState } from 'react';
import { FileText, Sparkles, Loader, Download, Trash2, Plus, Copy, Check } from 'lucide-react';
import { ai } from './utils/ai';

interface Letter { id:string; jobTitle:string; company:string; content:string; createdAt:number; }
const SAVE='cl_letters_v1';
const load=():Letter[]=>{try{return JSON.parse(localStorage.getItem(SAVE)||'[]')}catch{return[]}};

export default function App() {
  const [letters,  setLetters]  = useState<Letter[]>(load);
  const [view,     setView]     = useState<'list'|'create'|'preview'>('list');
  const [current,  setCurrent]  = useState<Letter|null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [company,  setCompany]  = useState('');
  const [jobDesc,  setJobDesc]  = useState('');
  const [mySkills, setMySkills] = useState('');
  const [myName,   setMyName]   = useState('');
  const [loading,  setLoading]  = useState(false);
  const [copied,   setCopied]   = useState(false);

  const save = (items:Letter[]) => { setLetters(items); localStorage.setItem(SAVE, JSON.stringify(items)); };

  const generate = async () => {
    if (!jobTitle.trim() || !company.trim() || loading) return;
    setLoading(true);
    const prompt = `Write a professional cover letter for:
Job: ${jobTitle} at ${company}
${jobDesc ? 'Job Description: ' + jobDesc.slice(0,500) : ''}
${mySkills ? 'My skills: ' + mySkills.slice(0,300) : ''}
${myName ? 'My name: ' + myName : ''}

Write a compelling, personalized cover letter. 3 paragraphs. Professional but warm tone.`;
    const result = await ai(prompt, 'You write professional cover letters. Return only the letter text, no subject line or meta info. Start with Dear Hiring Manager or Dear [Company] Team.');
    if (result) {
      const letter: Letter = { id: crypto.randomUUID(), jobTitle: jobTitle.trim(), company: company.trim(), content: result, createdAt: Date.now() };
      save([letter, ...letters]);
      setCurrent(letter);
      setView('preview');
    }
    setLoading(false);
  };

  const exportLetter = (letter: Letter) => {
    const text = `Cover Letter — ${letter.jobTitle} at ${letter.company}

${letter.content}`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type:'text/plain' }));
    a.download = `cover-letter-${letter.company.toLowerCase().replace(/\s+/g,'-')}.txt`;
    a.click();
  };

  const inp = { width:'100%', background:'#0c0c1a', border:'1px solid #1e1b4b', borderRadius:'10px', padding:'11px 14px', color:'white', fontSize:'14px', outline:'none', fontFamily:'Inter', transition:'border-color 0.2s' };

  if (view === 'preview' && current) return (
    <div style={{minHeight:'100vh',background:'#080810',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'14px 20px',borderBottom:'1px solid #1e1b4b',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <button onClick={()=>setView('list')} style={{color:'#a5b4fc',background:'none',border:'none',cursor:'pointer',fontSize:'14px',fontFamily:'Inter'}}>← Back</button>
        <span style={{color:'white',fontSize:'14px',fontWeight:'600'}}>{current.jobTitle} @ {current.company}</span>
        <div style={{display:'flex',gap:'6px'}}>
          <button onClick={()=>{navigator.clipboard.writeText(current.content);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
            style={{display:'flex',alignItems:'center',gap:'5px',padding:'7px 12px',borderRadius:'8px',background:copied?'#10b98120':'#6366f115',border:`1px solid ${copied?'#10b981':'#6366f130'}`,color:copied?'#34d399':'#a5b4fc',fontSize:'12px',cursor:'pointer',fontFamily:'Inter'}}>
            {copied?<Check size={12}/>:<Copy size={12}/>}{copied?'Copied':'Copy'}
          </button>
          <button onClick={()=>exportLetter(current)} style={{padding:'7px',borderRadius:'7px',background:'none',border:'none',cursor:'pointer',color:'#312e81'}}><Download size={15}/></button>
        </div>
      </div>
      <div style={{flex:1,overflow:'auto',padding:'24px 20px'}}>
        <div style={{maxWidth:'640px',margin:'0 auto',background:'white',borderRadius:'12px',padding:'40px',boxShadow:'0 20px 60px #6366f115',border:'1px solid #1e1b4b'}}>
          <div style={{marginBottom:'24px',paddingBottom:'16px',borderBottom:'2px solid #6366f1'}}>
            <div style={{fontSize:'13px',color:'#6366f1',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.1em'}}>Cover Letter</div>
            <div style={{fontSize:'18px',fontWeight:'700',color:'#1a1a2e',marginTop:'4px'}}>{current.jobTitle}</div>
            <div style={{fontSize:'14px',color:'#6366f1'}}>{current.company}</div>
          </div>
          <div style={{fontSize:'14px',color:'#374151',lineHeight:'1.8',whiteSpace:'pre-wrap'}}>{current.content}</div>
        </div>
      </div>
    </div>
  );

  if (view === 'create') return (
    <div style={{minHeight:'100vh',background:'#080810',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'14px 20px',borderBottom:'1px solid #1e1b4b',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <button onClick={()=>setView('list')} style={{color:'#a5b4fc',background:'none',border:'none',cursor:'pointer',fontSize:'14px',fontFamily:'Inter'}}>← Back</button>
        <span style={{color:'white',fontSize:'14px',fontWeight:'600'}}>New Cover Letter</span>
        <div/>
      </div>
      <div style={{flex:1,overflow:'auto',padding:'20px'}}>
        <div style={{maxWidth:'600px',margin:'0 auto',display:'flex',flexDirection:'column',gap:'12px'}}>
          <div style={{background:'#6366f110',border:'1px solid #6366f125',borderRadius:'12px',padding:'14px',marginBottom:'4px'}}>
            <div style={{fontSize:'13px',color:'#a5b4fc',lineHeight:'1.6'}}>✨ Fill in the details below and AI will write a tailored cover letter in seconds.</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <input value={jobTitle} onChange={e=>setJobTitle(e.target.value)} placeholder="Job title *" style={inp}
              onFocus={e=>e.target.style.borderColor='#6366f1'} onBlur={e=>e.target.style.borderColor='#1e1b4b'}/>
            <input value={company} onChange={e=>setCompany(e.target.value)} placeholder="Company *" style={inp}
              onFocus={e=>e.target.style.borderColor='#6366f1'} onBlur={e=>e.target.style.borderColor='#1e1b4b'}/>
          </div>
          <input value={myName} onChange={e=>setMyName(e.target.value)} placeholder="Your name (optional)" style={inp}
            onFocus={e=>e.target.style.borderColor='#6366f1'} onBlur={e=>e.target.style.borderColor='#1e1b4b'}/>
          <textarea value={mySkills} onChange={e=>setMySkills(e.target.value)} placeholder="Your key skills and experience (optional but recommended)..." rows={3}
            style={{...inp,resize:'none',lineHeight:'1.6'}}
            onFocus={e=>e.target.style.borderColor='#6366f1'} onBlur={e=>e.target.style.borderColor='#1e1b4b'}/>
          <textarea value={jobDesc} onChange={e=>setJobDesc(e.target.value)} placeholder="Paste the job description (optional but helps AI tailor the letter)..." rows={4}
            style={{...inp,resize:'none',lineHeight:'1.6'}}
            onFocus={e=>e.target.style.borderColor='#6366f1'} onBlur={e=>e.target.style.borderColor='#1e1b4b'}/>
          <button onClick={generate} disabled={!jobTitle.trim()||!company.trim()||loading}
            style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',padding:'16px',borderRadius:'12px',background:!jobTitle.trim()||!company.trim()||loading?'#1e1b4b':'#6366f1',border:'none',color:'white',fontSize:'15px',fontWeight:'700',cursor:!jobTitle.trim()||!company.trim()||loading?'not-allowed':'pointer',fontFamily:'Inter',boxShadow:!jobTitle.trim()||!company.trim()||loading?'none':'0 8px 24px #6366f140',opacity:!jobTitle.trim()||!company.trim()?0.5:1}}>
            {loading?<><Loader size={18} style={{animation:'spin 1s linear infinite'}}/>Generating...</>:<><Sparkles size={18}/>Generate Cover Letter</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'#080810',display:'flex',flexDirection:'column'}}>
      <header style={{padding:'16px 20px',borderBottom:'1px solid #1e1b4b',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'linear-gradient(135deg,#6366f1,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 14px #6366f130'}}><FileText size={16} color="white"/></div>
          <div><div style={{fontWeight:'700',fontSize:'16px',color:'white',lineHeight:1}}>CoverLetter AI</div>
          <div style={{fontSize:'11px',color:'#312e81',marginTop:'2px'}}>{letters.length} letter{letters.length!==1?'s':''} generated</div></div>
        </div>
        <button onClick={()=>{setJobTitle('');setCompany('');setJobDesc('');setMySkills('');setMyName('');setView('create');}}
          style={{display:'flex',alignItems:'center',gap:'5px',padding:'8px 14px',borderRadius:'9px',background:'#6366f1',border:'none',color:'white',fontSize:'13px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter',boxShadow:'0 4px 12px #6366f130'}}>
          <Plus size={13}/> New Letter
        </button>
      </header>
      <div style={{flex:1,overflow:'auto',padding:'16px 20px'}}>
        {letters.length===0?(
          <div style={{textAlign:'center',padding:'60px 20px'}}>
            <div style={{fontSize:'52px',marginBottom:'16px'}}>✉️</div>
            <h3 style={{fontSize:'20px',fontWeight:'700',color:'white',marginBottom:'8px'}}>Land more interviews</h3>
            <p style={{color:'#312e81',fontSize:'14px',marginBottom:'24px',lineHeight:'1.6',maxWidth:'240px',margin:'0 auto 24px'}}>AI writes tailored cover letters for any job in seconds.</p>
            <button onClick={()=>setView('create')} style={{padding:'12px 24px',borderRadius:'10px',background:'#6366f1',border:'none',color:'white',fontSize:'14px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter',boxShadow:'0 4px 16px #6366f130'}}>Generate first letter</button>
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
            {letters.map(l=>(
              <div key={l.id} style={{background:'#0c0c1a',border:'1px solid #1e1b4b',borderRadius:'12px',padding:'14px',cursor:'pointer',transition:'all 0.2s'}}
                onClick={()=>{setCurrent(l);setView('preview');}}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#6366f130'} onMouseLeave={e=>e.currentTarget.style.borderColor='#1e1b4b'}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'10px'}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{color:'white',fontSize:'14px',fontWeight:'500',marginBottom:'2px'}}>{l.jobTitle}</div>
                    <div style={{color:'#6366f1',fontSize:'12px',marginBottom:'6px'}}>{l.company}</div>
                    <div style={{color:'#312e81',fontSize:'12px',lineHeight:'1.5',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{l.content}</div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();save(letters.filter(x=>x.id!==l.id));}} style={{padding:'5px',background:'none',border:'none',cursor:'pointer',color:'#312e81',flexShrink:0}}><Trash2 size={13}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
