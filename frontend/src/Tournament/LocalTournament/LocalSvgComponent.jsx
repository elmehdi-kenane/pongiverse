import { useContext, useEffect, useState } from 'react';
import avatar from '../avatar.svg'
import { useNavigate } from "react-router-dom";
import AuthContext from '../../navbar-sidebar/Authcontext';

const LocalSvgComponent = () => {
	const navigate = useNavigate()
	const { user } = useContext(AuthContext)
	const [players, setPlayers] = useState([])
	useEffect(() => {
		const storedPlayers = localStorage.getItem('Round16Players');
		if (storedPlayers) {
			setPlayers(JSON.parse(storedPlayers));
		}
	}, [user])
	return (
		<svg width="1538" viewBox="0 0 1538 958" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M1463.08 426H1457.61V791.328L1356.57 905.453H184.187L83.1459 791.328V593.365H77.6823V673.253L52 702.245V819.333L172.276 955.113H351.625L390.151 911.621H416.817L378.291 955.113H415.177L453.703 911.621H481.682L443.156 955.113H480.041L518.567 911.621H546.547L508.02 955.113H544.906L583.432 911.621H611.411L572.885 955.113H609.77L648.297 911.621H676.276L637.75 955.113H674.64L713.161 911.621H829.234L867.755 955.113H904.645L866.119 911.621H894.099L932.625 955.113H969.51L930.984 911.621H958.963L997.489 955.113H1034.38L995.849 911.621H1023.83L1062.36 955.113H1099.24L1060.72 911.621H1088.7L1127.22 955.113H1164.11L1125.58 911.621H1152.25L1190.77 955.113H1370.12L1490.4 819.333V702.245L1463.08 671.401V426Z" fill="#442D6A" />
			<mask id="mask0_2828_1224" styles="mask-type:luminance" maskUnits="userSpaceOnUse" x="51" y="21" width="602" height="524">
				<path d="M51 21H652.333V544.886H51V21Z" fill="white" />
			</mask>
			<g mask="url(#mask0_2828_1224)">
				<path d="M77.6823 544.192H83.1458V184.79L184.187 70.6598H651.687V64.492H598.406L559.88 21H172.276L52 156.78V273.868L77.6823 302.866V544.192Z" fill="#442D6A" />
			</g>
			<mask id="mask1_2828_1224" styles="mask-type:luminance" maskUnits="userSpaceOnUse" x="884" y="21" width="607" height="345">
				<path d="M884.333 21H1491V365.767H884.333V21Z" fill="white" />
			</mask>
			<g mask="url(#mask1_2828_1224)">
				<path d="M1369.92 20.7534H982.317L943.791 64.2454H885.265V70.4132H1356.37L1457.41 184.544V365.356H1462.87V304.466L1490.2 273.621V156.533L1369.92 20.7534Z" fill="#442D6A" />
			</g>
			<path d="M407.197 312.818L392.612 288.247H273.197V314.247V347.247V374.247H392.612L407.197 348.14V330.479V312.818Z" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M407.197 331.747H257.197" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M306.963 291H283.037C279.151 291 276 294.151 276 298.037V321.963C276 325.849 279.151 329 283.037 329H306.963C310.849 329 314 325.849 314 321.963V298.037C314 294.151 310.849 291 306.963 291Z" fill="#D9D9D9" fillOpacity="0.09" /> {/* player number 17 */}
			{/* <foreignObject x="274" y="291" width="40" height="40">
				<picture>
					<source srcSet={avatar} media="(max-width: 600px)" />
					<img src={avatar} alt="Description of the image" width="40" height="40" style={{ borderRadius: '5px' }} />
				</picture>
			</foreignObject> */}
			<path d="M306.963 334H283.037C279.151 334 276 337.151 276 341.037V364.963C276 368.849 279.151 372 283.037 372H306.963C310.849 372 314 368.849 314 364.963V341.037C314 337.151 310.849 334 306.963 334Z" fill="#D9D9D9" fillOpacity="0.09" />{/* player number 18 */}
			<path d="M563.197 418.675L548.83 399.247H431.197V419.805V445.898V467.247H548.83L563.197 446.604V432.64V418.675Z" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M473.197 414.247H445.197C442.435 414.247 440.197 416.486 440.197 419.247V447.247C440.197 450.008 442.435 452.247 445.197 452.247H473.197C475.958 452.247 478.197 450.008 478.197 447.247V419.247C478.197 416.486 475.958 414.247 473.197 414.247Z" fill="#D9D9D9" fillOpacity="0.09" />
			<path d="M563.197 520.675L548.83 501.247H431.197V521.805V547.898V569.247H548.83L563.197 548.604V534.64V520.675Z" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M440 521C440 518.238 442.239 516 445 516H473C475.762 516 478 518.238 478 521V549C478 551.761 475.762 554 473 554H445C442.239 554 440 551.761 440 549V521Z" fill="#D9D9D9" fillOpacity="0.09" />
			<path d="M762 475.39L747.523 462.247H629V476.154V493.805V508.247H747.523L762 494.283V484.836V475.39Z" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M666.963 466H643.037C639.151 466 636 469.151 636 473.037V496.963C636 500.849 639.151 504 643.037 504H666.963C670.849 504 674 500.849 674 496.963V473.037C674 469.151 670.849 466 666.963 466Z" fill="#D9D9D9" fillOpacity="0.09" />{/* player number 29 */}
			<path d="M739.963 343H716.037C712.151 343 709 346.151 709 350.037V373.963C709 377.849 712.151 381 716.037 381H739.963C743.849 381 747 377.849 747 373.963V350.037C747 346.151 743.849 343 739.963 343Z" fill="#D9D9D9" fillOpacity="0.09" />{/* player winner */}
			<path d="M407.197 616.818L392.612 592.247H273.197V618.247V651.247V678.247H392.612L407.197 652.14V634.479V616.818Z" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M407.197 635.747H257.197" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M306.963 595H283.037C279.151 595 276 598.151 276 602.037V625.963C276 629.849 279.151 633 283.037 633H306.963C310.849 633 314 629.849 314 625.963V602.037C314 598.151 310.849 595 306.963 595Z" fill="#D9D9D9" fillOpacity="0.09" /> {/* player number 19 */}
			<path d="M306.963 638H283.037C279.151 638 276 641.151 276 645.037V668.963C276 672.849 279.151 676 283.037 676H306.963C310.849 676 314 672.849 314 668.963V645.037C314 641.151 310.849 638 306.963 638Z" fill="#D9D9D9" fillOpacity="0.09" />  {/* player number 20 */}
			<path d="M249.197 388.818L234.612 364.247H115.197V390.247V423.247V450.247H234.612L249.197 424.14V406.479V388.818Z" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M249.197 407.747H115.197" stroke="#B9A9B8" />
			<path d="M148.963 367H125.037C121.151 367 118 370.151 118 374.037V397.963C118 401.849 121.151 405 125.037 405H148.963C152.849 405 156 401.849 156 397.963V374.037C156 370.151 152.849 367 148.963 367Z" fill="#D9D9D9" fillOpacity="0.09" /> {/* player number 3 */}
			<foreignObject x="118" y="366" width="40" height="40">
				<picture>
					<source srcSet={avatar} media="(max-width: 600px)" />
					<img src={avatar} alt="Description of the image" width="40" height="40" style={{ borderRadius: '5px' }} />
				</picture>
			</foreignObject>
			<text x="170" y="388" fontSize="14" fill="white" textAnchor="start" dominantBaseline="middle">
				{players[2]}
			</text>
			<path d="M148.963 410H125.037C121.151 410 118 413.151 118 417.037V440.963C118 444.849 121.151 448 125.037 448H148.963C152.849 448 156 444.849 156 440.963V417.037C156 413.151 152.849 410 148.963 410Z" fill="#D9D9D9" fillOpacity="0.09" /> {/* player number 4 */}
			<foreignObject x="118" y="409" width="40" height="40">
				<picture>
					<source srcSet={avatar} media="(max-width: 600px)" />
					<img src={avatar} alt="Description of the image" width="40" height="40" style={{ borderRadius: '5px' }} />
				</picture>
			</foreignObject>
			<text x="170" y="431" fontSize="14" fill="white" textAnchor="start" dominantBaseline="middle">
			{players[3]}
			</text>
			<path d="M249.197 407.747H115.197" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M249.197 540.818L234.612 516.247H115.197V542.247V575.247V602.247H234.612L249.197 576.14V558.479V540.818Z" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M249.197 559.747H115.197" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M148.963 519H125.037C121.151 519 118 522.151 118 526.037V549.963C118 553.849 121.151 557 125.037 557H148.963C152.849 557 156 553.849 156 549.963V526.037C156 522.151 152.849 519 148.963 519Z" fill="#D9D9D9" fillOpacity="0.09" />  {/* player number 5 */}
			<foreignObject x="118" y="518" width="40" height="40">
				<picture>
					<source srcSet={avatar} media="(max-width: 600px)" />
					<img src={avatar} alt="Description of the image" width="40" height="40" style={{ borderRadius: '5px' }} />
				</picture>
			</foreignObject>
			<text x="170" y="540" fontSize="14" fill="white" textAnchor="start" dominantBaseline="middle">
			{players[4]}
			</text>
			<path d="M148.963 562H125.037C121.151 562 118 565.151 118 569.037V592.963C118 596.849 121.151 600 125.037 600H148.963C152.849 600 156 596.849 156 592.963V569.037C156 565.151 152.849 562 148.963 562Z" fill="#D9D9D9" fillOpacity="0.09" /> {/* player number 6 */}
			<foreignObject x="118" y="561" width="40" height="40">
				<picture>
					<source srcSet={avatar} media="(max-width: 600px)" />
					<img src={avatar} alt="Description of the image" width="40" height="40" style={{ borderRadius: '5px' }} />
				</picture>
			</foreignObject>
			<text x="170" y="583" fontSize="14" fill="white" textAnchor="start" dominantBaseline="middle">
			{players[5]}
			</text>
			<path d="M249.197 692.818L234.612 668.247H115.197V694.247V727.247V754.247H234.612L249.197 728.14V710.479V692.818Z" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M249.197 711.747H115.197" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M148.963 671H125.037C121.151 671 118 674.151 118 678.037V701.963C118 705.849 121.151 709 125.037 709H148.963C152.849 709 156 705.849 156 701.963V678.037C156 674.151 152.849 671 148.963 671Z" fill="#D9D9D9" fillOpacity="0.09" />{/* player number 7 */}
			<foreignObject x="118" y="670" width="40" height="40">
				<picture>
					<source srcSet={avatar} media="(max-width: 600px)" />
					<img src={avatar} alt="Description of the image" width="40" height="40" style={{ borderRadius: '5px' }} />
				</picture>
			</foreignObject>
			<text x="170" y="692" fontSize="14" fill="white" textAnchor="start" dominantBaseline="middle">
			{players[6]}
			</text>
			<path d="M148.963 714H125.037C121.151 714 118 717.151 118 721.037V744.963C118 748.849 121.151 752 125.037 752H148.963C152.849 752 156 748.849 156 744.963V721.037C156 717.151 152.849 714 148.963 714Z" fill="#D9D9D9" fillOpacity="0.09" /> {/* player number 8 */}
			<foreignObject x="118" y="713" width="40" height="40">
				<picture>
					<source srcSet={avatar} media="(max-width: 600px)" />
					<img src={avatar} alt="Description of the image" width="40" height="40" style={{ borderRadius: '5px' }} />
				</picture>
			</foreignObject>
			<text x="170" y="735" fontSize="14" fill="white" textAnchor="start" dominantBaseline="middle">
			{players[7]}
			</text>
			<path d="M249.197 236.818L234.612 212.247H115.197V238.247V271.247V298.247H234.612L249.197 272.14V254.479V236.818Z" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M249.197 255.747H115.197" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M148.963 215H125.037C121.151 215 118 218.151 118 222.037V245.963C118 249.849 121.151 253 125.037 253H148.963C152.849 253 156 249.849 156 245.963V222.037C156 218.151 152.849 215 148.963 215Z" fill="#D9D9D9" fillOpacity="0.09" /> {/* player number 1 */}
			<foreignObject x="118" y="214" width="40" height="40">
				<picture>
					<source srcSet={avatar} media="(max-width: 600px)" />
					<img src={avatar} alt="Description of the image" width="40" height="40" style={{ borderRadius: '5px' }} />
				</picture>
			</foreignObject>
			<text x="170" y="236" fontSize="14" fill="white" textAnchor="start" dominantBaseline="middle">
			{players[0]}
			</text>
			<path d="M148.963 258H125.037C121.151 258 118 261.151 118 265.037V288.963C118 292.849 121.151 296 125.037 296H148.963C152.849 296 156 292.849 156 288.963V265.037C156 261.151 152.849 258 148.963 258Z" fill="#D9D9D9" fillOpacity="0.09" /> {/* player number 2 */}
			<foreignObject x="118" y="257" width="40" height="40">
				<picture>
					<source srcSet={avatar} media="(max-width: 600px)" />
					<img src={avatar} alt="Description of the image" width="40" height="40" style={{ borderRadius: '5px' }} />
				</picture>
			</foreignObject>
			<text x="170" y="279" fontSize="14" fill="white" textAnchor="start" dominantBaseline="middle">
			{players[1]}
			</text>
			<foreignObject x="118" y="257" width="40" height="40">
				<picture>
					<source srcSet={avatar} media="(max-width: 600px)" />
					<img src={avatar} alt="Description of the image" width="40" height="40" style={{ borderRadius: '5px' }} />
				</picture>
			</foreignObject>
			<path d="M256 255.5H249" stroke="#B9A9B8" />
			<path d="M257 559.5H250" stroke="#B9A9B8" />
			<path d="M257 407.5H249" stroke="#B9A9B8" />
			<path d="M258 711.5H250" stroke="#B9A9B8" />
			<path d="M256.5 255V407" stroke="#B9A9B8" />
			<path d="M586 432.5H563" stroke="#B9A9B8" />
			<path d="M629 485L586 485.5" stroke="#B9A9B8" />
			<path d="M587 535.5H563" stroke="#B9A9B8" />
			<path d="M586.5 432V535" stroke="#B9A9B8" />
			<path d="M415 331.5H408" stroke="#B9A9B8" />
			<path d="M415 635.5H407" stroke="#B9A9B8" />
			<path d="M430 432.5H415" stroke="#B9A9B8" />
			<path d="M431 535.5H416" stroke="#B9A9B8" />
			<path d="M415.5 331V433" stroke="#B9A9B8" />
			<path d="M415.5 535V636" stroke="#B9A9B8" />
			<path d="M257.5 559V711" stroke="#B9A9B8" />
			<path d="M1135 313.571L1149.59 289H1269V315V348V375H1149.59L1135 348.893V331.232V313.571Z" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M1135 332.5L1285 332.5" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M1259.96 292H1236.04C1232.15 292 1229 295.151 1229 299.037V322.963C1229 326.849 1232.15 330 1236.04 330H1259.96C1263.85 330 1267 326.849 1267 322.963V299.037C1267 295.151 1263.85 292 1259.96 292Z" fill="#D9D9D9" fillOpacity="0.09" />
			<path d="M1259.96 335H1236.04C1232.15 335 1229 338.151 1229 342.037V365.963C1229 369.849 1232.15 373 1236.04 373H1259.96C1263.85 373 1267 369.849 1267 365.963V342.037C1267 338.151 1263.85 335 1259.96 335Z" fill="#D9D9D9" fillOpacity="0.09" />
			<path d="M979 419.429L993.367 400H1111V420.558V446.651V468H993.367L979 447.357V433.393V419.429Z" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M1094.96 411H1071.04C1067.15 411 1064 414.151 1064 418.037V441.963C1064 445.849 1067.15 449 1071.04 449H1094.96C1098.85 449 1102 445.849 1102 441.963V418.037C1102 414.151 1098.85 411 1094.96 411Z" fill="#D9D9D9" fillOpacity="0.09" />
			<path d="M979 521.429L993.367 502H1111V522.558V548.651V570H993.367L979 549.357V535.393V521.429Z" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M1094.96 517H1071.04C1067.15 517 1064 520.151 1064 524.037V547.963C1064 551.849 1067.15 555 1071.04 555H1094.96C1098.85 555 1102 551.849 1102 547.963V524.037C1102 520.151 1098.85 517 1094.96 517Z" fill="#D9D9D9" fillOpacity="0.09" />
			<path d="M778 475.143L792.367 462H910V475.907V493.558V508H792.367L778 494.036V484.589V475.143Z" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M895.963 466H872.037C868.151 466 865 469.151 865 473.037V496.963C865 500.849 868.151 504 872.037 504H895.963C899.849 504 903 500.849 903 496.963V473.037C903 469.151 899.849 466 895.963 466Z" fill="#D9D9D9" fillOpacity="0.09" />
			<path d="M1135 617.571L1149.59 593H1269V619V652V679H1149.59L1135 652.893V635.232V617.571Z" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M1135 636.5L1285 636.5" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M1259.96 596H1236.04C1232.15 596 1229 599.151 1229 603.037V626.963C1229 630.849 1232.15 634 1236.04 634H1259.96C1263.85 634 1267 630.849 1267 626.963V603.037C1267 599.151 1263.85 596 1259.96 596Z" fill="#D9D9D9" fillOpacity="0.09" />
			<path d="M1259.96 639H1236.04C1232.15 639 1229 642.151 1229 646.037V669.963C1229 673.849 1232.15 677 1236.04 677H1259.96C1263.85 677 1267 673.849 1267 669.963V646.037C1267 642.151 1263.85 639 1259.96 639Z" fill="#D9D9D9" fillOpacity="0.09" />
			<path d="M1293 389.571L1307.59 365H1427V391V424V451H1307.59L1293 424.893V407.232V389.571Z" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M1293 408.5L1427 408.5" stroke="#B9A9B8" />
			<path d="M1417.96 368H1394.04C1390.15 368 1387 371.151 1387 375.037V398.963C1387 402.849 1390.15 406 1394.04 406H1417.96C1421.85 406 1425 402.849 1425 398.963V375.037C1425 371.151 1421.85 368 1417.96 368Z" fill="#D9D9D9" fillOpacity="0.09" /> {/* player number 11 */}
			<foreignObject x="1385" y="367" width="40" height="40">
				<picture>
					<source srcSet={avatar} media="(max-width: 600px)" />
					<img src={avatar} alt="Description of the image" width="40" height="40" style={{ borderRadius: '5px' }} />
				</picture>
			</foreignObject>
			<text x="1320" y="389" fontSize="14" fill="white" textAnchor="start" dominantBaseline="middle">
			{players[10]}
			</text>
			<path d="M1417.96 411H1394.04C1390.15 411 1387 414.151 1387 418.037V441.963C1387 445.849 1390.15 449 1394.04 449H1417.96C1421.85 449 1425 445.849 1425 441.963V418.037C1425 414.151 1421.85 411 1417.96 411Z" fill="#D9D9D9" fillOpacity="0.09" /> {/* player number 12 */}
			<foreignObject x="1385" y="410" width="40" height="40">
				<picture>
					<source srcSet={avatar} media="(max-width: 600px)" />
					<img src={avatar} alt="Description of the image" width="40" height="40" style={{ borderRadius: '5px' }} />
				</picture>
			</foreignObject>
			<text x="1320" y="432" fontSize="14" fill="white" textAnchor="start" dominantBaseline="middle">
			{players[11]}
			</text>
			<path d="M1293 408.5L1427 408.5" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M1293 541.571L1307.59 517H1427V543V576V603H1307.59L1293 576.893V559.232V541.571Z" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M1293 560.5L1427 560.5" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M1417.96 520H1394.04C1390.15 520 1387 523.151 1387 527.037V550.963C1387 554.849 1390.15 558 1394.04 558H1417.96C1421.85 558 1425 554.849 1425 550.963V527.037C1425 523.151 1421.85 520 1417.96 520Z" fill="#D9D9D9" fillOpacity="0.09" /> {/* player number 13 */}
			<foreignObject x="1385" y="519" width="40" height="40">
				<picture>
					<source srcSet={avatar} media="(max-width: 600px)" />
					<img src={avatar} alt="Description of the image" width="40" height="40" style={{ borderRadius: '5px' }} />
				</picture>
			</foreignObject>
			<text x="1320" y="541" fontSize="14" fill="white" textAnchor="start" dominantBaseline="middle">
			{players[12]}
			</text>
			<path d="M1417.96 563H1394.04C1390.15 563 1387 566.151 1387 570.037V593.963C1387 597.849 1390.15 601 1394.04 601H1417.96C1421.85 601 1425 597.849 1425 593.963V570.037C1425 566.151 1421.85 563 1417.96 563Z" fill="#D9D9D9" fillOpacity="0.09" /> {/* player number 14 */}
			<foreignObject x="1385" y="562" width="40" height="40">
				<picture>
					<source srcSet={avatar} media="(max-width: 600px)" />
					<img src={avatar} alt="Description of the image" width="40" height="40" style={{ borderRadius: '5px' }} />
				</picture>
			</foreignObject>
			<text x="1320" y="584" fontSize="14" fill="white" textAnchor="start" dominantBaseline="middle">
			{players[13]}
			</text>
			<path d="M1293 693.571L1307.59 669H1427V695V728V755H1307.59L1293 728.893V711.232V693.571Z" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M1293 712.5L1427 712.5" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M1417.96 672H1394.04C1390.15 672 1387 675.151 1387 679.037V702.963C1387 706.849 1390.15 710 1394.04 710H1417.96C1421.85 710 1425 706.849 1425 702.963V679.037C1425 675.151 1421.85 672 1417.96 672Z" fill="#D9D9D9" fillOpacity="0.09" /> {/* player number 15 */}
			<foreignObject x="1385" y="671" width="40" height="40">
				<picture>
					<source srcSet={avatar} media="(max-width: 600px)" />
					<img src={avatar} alt="Description of the image" width="40" height="40" style={{ borderRadius: '5px' }} />
				</picture>
			</foreignObject>
			<text x="1320" y="693" fontSize="14" fill="white" textAnchor="start" dominantBaseline="middle">
			{players[14]}
			</text>
			<path d="M1417.96 715H1394.04C1390.15 715 1387 718.151 1387 722.037V745.963C1387 749.849 1390.15 753 1394.04 753H1417.96C1421.85 753 1425 749.849 1425 745.963V722.037C1425 718.151 1421.85 715 1417.96 715Z" fill="#D9D9D9" fillOpacity="0.09" /> {/* player number 16 */}
			<foreignObject x="1385" y="714" width="40" height="40">
				<picture>
					<source srcSet={avatar} media="(max-width: 600px)" />
					<img src={avatar} alt="Description of the image" width="40" height="40" style={{ borderRadius: '5px' }} />
				</picture>
			</foreignObject>
			<text x="1320" y="736" fontSize="14" fill="white" textAnchor="start" dominantBaseline="middle">
			{players[15]}
			</text>
			<path d="M1293 237.571L1307.59 213H1427V239V272V299H1307.59L1293 272.893V255.232V237.571Z" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M1293 256.5L1427 256.5" stroke="white" strokeOpacity="0.68" strokeWidth="1.5" />
			<path d="M1417.96 216H1394.04C1390.15 216 1387 219.151 1387 223.037V246.963C1387 250.849 1390.15 254 1394.04 254H1417.96C1421.85 254 1425 250.849 1425 246.963V223.037C1425 219.151 1421.85 216 1417.96 216Z" fill="#D9D9D9" fillOpacity="0.09" /> {/* player number 9 */}
			<foreignObject x="1385" y="215" width="40" height="40">
				<picture>
					<source srcSet={avatar} media="(max-width: 600px)" />
					<img src={avatar} alt="Description of the image" width="40" height="40" style={{ borderRadius: '5px' }} />
				</picture>
			</foreignObject>
			<text x="1320" y="237" fontSize="14" fill="white" textAnchor="start" dominantBaseline="middle">
			{players[8]}
			</text>
			<path d="M1417.96 259H1394.04C1390.15 259 1387 262.151 1387 266.037V289.963C1387 293.849 1390.15 297 1394.04 297H1417.96C1421.85 297 1425 293.849 1425 289.963V266.037C1425 262.151 1421.85 259 1417.96 259Z" fill="#D9D9D9" fillOpacity="0.09" /> {/* player number 10 */}
			<foreignObject x="1385" y="258" width="40" height="40">
				<picture>
					<source srcSet={avatar} media="(max-width: 600px)" />
					<img src={avatar} alt="Description of the image" width="40" height="40" style={{ borderRadius: '5px' }} />
				</picture>
			</foreignObject>
			<text x="1320" y="280" fontSize="14" fill="white" textAnchor="	" dominantBaseline="middle">
			{players[9]}
			</text>
			<path d="M1286.2 256.253H1293.2" stroke="#B9A9B8" />
			<path d="M1285.2 560.253H1292.2" stroke="#B9A9B8" />
			<path d="M1285.2 408.253H1293.2" stroke="#B9A9B8" />
			<path d="M1284.2 712.253H1292.2" stroke="#B9A9B8" />
			<path d="M1285.7 255.753L1285.7 407.753" stroke="#B9A9B8" />
			<path d="M956.198 433.253H979.198" stroke="#B9A9B8" />
			<path d="M910.198 486.253H956.198" stroke="#B9A9B8" />
			<path d="M955.198 536.253H979.198" stroke="#B9A9B8" />
			<path d="M955.698 432.753L955.698 535.753" stroke="#B9A9B8" />
			<path d="M1127.2 332.253H1134.2" stroke="#B9A9B8" />
			<path d="M1127.2 636.253H1135.2" stroke="#B9A9B8" />
			<path d="M1112.2 433.253H1127.2" stroke="#B9A9B8" />
			<path d="M1111.2 536.253H1126.2" stroke="#B9A9B8" />
			<path d="M1126.7 331.753L1126.7 433.753" stroke="#B9A9B8" />
			<path d="M1126.7 535.753L1126.7 636.753" stroke="#B9A9B8" />
			<path d="M1284.7 559.753L1284.7 711.753" stroke="#B9A9B8" />
			<path d="M706.333 330H831.667C835.717 330 839 333.266 839 337.296V350.893V372.449V387.704C839 391.734 835.717 395 831.667 395H706.333C702.283 395 699 391.734 699 387.704V372.449V350.893V337.296C699 333.266 702.283 330 706.333 330Z" stroke="#FFD700" strokeWidth="2" />
			<path d="M716.735 98.1631H685.152C685.152 98.1631 678.504 196.89 753.027 196.89" stroke="#FFD700" strokeWidth="7" />
			<path d="M820.901 98.1631H850.821C850.821 98.1631 857.747 196.89 785.44 196.89" stroke="#FFD700" strokeWidth="7" />
			<path d="M738.068 265.998V259.416C738.068 255.796 740.561 252.835 743.885 252.835L755.244 249.544C760.785 233.089 761.893 223.546 761.062 210.053H758.291C754.967 210.053 752.474 207.091 752.474 203.142V192.941C721.722 177.144 715.351 119.225 715.351 85H823.395C823.395 119.554 817.023 177.474 786.272 192.941V203.142C786.272 207.091 783.502 210.053 780.454 210.053H778.238C777.407 223.546 778.238 233.418 783.779 249.544L797.908 252.835C800.955 252.835 803.726 255.796 803.726 259.416V265.998" stroke="#FFD700" strokeWidth="7" />
			<path d="M728.647 98.8223C728.647 98.8223 730.033 157.728 747.763 173.853" stroke="#FFD700" strokeWidth="7" />
			<path d="M792.92 265.998H809.82C812.867 265.998 820.625 282.452 820.625 282.452C820.625 286.072 818.131 289.034 815.36 289.034H726.432C723.385 289.034 721.167 286.072 721.167 282.452C721.167 282.452 728.925 265.998 731.972 265.998H748.871" stroke="#FFD700" strokeWidth="7" />
		</svg>





	);
}

export default LocalSvgComponent
