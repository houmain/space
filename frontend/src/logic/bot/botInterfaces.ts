export interface BotInfo {
	name: string;
	author: string;
	version: string;
}

export interface BotController {

	info: BotInfo;

	init(data: { [id: string]: any; }, actions: { [id: string]: Function; });

	startTest();
}