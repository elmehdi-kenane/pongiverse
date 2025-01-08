import { useContext, useEffect } from 'react';
import avatar from '../avatar.jpeg'
import nullplayer from './nullplayer.png'
import { useNavigate } from "react-router-dom";
import AuthContext from '../../navbar-sidebar/Authcontext';
const SvgVerticalComponent = ({ roundquartermembers, roundsemifinalmembers, roundfinalmembers, roundwinner }) => {
	////console.log("roundquartermembers", roundquartermembers)
	////console.log("roundsemifinalmembers", roundsemifinalmembers)
	////console.log("roundfinalmembers", roundfinalmembers)
	const {setIsGameStats} = useContext(AuthContext)
	////console.log("roundwinner", roundwinner)
	const navigate = useNavigate()
	const findMemberByPosition = (roundmembers, position) => {
		const member = roundmembers.find(member => member.position === position);
		if (member)
			return member
		else
			return null
	};


	const navigate_to_profile = (username) => {
		if (username !== 'anounymous' && username !== '') {
			setIsGameStats(false)
			navigate(`/mainpage/profile/${username}`)
		}
	}

	useEffect(() => {
		if (!roundquartermembers) {
			navigate("../game/createtournament")
		}
	}, [roundquartermembers])

	////console.log("winner lenght", roundwinner)
	return (


		<svg width="100%" viewBox="0 0 884 1293" style={{ minHeight: 334 }} fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M815.002 184.5H745.002C739.755 184.5 735.502 188.753 735.502 194V264C735.502 269.247 739.755 273.5 745.002 273.5H815.002C820.249 273.5 824.502 269.247 824.502 264V194C824.502 188.753 820.249 184.5 815.002 184.5Z" stroke="white" /> { /* QUARTERFINAL 4*/}
			{
				findMemberByPosition(roundquartermembers, 4) && (
					<foreignObject x="736.002" y="185" width="88" height="88" onClick={() => navigate_to_profile(findMemberByPosition(roundquartermembers, 4).name)}>
						<picture>
							<source srcSet={findMemberByPosition(roundquartermembers, 4).image} />
							<img src={findMemberByPosition(roundquartermembers, 4).image} alt="Description of the image" width="88" height="88" style={{ borderRadius: '10px' }} />
						</picture>
					</foreignObject>
				)
			}
			<path d="M815.002 1025.5H745.002C739.755 1025.5 735.502 1029.75 735.502 1035V1105C735.502 1110.25 739.755 1114.5 745.002 1114.5H815.002C820.249 1114.5 824.502 1110.25 824.502 1105V1035C824.502 1029.75 820.249 1025.5 815.002 1025.5Z" stroke="white" /> { /* QUARTERFINAL 8*/}
			{
				findMemberByPosition(roundquartermembers, 8) && (
					<foreignObject x="736.002" y="1026" width="88" height="88" onClick={() => navigate_to_profile(findMemberByPosition(roundquartermembers, 8).name)}>
						<picture>
							<source srcSet={findMemberByPosition(roundquartermembers, 8).image} />
							<img src={findMemberByPosition(roundquartermembers, 8).image} alt="Description of the image" width="88" height="88" style={{ borderRadius: '10px' }} />
						</picture>
					</foreignObject>
				)
			}
			<path d="M369.002 184.5H299.002C293.755 184.5 289.502 188.753 289.502 194V264C289.502 269.247 293.755 273.5 299.002 273.5H369.002C374.249 273.5 378.502 269.247 378.502 264V194C378.502 188.753 374.249 184.5 369.002 184.5Z" stroke="white" /> { /* QUARTERFINAL 2*/}
			{
				findMemberByPosition(roundquartermembers, 2) && (
					<foreignObject x="290" y="185" width="88" height="88" onClick={() => navigate_to_profile(findMemberByPosition(roundquartermembers, 2).name)}>
						<picture>
							<source srcSet={findMemberByPosition(roundquartermembers, 2).image} />
							<img src={findMemberByPosition(roundquartermembers, 2).image} alt="Description of the image" width="88" height="88" style={{ borderRadius: '10px' }} />
						</picture>
					</foreignObject>
				)
			}
			<path d="M368.002 1026.5H298.002C292.755 1026.5 288.502 1030.75 288.502 1036V1106C288.502 1111.25 292.755 1115.5 298.002 1115.5H368.002C373.249 1115.5 377.502 1111.25 377.502 1106V1036C377.502 1030.75 373.249 1026.5 368.002 1026.5Z" stroke="white" /> { /* QUARTERFINAL 6*/}
			{
				findMemberByPosition(roundquartermembers, 6) && (
					<foreignObject x="289" y="1027" width="88" height="88" onClick={() => navigate_to_profile(findMemberByPosition(roundquartermembers, 6).name)}>
						<picture>
							<source srcSet={findMemberByPosition(roundquartermembers, 6).image} />
							<img src={findMemberByPosition(roundquartermembers, 6).image} alt="Description of the image" width="88" height="88" style={{ borderRadius: '10px' }} />
						</picture>
					</foreignObject>
				)
			}
			<path d="M588.002 184.5H518.002C512.755 184.5 508.502 188.753 508.502 194V264C508.502 269.247 512.755 273.5 518.002 273.5H588.002C593.249 273.5 597.502 269.247 597.502 264V194C597.502 188.753 593.249 184.5 588.002 184.5Z" stroke="white" /> { /* QUARTERFINAL 3*/}
			{
				findMemberByPosition(roundquartermembers, 3) && (
					<foreignObject x="509" y="185" width="88" height="88" onClick={() => navigate_to_profile(findMemberByPosition(roundquartermembers, 3).name)}>
						<picture>
							<source srcSet={findMemberByPosition(roundquartermembers, 3).image} />
							<img src={findMemberByPosition(roundquartermembers, 3).image} alt="Description of the image" width="88" height="88" style={{ borderRadius: '10px' }} />
						</picture>
					</foreignObject>
				)
			}
			<path d="M588.002 1025.5H518.002C512.755 1025.5 508.502 1029.75 508.502 1035V1105C508.502 1110.25 512.755 1114.5 518.002 1114.5H588.002C593.249 1114.5 597.502 1110.25 597.502 1105V1035C597.502 1029.75 593.249 1025.5 588.002 1025.5Z" stroke="white" /> { /* QUARTERFINAL 7*/}
			{
				findMemberByPosition(roundquartermembers, 7) && (
					<foreignObject x="509" y="1026" width="88" height="88" onClick={() => navigate_to_profile(findMemberByPosition(roundquartermembers, 7).name)}>
						<picture>
							<source srcSet={findMemberByPosition(roundquartermembers, 7).image} />
							<img src={findMemberByPosition(roundquartermembers, 7).image} alt="Description of the image" width="88" height="88" style={{ borderRadius: '10px' }} />
						</picture>
					</foreignObject>
				)
			}
			<path d="M141.002 184.5H71.002C65.7552 184.5 61.502 188.753 61.502 194V264C61.502 269.247 65.7552 273.5 71.002 273.5H141.002C146.249 273.5 150.502 269.247 150.502 264V194C150.502 188.753 146.249 184.5 141.002 184.5Z" stroke="white" /> { /* QUARTERFINAL 1*/}
			{
				findMemberByPosition(roundquartermembers, 1) && (
					<foreignObject x="62" y="185" width="88" height="88" onClick={() => navigate_to_profile(findMemberByPosition(roundquartermembers, 1).name)}>
						<picture>
							<source srcSet={findMemberByPosition(roundquartermembers, 1).image} />
							<img src={findMemberByPosition(roundquartermembers, 1).image} alt="Description of the image" width="88" height="88" style={{ borderRadius: '10px' }} />
						</picture>
					</foreignObject>
				)
			}
			<path d="M141.002 1026.5H71.002C65.7552 1026.5 61.502 1030.75 61.502 1036V1106C61.502 1111.25 65.7552 1115.5 71.002 1115.5H141.002C146.249 1115.5 150.502 1111.25 150.502 1106V1036C150.502 1030.75 146.249 1026.5 141.002 1026.5Z" stroke="white" /> { /* QUARTERFINAL 5*/}
			{
				findMemberByPosition(roundquartermembers, 5) && (
					<foreignObject x="62" y="1027" width="88" height="88" onClick={() => navigate_to_profile(findMemberByPosition(roundquartermembers, 5).name)}>
						<picture>
							<source srcSet={findMemberByPosition(roundquartermembers, 5).image} />
							<img src={findMemberByPosition(roundquartermembers, 5).image} alt="Description of the image" width="88" height="88" style={{ borderRadius: '10px' }} />
						</picture>
					</foreignObject>
				)
			}
			<path d="M353.002 852.5H283.002C277.755 852.5 273.502 856.753 273.502 862V932C273.502 937.247 277.755 941.5 283.002 941.5H353.002C358.249 941.5 362.502 937.247 362.502 932V862C362.502 856.753 358.249 852.5 353.002 852.5Z" stroke="white" /> { /* SEMIFINAL 3*/}
			{
				findMemberByPosition(roundsemifinalmembers, 3) && (
					<foreignObject x="274" y="853" width="88" height="88" onClick={() => navigate_to_profile(findMemberByPosition(roundsemifinalmembers, 3).name)}>
						<picture>
							<source srcSet={findMemberByPosition(roundsemifinalmembers, 3).id === -1 ? nullplayer : findMemberByPosition(roundsemifinalmembers, 3).image} />
							<img src={findMemberByPosition(roundsemifinalmembers, 3).id === -1 ? nullplayer : findMemberByPosition(roundsemifinalmembers, 3).image} alt="Description of the image" width="88" height="88" style={{ borderRadius: '10px' }} />
						</picture>
					</foreignObject>
				)
			}
			<path d="M353.002 357.5H283.002C277.755 357.5 273.502 361.753 273.502 367V437C273.502 442.247 277.755 446.5 283.002 446.5H353.002C358.249 446.5 362.502 442.247 362.502 437V367C362.502 361.753 358.249 357.5 353.002 357.5Z" stroke="white" /> { /* SEMIFINAL 1*/}
			{
				findMemberByPosition(roundsemifinalmembers, 1) && (
					<foreignObject x="274" y="358" width="88" height="88" onClick={() => navigate_to_profile(findMemberByPosition(roundsemifinalmembers, 1).name)}>
						<picture>
							<source srcSet={findMemberByPosition(roundsemifinalmembers, 1).id === -1 ? nullplayer : findMemberByPosition(roundsemifinalmembers, 1).image} />
							<img src={findMemberByPosition(roundsemifinalmembers, 1).id === -1 ? nullplayer : findMemberByPosition(roundsemifinalmembers, 1).image} alt="Description of the image" width="88" height="88" style={{ borderRadius: '10px' }} />
						</picture>
					</foreignObject>
				)
			}
			<path d="M474.002 675.5H404.002C398.755 675.5 394.502 679.753 394.502 685V755C394.502 760.247 398.755 764.5 404.002 764.5H474.002C479.249 764.5 483.502 760.247 483.502 755V685C483.502 679.753 479.249 675.5 474.002 675.5Z" stroke="white" /> { /* FINAL 2*/}
			{
				findMemberByPosition(roundfinalmembers, 2) && (
					<foreignObject x="395" y="676" width="88" height="88" onClick={() => navigate_to_profile(findMemberByPosition(roundfinalmembers, 2).name)}>
						<picture>
							<source srcSet={findMemberByPosition(roundfinalmembers, 2).id === -1 ? nullplayer : findMemberByPosition(roundfinalmembers, 2).image} />
							<img src={findMemberByPosition(roundfinalmembers, 2).id === -1 ? nullplayer : findMemberByPosition(roundfinalmembers, 2).image} alt="Description of the image" width="88" height="88" style={{ borderRadius: '10px' }} />
						</picture>
					</foreignObject>
				)
			}
			<path d="M474.002 534.5H404.002C398.755 534.5 394.502 538.753 394.502 544V614C394.502 619.247 398.755 623.5 404.002 623.5H474.002C479.249 623.5 483.502 619.247 483.502 614V544C483.502 538.753 479.249 534.5 474.002 534.5Z" stroke="white" /> { /* FINAL 1*/}
			{
				findMemberByPosition(roundfinalmembers, 1) && (
					<foreignObject x="395" y="535" width="88" height="88" onClick={() => navigate_to_profile(findMemberByPosition(roundfinalmembers, 1).name)}>
						<picture>
							<source srcSet={findMemberByPosition(roundfinalmembers, 1).id === -1 ? nullplayer : findMemberByPosition(roundfinalmembers, 1).image} />
							<img src={findMemberByPosition(roundfinalmembers, 1).id === -1 ? nullplayer : findMemberByPosition(roundfinalmembers, 1).image} alt="Description of the image" width="88" height="88" style={{ borderRadius: '10px' }} />
						</picture>
					</foreignObject>
				)
			}
			<path d="M601.002 852.5H531.002C525.755 852.5 521.502 856.753 521.502 862V932C521.502 937.247 525.755 941.5 531.002 941.5H601.002C606.249 941.5 610.502 937.247 610.502 932V862C610.502 856.753 606.249 852.5 601.002 852.5Z" stroke="white" /> { /* SEMIFINAL 4*/}
			{
				findMemberByPosition(roundsemifinalmembers, 4) && (
					<foreignObject x="522" y="853" width="88" height="88" onClick={() => navigate_to_profile(findMemberByPosition(roundsemifinalmembers, 4).name)}>
						<picture>
							<source srcSet={findMemberByPosition(roundsemifinalmembers, 4).id === -1 ? nullplayer : findMemberByPosition(roundsemifinalmembers, 4).image} />
							<img src={findMemberByPosition(roundsemifinalmembers, 4).id === -1 ? nullplayer : findMemberByPosition(roundsemifinalmembers, 4).image} alt="Description of the image" width="88" height="88" style={{ borderRadius: '10px' }} />
						</picture>
					</foreignObject>
				)
			}
			<path d="M601.002 357.5H531.002C525.755 357.5 521.502 361.753 521.502 367V437C521.502 442.247 525.755 446.5 531.002 446.5H601.002C606.249 446.5 610.502 442.247 610.502 437V367C610.502 361.753 606.249 357.5 601.002 357.5Z" stroke="white" /> { /* SEMIFINAL 2*/}
			{
				findMemberByPosition(roundsemifinalmembers, 2) && (
					<foreignObject x="522" y="358" width="88" height="88" onClick={() => navigate_to_profile(findMemberByPosition(roundsemifinalmembers, 2).name)}>
						<picture>
							<source srcSet={findMemberByPosition(roundsemifinalmembers, 2).id === -1 ? nullplayer : findMemberByPosition(roundsemifinalmembers, 2).image} />
							<img src={findMemberByPosition(roundsemifinalmembers, 2).id === -1 ? nullplayer : findMemberByPosition(roundsemifinalmembers, 2).image} alt="Description of the image" width="88" height="88" style={{ borderRadius: '10px' }} />
						</picture>
					</foreignObject>
				)
			}
			<path d="M665.551 308.769V282.844" stroke="white" />
			<path d="M565.857 357.003L565.502 308.008" stroke="white" />
			<path d="M565.002 308.5H666.002" stroke="white" />
			<path d="M553.109 281.849V273.516" stroke="white" />
			<path d="M779.027 281.849V273.516" stroke="white" />
			<path d="M779.529 282.348H552.684" stroke="white" />
			<path d="M219.449 307.77L219.449 281.844" stroke="white" />
			<path d="M318.502 358V308" stroke="white" />
			<path d="M318.998 307.5H218.998" stroke="white" />
			<path d="M331.891 281.848L331.891 273.515" stroke="white" />
			<path d="M105.973 281.848L105.973 273.515" stroke="white" />
			<path d="M105.473 281.348H332.318" stroke="white" />
			<path d="M665.551 989.887L665.551 1015.81" stroke="white" />
			<path d="M566.502 942.004L566.148 990.816" stroke="white" />
			<path d="M566.002 990.156H666.002" stroke="white" />
			<path d="M553.109 1016.81L553.109 1025.14" stroke="white" />
			<path d="M779.027 1016.81L779.027 1025.14" stroke="white" />
			<path d="M779.527 1016.31H552.682" stroke="white" />
			<path d="M219.502 991V1017" stroke="white" />
			<path d="M318.502 942V991" stroke="white" />
			<path d="M318.998 991.156H218.998" stroke="white" />
			<path d="M331.891 1017.81V1026.14" stroke="white" />
			<path d="M105.973 1017.81V1026.14" stroke="white" />
			<path d="M105.473 1017.31H332.393" stroke="white" />
			<path d="M565.148 471.726V446.727" stroke="white" />
			<path d="M318.859 472.652V446.727" stroke="white" />
			<path d="M565.649 472.227H318.434" stroke="white" />
			<path d="M565.945 827.527L565.945 852.419" stroke="white" />
			<path d="M439.502 764.996L439.828 827.524" stroke="white" />
			<path d="M439.502 471.996L439.828 534.524" stroke="white" />
			<path d="M318.707 826.445L318.707 852.419" stroke="white" />
			<path d="M566.445 827.027L318.039 827.027" stroke="white" />
			<path d="M707.716 694H788.288C790.892 694 793.002 698.52 793.002 704.1V722.927V752.775V773.898C793.002 779.478 790.892 784 788.288 784H707.716C705.112 784 703.002 779.478 703.002 773.898V752.775V722.927V704.1C703.002 698.52 705.112 694 707.716 694Z" stroke="#FFD700" strokeWidth="2" /> { /* WINNER 1*/}
			{
				roundwinner.id && (
					<foreignObject x="704" y="695" width="88" height="88" onClick={() => navigate_to_profile(roundwinner.name)}>
						<picture>
							<source srcSet={roundwinner.id === -1 ? nullplayer : roundwinner.image} />
							<img src={roundwinner.id === -1 ? nullplayer : roundwinner.image} alt="Description of the image" width="88" height="88" style={{ borderRadius: '10px' }} />
						</picture>
					</foreignObject>
				)
			}
			<path d="M704.8 523.699H679.126C679.126 523.699 673.722 603.954 734.302 603.954" stroke="#FFD700" strokeWidth="7" />
			<path d="M789.477 523.699H813.799C813.799 523.699 819.429 603.954 760.65 603.954" stroke="#FFD700" strokeWidth="7" />
			<path d="M722.141 660.133V654.783C722.141 651.84 724.167 649.433 726.869 649.433L736.103 646.758C740.607 633.382 741.508 625.624 740.832 614.655H738.58C735.878 614.655 733.851 612.248 733.851 609.038V600.745C708.853 587.904 703.674 540.821 703.674 513H791.503C791.503 541.089 786.323 588.172 761.326 600.745V609.038C761.326 612.248 759.074 614.655 756.596 614.655H754.795C754.119 625.624 754.795 633.649 759.299 646.758L770.785 649.433C773.262 649.433 775.514 651.84 775.514 654.783V660.133" stroke="#FFD700" strokeWidth="7" />
			<path d="M714.482 524.234C714.482 524.234 715.609 572.119 730.022 585.227" stroke="#FFD700" strokeWidth="7" />
			<path d="M766.731 660.133H780.469C782.946 660.133 789.251 673.509 789.251 673.509C789.251 676.452 787.225 678.859 784.972 678.859H712.682C710.205 678.859 708.402 676.452 708.402 673.509C708.402 673.509 714.709 660.133 717.186 660.133H730.923" stroke="#FFD700" strokeWidth="7" />
		</svg>




	);
}

export default SvgVerticalComponent