import React, { useState } from 'react'
import Split from 'react-split'
import ProblemDescription from './ProblemDescription/cProblemDescription'
import Playground from './Playground/cPlayground'
import Confetti from 'react-confetti'
import useWindowSize from '../../Hooks/useWindowSize'

export default function Workspace({problem}) {
  const { width, height } = useWindowSize();
  const [success, setSuccess] = useState(false);
  return (

    <Split className='split' minSize={0}>
      <ProblemDescription problem={problem}/>
      <div className="bg-dark-fill-2">
        <Playground problem={problem} setSuccess={setSuccess} />
        {success && <Confetti gravity={0.3} tweenDuration={4000} width={width - 1} height={height - 1} /> }
      </div>
    </Split>
  )
}
