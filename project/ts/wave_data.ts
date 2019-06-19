interface IQuestData {
	bpm: number;
	bpqn: number;
	blockArr: IBlockData[];
}

interface IBlockData {
	key: string;
	noteArr: INoteData[];
}

interface INoteData {
	time: number;
	type: number;
	startX: number;
	startY: number;
	endX: number;
	endY: number;
}


class MidiHelper {
	/**
	 * 
	 * @param bpm beats per minute
	 * @param bpqn bit per quater note
	 * @param tick 
	 */
	static tickToMsec(bpm: number, bpqn: number, tick: number) {
		// return 1000 * tick * 60 / bpm / bpqn;
		return 1000 * tick * 60 / (bpm * bpqn);
	}
}

/**
 * bmp 120
 * 0.5 = x * 60 / 120 / 480
 * 0.5 = 480 * 60 / 120 / 480
 * 
 * bmp 60
 * 1 = 480 * 60 / 60 / 480
 * 
 * 
 */
const blockDataArr: IBlockData[] = [
	{
		"key": "blc1",
		"noteArr": [
			{ "time": 480 * 0, "type": 1, "startX": -0.5, "startY": -0.5, "endX": 0.5, "endY": -0.5, },
			{ "time": 480 * 2, "type": 1, "startX": -0.5, "startY": 0.5, "endX": 0.5, "endY": 0.5, },
			{ "time": 480 * 3, "type": 2, "startX": 0, "startY": 0, "endX": 0, "endY": 0, },
		],
	},
	{
		"key": "blc2",
		"noteArr": [
			{ "time": 480 * 0, "type": 1, "startX": -0.5, "startY": -0.5, "endX": 0.5, "endY": 0.5, },
			{ "time": 480 * 2, "type": 1, "startX": 0.5, "startY": -0.5, "endX": -0.5, "endY": 0.5, },
			{ "time": 480 * 3, "type": 2, "startX": 0, "startY": 0, "endX": 0, "endY": 0, },
		],
	},
	{
		"key": "blc3",
		"noteArr": [
			{ "time": 480 * 0, "type": 1, "startX": -0.25, "startY": -0.25, "endX": 0.25, "endY": 0.25, },
			{ "time": 480 * 1, "type": 1, "startX": 0.25, "startY": -0.25, "endX": -0.25, "endY": 0.25, },
			{ "time": 480 * 2, "type": 1, "startX": 0.0, "startY": -0.5, "endX": 0.0, "endY": 0.5, },
			{ "time": 480 * 3, "type": 2, "startX": 0, "startY": 0, "endX": 0, "endY": 0, },
		],
	},
	{
		"key": "blc4", // > > >
		"noteArr": [
			{ "time": 480 * 0, "type": 1, "startX": -0.5, "startY": -0.5, "endX": 0.5, "endY": -0.5, },
			{ "time": 480 * 1, "type": 1, "startX": -0.5, "startY": 0.0, "endX": 0.5, "endY": 0.0, },
			{ "time": 480 * 2, "type": 1, "startX": -0.5, "startY": 0.5, "endX": 0.5, "endY": 0.5, },
			{ "time": 480 * 3, "type": 2, "startX": 0, "startY": 0, "endX": 0, "endY": 0, },
		],
	},
	{
		"key": "blc5", // < > <
		"noteArr": [
			{ "time": 480 * 0, "type": 1, "startX": 0.5, "startY": -0.5, "endX": -0.5, "endY": -0.5, },
			{ "time": 480 * 1, "type": 1, "startX": -0.5, "startY": 0.0, "endX": 0.5, "endY": 0.0, },
			{ "time": 480 * 2, "type": 1, "startX": 0.5, "startY": 0.5, "endX": -0.5, "endY": 0.5, },
			{ "time": 480 * 3, "type": 2, "startX": 0, "startY": 0, "endX": 0, "endY": 0, },
		],
	},
	{
		"key": "blc6", // v v v
		"noteArr": [
			{ "time": 480 * 0, "type": 1, "startX": -0.5, "startY": -0.5, "endX": -0.5, "endY": 0.5, },
			{ "time": 480 * 1, "type": 1, "startX": 0.0, "startY": -0.5, "endX": 0.0, "endY": 0.5, },
			{ "time": 480 * 2, "type": 1, "startX": 0.5, "startY": -0.5, "endX": 0.5, "endY": 0.5, },
			{ "time": 480 * 3, "type": 2, "startX": 0, "startY": 0, "endX": 0, "endY": 0, },
		],
	},
	{
		"key": "blc7", // ^ v ^
		"noteArr": [
			{ "time": 480 * 0, "type": 1, "startX": -0.5, "startY": 0.5, "endX": -0.5, "endY": -0.5, },
			{ "time": 480 * 1, "type": 1, "startX": 0.0, "startY": -0.5, "endX": 0.0, "endY": 0.5, },
			{ "time": 480 * 2, "type": 1, "startX": 0.5, "startY": 0.5, "endX": 0.5, "endY": -0.5, },
			{ "time": 480 * 3, "type": 2, "startX": 0, "startY": 0, "endX": 0, "endY": 0, },
		],
	},
	{
		"key": "blc8", // \ v / - \ | /
		"noteArr": [
			{ "time": 480 * 0, "type": 1, "startX": -0.5, "startY": -0.5, "endX": 0.5, "endY": 0.5, },
			{ "time": 480 * 1, "type": 1, "startX": 0.0, "startY": -0.5, "endX": 0.0, "endY": 0.5, },
			{ "time": 480 * 2, "type": 1, "startX": 0.5, "startY": -0.5, "endX": -0.5, "endY": 0.5, },
			{ "time": 480 * 3, "type": 2, "startX": 0, "startY": 0, "endX": 0, "endY": 0, },
		],
	},
	{
		"key": "blc9", // \ v / - \ | /
		"noteArr": [
			{ "time": 480 * 0, "type": 1, "startX": 0.5, "startY": 0.5, "endX": -0.5, "endY": -0.5, },
			{ "time": 480 * 1, "type": 1, "startX": 0.0, "startY": 0.5, "endX": 0.0, "endY": -0.5, },
			{ "time": 480 * 2, "type": 1, "startX": -0.5, "startY": 0.5, "endX": 0.5, "endY": -0.5, },
			{ "time": 480 * 3, "type": 2, "startX": 0, "startY": 0, "endX": 0, "endY": 0, },
		],
	},
	{
		"key": "blc10", // | -
		"noteArr": [
			{ "time": 480 * 0, "type": 1, "startX": 0.0, "startY": -0.25, "endX": 0.0, "endY": 0.25, },
			{ "time": 480 * 4, "type": 1, "startX": -0.25, "startY": 0.0, "endX": 0.25, "endY": 0.0, },
			{ "time": 480 * 7, "type": 2, "startX": 0, "startY": 0, "endX": 0, "endY": 0, },
		],
	},
	{
		"key": "blc11", // \ v / - \ | /
		"noteArr": [
			{ "time": 480 * 0, "type": 1, "startX": -0.5, "startY": -0.5, "endX": 0.5, "endY": 0.5, },
			{ "time": 480 * 1, "type": 1, "startX": 0.0, "startY": -0.5, "endX": 0.0, "endY": 0.5, },
			{ "time": 480 * 2, "type": 1, "startX": 0.5, "startY": -0.5, "endX": -0.5, "endY": 0.5, },
			{ "time": 480 * 3, "type": 1, "startX": 0.5, "startY": 0.0, "endX": -0.5, "endY": 0.0, },
			{ "time": 480 * 4, "type": 1, "startX": 0.5, "startY": 0.5, "endX": -0.5, "endY": -0.5, },
			{ "time": 480 * 5, "type": 1, "startX": 0.0, "startY": 0.5, "endX": 0.0, "endY": -0.5, },
			{ "time": 480 * 6, "type": 1, "startX": -0.5, "startY": 0.5, "endX": 0.5, "endY": -0.5, },
			{ "time": 480 * 7, "type": 2, "startX": 0, "startY": 0, "endX": 0, "endY": 0, },
		],
	},
];

const blockDataDict = (() => {
	const dict: {[key: string]: IBlockData} = {};
	blockDataArr.forEach(value => {
		dict[value.key] = value;
	});
	return dict;
})();

const questDataArr: IQuestData[] = [
	{
		"bpm": 120,
		"bpqn": 480,
		"blockArr": [
			blockDataDict["blc1"],
			blockDataDict["blc2"],
			blockDataDict["blc3"],
			blockDataDict["blc4"],
			blockDataDict["blc5"],
			blockDataDict["blc6"],
			blockDataDict["blc7"],
			blockDataDict["blc8"],
			blockDataDict["blc9"],
			blockDataDict["blc10"],
			blockDataDict["blc11"],
		],
	},
];

