const DescriptionCard = ({title, text}) => {
	return (
		<div className='Description'>
			<h1>{title}</h1>
			<div>{text}</div>
		</div>
	)
}

export default DescriptionCard;