import React from 'react'

function ReportSlt(props) {
  return (
    <div className='report__abuse'>
        <h1> {props.header} </h1>
        <div className='abuse__options' onChange={props.onChange}>
          {props.report.map((abuse) => {
            return (
              <label className='option'>
                <input type="radio" value={abuse.value} name="report" className='report__input'/> <p>{abuse.desc}</p>
              </label>
            )
          })}
        </div>
      </div>
  )
}

export default ReportSlt
