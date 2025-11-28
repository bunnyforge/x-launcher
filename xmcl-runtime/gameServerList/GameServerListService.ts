import { GameServerListService as IGameServerListService, GameServerListServiceKey, GameRegion } from '@xmcl/runtime-api'
import { LauncherApp } from '../app/LauncherApp'
import { LauncherAppKey, Inject } from '~/app'
import { AbstractService, ExposeServiceKey } from '~/service'
import { request } from 'undici'
import { GAME_SERVER_CONFIG } from './config'

@ExposeServiceKey(GameServerListServiceKey)
export class GameServerListService extends AbstractService implements IGameServerListService {
  private apiUrl = GAME_SERVER_CONFIG.apiUrl

  constructor(@Inject(LauncherAppKey) app: LauncherApp) {
    super(app)
  }

  async getServerList(): Promise<GameRegion[]> {
    this.log('Fetching game server list from API')
    try {
      const response = await request(this.apiUrl, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'x-mc-launcher-token': GAME_SERVER_CONFIG.token,
        },
      })

      if (response.statusCode !== 200) {
        throw new Error(`Failed to fetch server list: ${response.statusCode}`)
      }

      const data = await response.body.json() as GameRegion[]
      this.log(`Fetched ${data.length} regions`)
      return data
    } catch (e) {
      this.error('Failed to fetch game server list', e)
      throw e
    }
  }
}
