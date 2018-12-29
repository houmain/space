import { ClientMessage } from './clientMessages';
import { SpaceGameConfig } from './communicationHandler';

export interface CommunicationHandler {
	onConnected: Function;
	onDisconnected: Function;
	connect(gameConfig: SpaceGameConfig);
	send(msg: ClientMessage);
	close();
}