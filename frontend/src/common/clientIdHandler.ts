import { CookieHelper, GuidHelper } from './utils';

export class ClientIdHandler {

	public static getClientId(): string {
		const CLIENT_ID_COOKIE = 'clientId';

		let clientId = CookieHelper.getCookie(CLIENT_ID_COOKIE);
		if (!clientId) {
			clientId = GuidHelper.newGuid();
			CookieHelper.setCookie(CLIENT_ID_COOKIE, clientId, 365);
		}

		return clientId;
	}
}