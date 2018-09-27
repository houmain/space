export enum ClientError {
	CONNECTION_FAILED
}

export function printCallstack(e: Error) {
	let stack = e.stack;
	console.log('PRINTING CALL STACK');
	console.log(stack);
}