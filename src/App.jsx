
import React, { useEffect, useRef, useState } from 'react'

const SIZES = { min:8, max:64 }

const sleep = ms => new Promise(r => setTimeout(r, ms))

export default function App(){
  const [arr, setArr] = useState([])
  const [size, setSize] = useState(20)
  const [speed, setSpeed] = useState(120)
  const [running, setRunning] = useState(false)
  const [algo, setAlgo] = useState('Bubble Sort')
  const [inputVal, setInputVal] = useState('')
  const [comparing, setComparing] = useState([]) // indices being compared
  const [swapping, setSwapping] = useState([]) // indices being swapped
  const [sortedIndices, setSortedIndices] = useState([])
  const containerRef = useRef(null)

  useEffect(()=>{ generateArray() }, [])

  function generateArray(){
    if(running) return
    const n = Math.max(5, Math.min(60, Number(size) || 20))
    const a = Array.from({length:n}, ()=> Math.floor(Math.random()*90)+10)
    setArr(a); setSortedIndices([]); setComparing([]); setSwapping([])
  }

  function useArrayInput(){
    if(running) return
    if(!inputVal) return
    const parts = inputVal.split(',').map(x=> parseInt(x.trim(),10)).filter(x=> !Number.isNaN(x))
    if(parts.length>0){ setArr(parts); setSize(parts.length); setSortedIndices([]); setComparing([]); setSwapping([]) }
  }

  // helper to update arr with small delay for animation
  async function doSwap(a,i,j){
    setSwapping([i,j]); await sleep(speed/2)
    const tmp = a[i]; a[i]=a[j]; a[j]=tmp
    setArr([...a]); await sleep(speed/2)
    setSwapping([])
  }

  // bubble
  async function bubbleSort(){
    setRunning(true); const a = [...arr]; const n=a.length
    for(let i=0;i<n;i++){
      for(let j=0;j<n-1-i;j++){
        setComparing([j,j+1]); await sleep(speed/3)
        if(a[j] > a[j+1]){ await doSwap(a,j,j+1) }
        setComparing([])
      }
      setSortedIndices(prev=> [...prev, n-1-i])
    }
    setRunning(false)
  }

  // selection
  async function selectionSort(){
    setRunning(true); const a=[...arr]; const n=a.length
    for(let i=0;i<n;i++){
      let min=i
      for(let j=i+1;j<n;j++){
        setComparing([min,j]); await sleep(speed/3)
        if(a[j] < a[min]) min=j
        setComparing([])
      }
      if(min!==i){ await doSwap(a,i,min) }
      setSortedIndices(prev=> [...prev, i])
    }
    setRunning(false)
  }

  // insertion
  async function insertionSort(){
    setRunning(true); const a=[...arr]; const n=a.length
    for(let i=1;i<n;i++){
      let key=a[i], j=i-1
      while(j>=0 && a[j] > key){
        setComparing([j,j+1]); await sleep(speed/3)
        a[j+1]=a[j]; setArr([...a]); j--
        await sleep(speed/3)
        setComparing([])
      }
      a[j+1]=key; setArr([...a]); await sleep(speed/2)
    }
    setSortedIndices(Array.from({length:arr.length}, (_,i)=>i))
    setRunning(false)
  }

  // merge sort
  async function mergeSort(){
    setRunning(true); const a=[...arr]
    await mergeSortRec(a,0,a.length-1)
    setSortedIndices(Array.from({length:arr.length}, (_,i)=>i))
    setRunning(false)
  }
  async function mergeSortRec(a,l,r){
    if(l>=r) return
    const m = Math.floor((l+r)/2)
    await mergeSortRec(a,l,m); await mergeSortRec(a,m+1,r)
    let i=l,j=m+1,temp=[]
    while(i<=m && j<=r){
      setComparing([i,j]); await sleep(speed/4)
      if(a[i] <= a[j]) temp.push(a[i++])
      else temp.push(a[j++])
      setComparing([])
    }
    while(i<=m) temp.push(a[i++])
    while(j<=r) temp.push(a[j++])
    for(let k=0;k<temp.length;k++){ a[l+k]=temp[k]; setArr([...a]); await sleep(speed/3) }
  }

  // quick sort
  async function quickSort(){
    setRunning(true); const a=[...arr]; await quickRec(a,0,a.length-1); setSortedIndices(Array.from({length:arr.length}, (_,i)=>i)); setRunning(false)
  }
  async function quickRec(a,low,high){
    if(low<high){
      const p = await partition(a,low,high)
      await quickRec(a,low,p-1); await quickRec(a,p+1,high)
    }
  }
  async function partition(a,low,high){
    let pivot = a[high]; let i=low-1
    for(let j=low;j<high;j++){
      setComparing([j,high]); await sleep(speed/3)
      if(a[j] < pivot){ i++; await doSwap(a,i,j) }
      setComparing([])
    }
    await doSwap(a,i+1,high); return i+1
  }

  // heap sort
  async function heapSort(){
    setRunning(true); const a=[...arr]; const n=a.length
    const heapify = async (n,i)=>{
      let largest=i, l=2*i+1, r=2*i+2
      if(l<n && a[l] > a[largest]) largest=l
      if(r<n && a[r] > a[largest]) largest=r
      if(largest!==i){ await doSwap(a,i,largest); await heapify(n,largest) }
    }
    for(let i=Math.floor(n/2)-1;i>=0;i--) await heapify(n,i)
    for(let i=n-1;i>0;i--){ await doSwap(a,0,i); await heapify(i,0) }
    setSortedIndices(Array.from({length:arr.length}, (_,i)=>i))
    setRunning(false)
  }

  async function startSort(){
    if(running) return
    setSortedIndices([])
    if(algo==='Bubble Sort') await bubbleSort()
    else if(algo==='Selection Sort') await selectionSort()
    else if(algo==='Insertion Sort') await insertionSort()
    else if(algo==='Merge Sort') await mergeSort()
    else if(algo==='Quick Sort') await quickSort()
    else if(algo==='Heap Sort') await heapSort()
  }

  // render logic for bar label inside vs above
  function renderLabel(val, h){
    if(h > 40) return <div style={{color:'#0b1220', fontSize:12, fontWeight:700}}>{val}</div>
    return <div style={{position:'absolute', top:-18, fontSize:12}}>{val}</div>
  }

  return (
    <div className="container" ref={containerRef}>
      <header>
        <div className="title">Sorting Visualizer — Dark Theme</div>
      </header>

      <div className="controls">
        <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
          <label style={{color:'#9fb0c8'}}>Size</label>
          <input type="range" min={SIZES.min} max={SIZES.max} value={size} onChange={e=>setSize(Number(e.target.value))} disabled={running} />
          <span style={{minWidth:34, textAlign:'center'}}>{size}</span>

          <label style={{color:'#9fb0c8'}}>Speed</label>
          <input type="range" min={20} max={800} value={speed} onChange={e=>setSpeed(Number(e.target.value))} disabled={running} />
          <span style={{minWidth:46, textAlign:'center'}}>{speed} ms</span>

          <select value={algo} onChange={e=>setAlgo(e.target.value)} disabled={running}>
            <option>Bubble Sort</option>
            <option>Selection Sort</option>
            <option>Insertion Sort</option>
            <option>Merge Sort</option>
            <option>Quick Sort</option>
            <option>Heap Sort</option>
          </select>

          <button onClick={generateArray} disabled={running}>Generate Array</button>
          <input type="text" placeholder="e.g. 5,3,8,1" value={inputVal} onChange={e=>setInputVal(e.target.value)} style={{width:220}} disabled={running} />
          <button onClick={useArrayInput} disabled={running}>Use Array</button>

          <button onClick={startSort} disabled={running} style={{background:'#2b6cb0', color:'#fff'}}>Start Sorting</button>
          <button onClick={()=>{ setRunning(false); setComparing([]); setSwapping([]); setSortedIndices([]); generateArray(); }} disabled={running===false}>Reset</button>
        </div>
      </div>

      <div className="mainPanel">
        <div className="arrayArea">
          {arr.map((val, idx)=>{
            const height = Math.max(4, Math.floor(val*3))
            const isComparing = comparing.includes(idx)
            const isSwapping = swapping.includes(idx)
            const isSorted = sortedIndices.includes(idx)
            const bg = isSwapping ? 'var(--swap)' : isComparing ? 'var(--compare)' : isSorted ? 'var(--sorted)' : 'var(--accent)'
            return (
              <div
    key={idx}
    className="bar"
    style={{
      height: `${height}px`,
      background: bg,
      width: "24px",
      margin: "0 3px",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      position: "relative",
      borderRadius: "4px",
      transition: "all 0.3s ease",
    }}
  >
    {renderLabel(val, height)}
  </div>
            )
          })}
        </div>

        <div className="legend">
          <div className="legendItem"><div className="legendSwatch" style={{background:'var(--accent)'}}></div><div>Unsorted</div></div>
          <div className="legendItem"><div className="legendSwatch" style={{background:'var(--compare)'}}></div><div>Comparing</div></div>
          <div className="legendItem"><div className="legendSwatch" style={{background:'var(--swap)'}}></div><div>Swapping</div></div>
          <div className="legendItem"><div className="legendSwatch" style={{background:'var(--sorted)'}}></div><div>Sorted</div></div>
        </div>
      </div>
    </div>
  )
}
