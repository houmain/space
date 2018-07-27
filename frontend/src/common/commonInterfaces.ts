export interface Observer {
	subscribe(key: any, callback: Function);
	unsubscribe(key: any, callback: Function);
}