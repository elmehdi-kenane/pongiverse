import React from 'react'

function ReportSlt(props) {
  return (
    <div className='report__slt'>
        <h1> {props.header} </h1>
        <div className='slt__options' onChange={props.onChange}>
          {props.report.map((abuse, key) => {
            return (
              <label className='option' key={key}>
                <input type="radio" value={abuse.value} className='report__input'/>
                <p>{abuse.desc}</p>
              </label>
            )
          })}
        </div>
      </div>
  )
}

export default ReportSlt
