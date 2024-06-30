import React, { useContext } from 'react'
import ReportSlt from './ReportSlt';
import AuthContext from '../../navbar-sidebar/Authcontext';

const abuse = [
  {
    value: "Cursing",
    desc: "Cursing / Trolling"
  },
  {
    value: "Racism",
    desc: "Racism"
  },
  {
    value: "Violence",
    desc: "Violence / Threats"
  },
  {
    value: "Sexual",
    desc: "Sexual Harassment"
  }]
const play = [
  {
    value: "Cheating",
    desc: "Cheating"
  },
  {
    value: "Quitting",
    desc: "Stalling / Quitting Games"
  }]
const other = [
  {
    value: "Username",
    desc: "Username"
  },
  {
    value: "Spamming",
    desc: "Spamming"
  }
]


function ReportOptions() {
  
  // const {reportValue} = useContext(AuthContext);
  const {setReportValue} = useContext(AuthContext);
  
  const onChangeValue = (event) => {
    // console.log(event.target.value);
    setReportValue(event.target.value);
  }

  return (
    <div className='report__options'>
      <ReportSlt header="ABUSE" report={abuse} onChange={onChangeValue}/>
      <ReportSlt header="FAIR PLAY" report={play} onChange={onChangeValue}/>
      <ReportSlt header="OTHER" report={other} onChange={onChangeValue}/>
    </div>
  )
}

export default ReportOptions
